'use strict';

const courseId = 'sensor-npn';
const lessonIds = Object.freeze([
  'sensor-npn-orientation', 'sensor-npn-voltage-current', 'sensor-npn-dc-wiring',
  'sensor-npn-inside-npn', 'sensor-npn-plc-com', 'sensor-npn-connection',
  'sensor-npn-diagnosis', 'sensor-npn-review'
]);
const practiceId = 'sensor-npn-diagnosis:assessment';

const unattemptedPractice = () => ({
  required: true, passed: false, score: 0, attempts: 0, lastAttemptAt: null, passedAt: null
});
const initialPractices = id => id === courseId ? { [practiceId]: unattemptedPractice() } : {};
const requiredConditionsMet = (id, course) => id !== courseId
  || (course.practices[practiceId]?.passed === true && lessonIds.every(lessonId => course.lessons[lessonId]?.state === 'COMPLETED'));

function gradePracticeEvent(event) {
  if (event.courseId !== courseId) return event;
  if (event.practiceId !== practiceId) throw Object.assign(new Error('unknown_practice'), { statusCode: 400 });
  if (event.type === 'practice.required') return { ...event, required: true, passed: false, score: 0 };
  if (!['0', '1', '2'].includes(event.answer)) throw Object.assign(new Error('invalid_practice_answer'), { statusCode: 400 });
  const passed = event.answer === '1';
  return { ...event, required: true, passed, score: passed ? 100 : 0 };
}

const adminPractice = (id, course) => id === courseId ? { practice: course.practices[practiceId] } : {};

module.exports = {
  courseId, lessonIds, practiceId, unattemptedPractice, initialPractices, requiredConditionsMet,
  gradePracticeEvent, adminPractice
};
