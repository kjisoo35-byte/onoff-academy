'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sensorAssessment = require('./sensor-assessment.js');

const COURSE_CATALOG = Object.freeze({
  platform: ['philosophy', 'workflow', 'daily-work', 'safety-report'],
  risk: ['risk-assessment-purpose', 'risk-assessment-structure', 'risk-assessment-stra', 'risk-assessment-platform'],
  practical: ['risk-practical-01', 'risk-practical-02', 'risk-practical-03', 'risk-practical-04'],
  sop: ['sop-purpose', 'sop-reading', 'sop-structure', 'sop-platform'],
  tbm: ['tbm-nine-steps', 'tbm-scenario', 'tbm-life-rules'],
  special: ['special-robot-work', 'special-live-work-75v', 'special-hazardous-chemicals', 'special-cargo-handling'],
  [sensorAssessment.courseId]: sensorAssessment.lessonIds
});

const safeIso = (value, fallback = null) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : fallback;
};

const emptyRecord = (identity, now) => ({
  schemaVersion: 2,
  revision: 0,
  user: { id: identity.id, name: identity.name || identity.id, role: identity.role || 'learner', organization: identity.organization || null },
  courses: Object.fromEntries(Object.entries(COURSE_CATALOG).map(([courseId, lessonIds]) => [courseId, {
    state: 'NOT_STARTED', progressPercent: 0, officiallyCompleted: false, startedAt: null, lastActivityAt: null, completedAt: null, lastLessonId: null,
    lessons: Object.fromEntries(lessonIds.map((lessonId) => [lessonId, { state: 'NOT_STARTED', startedAt: null, lastActivityAt: null, completedAt: null }])),
    practices: sensorAssessment.initialPractices(courseId)
  }])),
  processedEvents: {},
  createdAt: now,
  updatedAt: now
});


// Older JSON records gain the new course when read. Existing lesson IDs, progress,
// event IDs and revisions are kept, and a read does not rewrite the record.
const addSensorCourse = (record, now) => {
  const { courseId, practiceId } = sensorAssessment;
  const sensor = record.courses[courseId] ||= emptyRecord(record.user, now).courses[courseId];
  sensor.practices[practiceId] ||= sensorAssessment.unattemptedPractice();
  return record;
};

const recomputeCourse = (courseId, course, now) => {
  const lessons = Object.values(course.lessons);
  const completed = lessons.filter((lesson) => lesson.state === 'COMPLETED').length;
  course.progressPercent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  course.state = completed === lessons.length ? 'COMPLETED' : lessons.some((lesson) => lesson.state !== 'NOT_STARTED') ? 'IN_PROGRESS' : 'NOT_STARTED';
  const requiredPractices = Object.values(course.practices).filter((practice) => practice.required);
  const practicePassed = requiredPractices.every((practice) => practice.passed);
  course.officiallyCompleted = course.state === 'COMPLETED' && practicePassed
    && sensorAssessment.requiredConditionsMet(courseId, course);
  if (course.officiallyCompleted) course.completedAt ||= now;
};

class LearningProgressStore {
  constructor(filePath, { now = () => new Date().toISOString() } = {}) {
    this.filePath = filePath;
    this.now = now;
    this.state = { schemaVersion: 1, users: {} };
    this.load();
  }

  load() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (parsed?.schemaVersion === 1 && parsed.users && typeof parsed.users === 'object') this.state = parsed;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  persist() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(this.state, null, 2));
    try {
      fs.renameSync(temporary, this.filePath);
    } catch (error) {
      if (!['EPERM', 'EACCES'].includes(error.code)) throw error;
      fs.copyFileSync(temporary, this.filePath);
      fs.unlinkSync(temporary);
    }
  }

  get(identity) {
    const now = this.now();
    if (!this.state.users[identity.id]) {
      this.state.users[identity.id] = emptyRecord(identity, now);
      this.persist();
    }
    return addSensorCourse(structuredClone(this.state.users[identity.id]), now);
  }

  apply(identity, event) {
    if (!event?.id || !event.type) throw Object.assign(new Error('invalid_event'), { statusCode: 400 });
    const record = addSensorCourse(structuredClone(this.state.users[identity.id] || emptyRecord(identity, this.now())), this.now());
    if (record.processedEvents[event.id]) return structuredClone(record);
    const course = record.courses[event.courseId];
    if (!course) throw Object.assign(new Error('unknown_course'), { statusCode: 400 });
    const now = safeIso(event.occurredAt, this.now());
    if (event.type.startsWith('lesson.')) {
      const lesson = course.lessons[event.lessonId];
      if (!lesson) throw Object.assign(new Error('unknown_lesson'), { statusCode: 400 });
      lesson.startedAt ||= now;
      lesson.lastActivityAt = now;
      course.startedAt ||= now;
      course.lastActivityAt = now;
      course.lastLessonId = event.lessonId;
      if (event.type === 'lesson.completed') {
        lesson.state = 'COMPLETED';
        lesson.completedAt ||= now;
      } else if (lesson.state === 'NOT_STARTED') lesson.state = 'IN_PROGRESS';
    } else if (event.type === 'practice.required' || event.type === 'practice.result') {
      if (!event.practiceId) throw Object.assign(new Error('unknown_practice'), { statusCode: 400 });
      const graded = sensorAssessment.gradePracticeEvent(event);
      const previous = course.practices[graded.practiceId] || {};
      course.practices[event.practiceId] = {
        required: graded.required !== false,
        passed: previous.passed || (event.type === 'practice.result' && Boolean(graded.passed)),
        score: Math.max(Number(previous.score || 0), Number(graded.score || 0)),
        attempts: Number(previous.attempts || 0) + (event.type === 'practice.result' ? 1 : 0),
        lastAttemptAt: event.type === 'practice.result' ? now : (previous.lastAttemptAt || null),
        passedAt: previous.passedAt || (event.type === 'practice.result' && graded.passed ? now : null)
      };
      course.startedAt ||= now;
      course.lastActivityAt = now;
    } else throw Object.assign(new Error('unsupported_event'), { statusCode: 400 });
    recomputeCourse(event.courseId, course, now);
    record.processedEvents[event.id] = now;
    record.revision += 1;
    record.updatedAt = now;
    this.state.users[identity.id] = record;
    this.persist();
    return structuredClone(record);
  }

  importLegacy(identity, legacy) {
    if (!legacy?.courses || typeof legacy.courses !== 'object') return this.get(identity);
    let record = this.get(identity);
    for (const [courseId, course] of Object.entries(legacy.courses)) {
      for (const [lessonId, lesson] of Object.entries(course?.learnings || {})) {
        if (!record.courses[courseId]?.lessons[lessonId] || lesson.state === 'NOT_STARTED') continue;
        record = this.apply(identity, {
          id: `legacy:${identity.id}:${courseId}:${lessonId}:${lesson.state}`,
          type: lesson.state === 'COMPLETED' ? 'lesson.completed' : 'lesson.entered', courseId, lessonId,
          occurredAt: lesson.completedAt || legacy.updatedAt || this.now()
        });
      }
    }
    return record;
  }

  summary(filters = {}) {
    const rows = Object.values(this.state.users).flatMap((record) => Object.entries(addSensorCourse(structuredClone(record), this.now()).courses).map(([courseId, course]) => ({
      userId: record.user.id, name: record.user.name, organization: record.user.organization, courseId,
      state: course.state, progressPercent: course.progressPercent, officiallyCompleted: course.officiallyCompleted,
      lastLessonId: course.lastLessonId, lastActivityAt: course.lastActivityAt, completedAt: course.completedAt,
      ...sensorAssessment.adminPractice(courseId, course)
    })));
    return rows.filter((row) => (!filters.courseId || row.courseId === filters.courseId)
      && (!filters.state || row.state === filters.state)
      && (!filters.organization || row.organization === filters.organization)
      && (!filters.query || `${row.name} ${row.userId} ${row.courseId}`.toLowerCase().includes(filters.query.toLowerCase())));
  }
}

const eventId = () => crypto.randomUUID();

module.exports = { COURSE_CATALOG, LearningProgressStore, eventId };
