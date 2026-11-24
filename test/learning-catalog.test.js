const test=require('node:test');const assert=require('node:assert/strict');
const {catalog,courseState,filter,continuation}=require('../components/learning-catalog.js');
const {COURSE_CATALOG}=require('../lib/learning-progress.js');
const source=Object.entries(COURSE_CATALOG).map(([id,lessonIds])=>({id,title:id,description:id,route:id+'-course',lessonIds,chapters:lessonIds.map((id,index)=>[id,'학습 '+(index+1)])}));
const courses=catalog(source);
function record(overrides={}){return {courses:Object.fromEntries(source.map(c=>[c.id,{state:'NOT_STARTED',progressPercent:0,officiallyCompleted:false,lastLessonId:null,lessons:Object.fromEntries(c.lessonIds.map(id=>[id,{state:'NOT_STARTED'}])),...overrides[c.id]}]))};}
test('existing six course IDs and 23 server lesson IDs stay intact; sensor is only an example',()=>{
 assert.equal(source.flatMap(c=>c.lessonIds).length,23);assert.deepEqual(courses.filter(c=>c.registered).map(c=>c.id),source.map(c=>c.id));
 for(const c of courses.filter(c=>c.registered))assert.deepEqual(c.lessonIds,COURSE_CATALOG[c.id]);
 const sensor=courses.find(c=>!c.registered);assert.equal(sensor.id,undefined);assert.equal(sensor.route,undefined);assert.deepEqual(sensor.lessonIds,[]);assert.ok(!courses.find(c=>c.id==='platform').title.includes('센서'));
});
test('only authoritative server percentages and official completion become known state',()=>{
 const c=courses[0],r=record({platform:{state:'COMPLETED',progressPercent:100,officiallyCompleted:false}});
 assert.equal(courseState(c,r,true).label,'학습 완료 · 이수 대기');assert.equal(courseState(c,r,true).official,false);
 r.courses.platform.officiallyCompleted=true;assert.equal(courseState(c,r,true).label,'공식 이수 완료');
 assert.equal(courseState(c,r,false).percent,null);assert.equal(courseState(c,{},true).known,false);
});
test('continuation follows a valid server lastLessonId and ignores unknown IDs',()=>{
 const c=courses.find(c=>c.id==='risk'),r=record({risk:{state:'IN_PROGRESS',progressPercent:50,lastLessonId:'risk-assessment-stra'}});
 assert.equal(courseState(c,r,true).target,'risk-assessment-stra');r.courses.risk.lastLessonId='foreign-lesson';assert.equal(courseState(c,r,true).target,'risk-assessment-purpose');
});
test('resume uses the most recently active known course',()=>{
 const r=record({platform:{state:'IN_PROGRESS',progressPercent:25,lastActivityAt:'2026-11-22'},risk:{state:'IN_PROGRESS',progressPercent:50,lastActivityAt:'2026-11-23'}});
 const states=Object.fromEntries(courses.map(c=>[c.key,courseState(c,r,true)]));assert.equal(continuation(courses,states).id,'risk');
});
test('category and case-normalized keyword search intersect on the same data',()=>{
 const states={};assert.equal(filter(courses,states,{category:'electrical'}).length,1);assert.equal(filter(courses,states,{category:'equipment',query:'sop'}).length,1);assert.equal(filter(courses,states,{category:'safety',query:'SOP'}).length,0);assert.equal(filter(courses,states,{query:'ＴＢＭ'}).length,1);
});
test('Practice.required never implies that a course is assigned as mandatory',()=>{
 const r=record({practical:{practices:{diagnostic:{required:true}}}}),states=Object.fromEntries(courses.map(c=>[c.key,courseState(c,r,true)]));
 assert.equal(states.practical.required,null);assert.equal(filter(courses,states,{requiredOnly:true}).length,0);
});
test('mine and sort filters do not mutate source records or the source catalog',()=>{
 const r=record({risk:{state:'IN_PROGRESS',progressPercent:50}}),states=Object.fromEntries(courses.map(c=>[c.key,courseState(c,r,true)]));const before=JSON.stringify([courses,r]);
 assert.deepEqual(filter(courses,states,{mineOnly:true}).map(c=>c.id),['risk']);filter(courses,states,{sort:'title'});assert.equal(JSON.stringify([courses,r]),before);
});
test('dozens of registered courses need no changes to Home structure or filtering code',()=>{
 const expanded=catalog(Array.from({length:60},(_,i)=>({id:'future-'+i,title:'추가 과정 '+i,description:'교육',category:i%2?'equipment':'safety',route:'future-'+i,chapters:[['lesson-'+i,'학습']]})));
 assert.equal(expanded.filter(c=>c.registered).length,60);assert.equal(filter(expanded,{}, {category:'equipment'}).length,30);assert.equal(filter(expanded,{}, {query:'추가 과정 59'}).length,1);
});
