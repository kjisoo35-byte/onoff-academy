# Practice·학습 완료 관계 — 읽기 전용 조사

2026-11-23 / 기준본 `8d80483` 대 `codex/academy-unified-development` / 정책 변경 없음

## 결론과 구분

| 구분 | 판단 |
| --- | --- |
| 정상 동작 | Core는 Lesson 진척 완료와 공식 과정 이수를 별도 값으로 저장한다. 등록된 필수 Practice가 미통과이면 학습 진척 100%여도 `officiallyCompleted=false`다. |
| 설계 미확정 | 교안에서 ‘자가진단’이라 부르는 문답을 선택 학습으로 볼지 필수 평가로 볼지, Lesson 완료까지 막아야 하는지 기준이 명시적으로 정리되지 않았다. ‘문제를 안 풀고 학습 완료’만으로 정책 위반이라고 단정할 수 없다. |
| 실제 결함 | Practical·TBM·Special 전용 정답 확인 버튼이 공통 결과 전송 리스너에서 빠져 있다. 필수 평가 등록도 DOM/화면 폭에 의존해 누락된다. 필수 평가가 아예 등록되지 않으면 서버는 미평가 상태를 알지 못하고 모든 Lesson 완료만으로 공식 이수를 허용한다. 기준본에도 있는 P1 Integrity 공백이다. |

이미지 Hotfix로 생긴 회귀가 아니다. 390px·1366px 각각에서 세 과정의 이벤트·진척·이수 동작을 기준본과 통합본으로 대조했고 일치했다. Production HOLD 및 기존 P1 Integrity HOLD를 유지한다.

## 버튼이 호출하는 것

1. Practical `[data-risk-practical-check]`, TBM `[data-tbm-check]`, Special `[data-special-check]`는 각자 정답·오답 피드백과 일부 화면 잠금을 처리한다.
2. 서버 Practice 전송용 공통 리스너는 `[data-ready-check],[data-figma-check],.practice-check`만 감시한다. 위 세 전용 버튼은 여기에 포함되지 않는다. 선택·정답 확인을 실제로 클릭한 테스트에서도 해당 `practice.result`가 발생하지 않았다. 모바일에 그 체크 UI가 보이지 않는 경우는 결과 전송 PASS로 세지 않았다.
3. `[data-learning-complete]`와 `[data-complete-on-navigation]`는 `markLearningCompleted`를 통해 `lesson.completed`를 전송한다. 이 함수는 Practice 응답·점수를 검사하지 않는다.
4. `markLearningEntered`는 챕터에 `[data-ready-section="practice"],.risk-practice,.special-education-practice`가 있으면 `practice.required`를 전송한다. 평가 목록을 서버가 미리 등록하는 구조가 아니다.

## 실제 등록 상태

| 과정 | 390px | 1366px | 관찰 |
| --- | --- | --- | --- |
| Practical | 01·02·03의 `:practice` 등록 | 동일 | 04의 `practice-01`·`practice-02`는 정확히 `practice`인 selector에 포함되지 않아 등록 누락 |
| TBM | 등록 없음 | 마지막 `tbm-life-rules:practice`만 등록 | 필수 등록이 PC 전용 DOM 생성 여부에 따라 달라짐 |
| Special | 로봇·전기·화학·중량물 4개 등록 | 동일 | 등록은 있으나 전용 정답 확인 결과가 공통 전송 이벤트로 이어지지 않음 |

서버 ‘필수’는 현재 저장된 레코드의 `practices[id].required`를 의미한다. 교안 제목에 PRACTICE가 있거나 자가진단을 표시한다고 자동으로 필수 평가가 되는 것은 아니다.

## 문답 없이 완료했을 때

- Practical은 두 폭 모두 문답 없이 실제 완료/다음 링크를 눌러 `25 → 50 → 75 → 100%`, `state=COMPLETED`를 기록했다. 등록된 01–03 Practice가 미통과여서 **공식 이수는 false**였다.
- TBM은 테스트한 노출 액션으로 67%까지 기록됐다. PC 마지막 완료 링크는 답을 확인하기 전 UI에서 잠겼다. 모바일에서는 동일한 체크/완료 UI가 모두 노출되지 않았다. 이 경로를 전체 과정 완료로 오인하지 않는다.
- Special은 PC의 노출된 다음/완료 링크로 문답 없이 100%까지 기록했지만 공식 이수는 false였다. 모바일에서는 이 테스트가 찾은 직접 완료 액션이 노출되지 않아 0%였다. 학습 콘텐츠 수정 없이 관찰만 기록했다.
- UI의 `statePresentation.COMPLETED.course`는 ‘이수완료’로 지정되어 있으며, 학습자 표시가 Lesson 합산 상태를 사용한다. 관리자 표시는 서버 `officiallyCompleted`를 따르므로 **학습 완료와 공식 이수 표시가 혼동될 수 있는 기존 표시 결함**이다.

## 서버에서 요구사항이 누락되는 경우

새 격리 레코드로 각 과정의 모든 `lesson.completed`만 적용했다. 세 과정 모두 등록 Practice가 없으면 `progressPercent=100`, `officiallyCompleted=true`가 됐다. 같은 테스트에서 미통과 필수 Practice 하나를 먼저 등록하면 공식 이수는 false였다.

이는 운영 계정이나 운영 DB에 수행한 호출이 아니다. 로컬 `LearningProgressStore`의 새 fixture만 사용했다. D1 구현도 같은 ‘등록된 required만 검사’ 구조임을 소스로 확인했으며 운영 DB에는 연결하지 않았다. 서버가 고정된 필수 평가 목록을 모르면, 미등록 평가와 ‘평가 없음’을 구별할 수 없는 것이 핵심이다.

## 개선안 — 이번에는 구현하지 않음

1. 자가진단은 설명·연습용인지 필수 평가인지 콘텐츠 계약에서 먼저 구분한다. 선택 자가진단은 공식 이수 조건과 분리하고 UI에 명시한다.
2. 필수 평가는 과정/버전/평가 ID·통과 기준을 서버 카탈로그에 등록한다. 진입 화면이나 DOM selector가 필수 조건을 결정하지 않도록 한다.
3. 각 전용 버튼은 명시적 평가 결과 이벤트로 연결한다. 복수 문제의 제출·시도·통과를 모두 집계하고 재시도·중복 요청 기준을 정한다.
4. Lesson 완료는 읽기 완료로, 공식 과정 이수는 서버 판정으로 표현한다. 필요하다면 필수 평가 미통과 시 Lesson 완료도 막을지 별도 승인한다.
5. UI의 ‘학습 완료’·‘필수 평가 통과’·‘공식 이수’를 분리하고 공식 이수 배지는 서버 판정에만 연결한다.
6. 390/717/PC, 과정 우회 진입, 미응시·오답·부분 정답·전체 통과·재시도·Legacy import를 회귀 기준으로 고정한 후 별도 정책 변경 작업으로 처리한다.

## 보호 및 증거

- `lib/learning-progress.js`, `src/server/d1-learning-repository.js`는 기준본과 줄바꿈 정규화 후 동일하다. 이미지 변경 전후의 학습·평가 핸들러도 보존했다.
- 12개 브라우저 비교 조합(기준/통합 × 390/1366 × 3과정)과 6개 별도 로컬 서버 모델 시나리오를 실행했다.
- 모든 브라우저 API는 새 로컬 fixture로 가로챘다. 기존 사용자·기존 QA 진척을 초기화하거나 덮어쓰지 않았다.
- 실행 코드와 세부 이벤트: 원본 Repository `.qa-launcher/image-hotfix-20261123/audit-practice.cjs`, `practice-results/results.json`.
- 인증·진척·Practice·공식 이수 정책, Production, DB schema·Migration은 변경하지 않았다. Commit·Push·Merge도 수행하지 않았다.
