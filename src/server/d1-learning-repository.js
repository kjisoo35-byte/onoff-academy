const COURSE_CATALOG = Object.freeze({
  platform: ['philosophy', 'workflow', 'daily-work', 'safety-report'],
  risk: ['risk-assessment-purpose', 'risk-assessment-structure', 'risk-assessment-stra', 'risk-assessment-platform'],
  practical: ['risk-practical-01', 'risk-practical-02', 'risk-practical-03', 'risk-practical-04'],
  sop: ['sop-purpose', 'sop-reading', 'sop-structure', 'sop-platform'],
  tbm: ['tbm-nine-steps', 'tbm-scenario', 'tbm-life-rules'],
  special: ['special-robot-work', 'special-live-work-75v', 'special-hazardous-chemicals', 'special-cargo-handling']
});

const SENSOR_COURSE_ID = 'sensor-npn';
export const SENSOR_PROGRESS_READ_ONLY = 'sensor_progress_read_only';
export const includesSensorProgress = legacy => Object.hasOwn(legacy?.courses ?? {}, SENSOR_COURSE_ID);

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const sensorProgressReadOnly = () => error(SENSOR_PROGRESS_READ_ONLY, 409);
const safeIso = (value, fallback) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : fallback;
};
const emptyRecord = (identity, now) => ({
  schemaVersion: 2, revision: 0,
  user: { id: identity.id, name: identity.name || identity.id, role: identity.role || 'learner', organization: identity.organization || null },
  courses: Object.fromEntries(Object.entries(COURSE_CATALOG).map(([courseId, lessonIds]) => [courseId, {
    state: 'NOT_STARTED', progressPercent: 0, officiallyCompleted: false, startedAt: null, lastActivityAt: null, completedAt: null, lastLessonId: null,
    lessons: Object.fromEntries(lessonIds.map(lessonId => [lessonId, { state: 'NOT_STARTED', startedAt: null, lastActivityAt: null, completedAt: null }])), practices: {}
  }])),
  processedEvents: {}, createdAt: now, updatedAt: now
});
const recomputeCourse = (course, now) => {
  const lessons = Object.values(course.lessons);
  const completed = lessons.filter(lesson => lesson.state === 'COMPLETED').length;
  course.progressPercent = lessons.length ? Math.round(completed / lessons.length * 100) : 0;
  course.state = completed === lessons.length ? 'COMPLETED' : lessons.some(lesson => lesson.state !== 'NOT_STARTED') ? 'IN_PROGRESS' : 'NOT_STARTED';
  course.officiallyCompleted = course.state === 'COMPLETED' && Object.values(course.practices).filter(practice => practice.required).every(practice => practice.passed);
  if (course.officiallyCompleted) course.completedAt ||= now;
};

export class D1LearningRepository {
  constructor(db, { now = () => new Date().toISOString() } = {}) { this.db = db; this.now = now; }

  async ensure(identity) {
    const now = this.now();
    await this.db.prepare(`INSERT INTO academy_users (user_id, display_name, role, organization, work_line, shift_group, source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'WORK', ?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name, role=excluded.role,
      organization=excluded.organization, work_line=excluded.work_line, shift_group=excluded.shift_group, updated_at=excluded.updated_at`)
      .bind(identity.id, identity.name || identity.id, identity.role || 'learner', identity.organization || null, identity.workLine || null, identity.shiftGroup || null, now).run();
    await this.db.prepare(`INSERT OR IGNORE INTO academy_learning_records (user_id, record_json, revision, updated_at) VALUES (?, ?, 0, ?)`)
      .bind(identity.id, JSON.stringify(emptyRecord(identity, now)), now).run();
  }

  async get(identity) {
    await this.ensure(identity);
    const row = await this.db.prepare('SELECT record_json FROM academy_learning_records WHERE user_id=?').bind(identity.id).first();
    return JSON.parse(row.record_json);
  }

  async apply(identity, event) {
    if (event?.courseId === SENSOR_COURSE_ID) throw sensorProgressReadOnly();
    if (!event?.id || !event.type) throw error('invalid_event');
    await this.ensure(identity);
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const row = await this.db.prepare('SELECT record_json, revision FROM academy_learning_records WHERE user_id=?').bind(identity.id).first();
      const record = JSON.parse(row.record_json);
      if (record.processedEvents[event.id]) return record;
      const course = record.courses[event.courseId];
      if (!course) throw error('unknown_course');
      const now = safeIso(event.occurredAt, this.now());
      if (event.type.startsWith('lesson.')) {
        const lesson = course.lessons[event.lessonId];
        if (!lesson) throw error('unknown_lesson');
        lesson.startedAt ||= now; lesson.lastActivityAt = now; course.startedAt ||= now; course.lastActivityAt = now; course.lastLessonId = event.lessonId;
        if (event.type === 'lesson.completed') { lesson.state = 'COMPLETED'; lesson.completedAt ||= now; }
        else if (event.type === 'lesson.entered' && lesson.state === 'NOT_STARTED') lesson.state = 'IN_PROGRESS';
        else if (event.type !== 'lesson.entered') throw error('unsupported_event');
      } else if (event.type === 'practice.required' || event.type === 'practice.result') {
        if (!event.practiceId) throw error('unknown_practice');
        const previous = course.practices[event.practiceId] || {};
        course.practices[event.practiceId] = { required: event.required !== false, passed: previous.passed || (event.type === 'practice.result' && Boolean(event.passed)),
          score: Math.max(Number(previous.score || 0), Number(event.score || 0)), attempts: Number(previous.attempts || 0) + (event.type === 'practice.result' ? 1 : 0),
          lastAttemptAt: event.type === 'practice.result' ? now : previous.lastAttemptAt || null, passedAt: previous.passedAt || (event.type === 'practice.result' && event.passed ? now : null) };
        course.startedAt ||= now; course.lastActivityAt = now;
      } else throw error('unsupported_event');
      recomputeCourse(course, now);
      record.processedEvents[event.id] = now; record.revision = Number(row.revision) + 1; record.updatedAt = now;
      const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(event))).then(buffer => [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, '0')).join(''));
      const result = await this.db.prepare('UPDATE academy_learning_records SET record_json=?, revision=?, updated_at=? WHERE user_id=? AND revision=?')
        .bind(JSON.stringify(record), record.revision, now, identity.id, row.revision).run();
      if (result?.meta?.changes === 1 || result?.changes === 1) {
        await this.db.prepare(`INSERT OR IGNORE INTO academy_progress_events (event_id,user_id,event_type,course_id,lesson_id,practice_id,payload_hash,occurred_at,received_at,applied_at)
          VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(event.id, identity.id, event.type, event.courseId, event.lessonId || null, event.practiceId || null, payloadHash, now, this.now(), now).run();
        return record;
      }
    }
    throw error('concurrent_update_conflict', 409);
  }

  async importLegacy(identity, legacy) {
    const courses = legacy?.courses && typeof legacy.courses === 'object' ? Object.entries(legacy.courses) : [];
    if (includesSensorProgress(legacy) && !courses.some(([courseId]) => Object.hasOwn(COURSE_CATALOG, courseId))) {
      throw sensorProgressReadOnly();
    }
    let record = await this.get(identity);
    for (const [courseId, course] of courses.filter(([courseId]) => courseId !== SENSOR_COURSE_ID)) for (const [lessonId, lesson] of Object.entries(course?.learnings || {})) {
      if (!record.courses[courseId]?.lessons[lessonId] || lesson.state === 'NOT_STARTED') continue;
      record = await this.apply(identity, { id: `legacy:${identity.id}:${courseId}:${lessonId}:${lesson.state}`, type: lesson.state === 'COMPLETED' ? 'lesson.completed' : 'lesson.entered', courseId, lessonId, occurredAt: lesson.completedAt || legacy.updatedAt || this.now() });
    }
    return record;
  }

  async summary(filters = {}) {
    const result = await this.db.prepare(`SELECT r.record_json FROM academy_learning_records r JOIN academy_users u ON u.user_id=r.user_id
      WHERE (?='' OR u.organization=?)`).bind(filters.organization || '', filters.organization || '').all();
    return (result.results || []).flatMap(row => {
      const record = JSON.parse(row.record_json);
      return Object.entries(record.courses).map(([courseId, course]) => ({ userId: record.user.id, name: record.user.name, organization: record.user.organization, courseId,
        state: course.state, progressPercent: course.progressPercent, officiallyCompleted: course.officiallyCompleted, lastLessonId: course.lastLessonId,
        lastActivityAt: course.lastActivityAt, completedAt: course.completedAt }));
    }).filter(row => (!filters.courseId || row.courseId === filters.courseId) && (!filters.state || row.state === filters.state)
      && (!filters.query || `${row.name} ${row.userId} ${row.courseId}`.toLowerCase().includes(filters.query.toLowerCase())));
  }
}
