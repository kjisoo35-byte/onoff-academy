# Academy WORK 복귀 Hotfix · QA 보고서

검증일: 2026-11-21 (Asia/Seoul). Commit / Push / Production Deploy 없음.

## 1. Source First

- 기본 작업 폴더 HEAD: `341be188b1e2b7be9c80b9e5d3f2d75d9ee9fadb` (`main`). 기존 dirty worktree 보존.
- 수정 위치: `release-prep/2026-11-21/academy-git-worktree`.
- 수정 위치 HEAD: `a899a76557b0c656c3e7885f792e1bfad3155356`, 브랜치 `release/academy-d1-hotfix-20261121`. 작업 시작 시 clean.
- Academy에 적용되는 AGENTS.md 없음. `MASTER_DEVELOPMENT_RULES.md` 확인. WORK의 AGENTS.md는 WORK 하위 범위이며 WORK 파일은 수정하지 않음.
- 공개 Academy Production의 `index.html`, `academy.js`, `css/academy.css`가 기준 커밋 파일과 SHA-256 일치, 모두 HTTP 200.
- 공개 WORK `/release.json`: HTTP 200, commit `34b78e81bc0890a378edee318b835ad46f65fa2a`, build `r-c378a60f92a5` 일치. WORK `/`도 HTTP 200.
- 사용자 제공 Deployment: Academy `5f82de38-8b7e-4d64-bb51-213aa3a15beb`, WORK `4562ccf3-bf5d-4531-97d5-b213c0dea770`.
- Cloudflare Deployment API 재조회는 저장된 인증의 HTTP 401로 미확인. 위 Deployment ID를 독립 검증한 것으로 취급하지 않음. 배포 설정과 인증 정보는 변경하지 않음.

## 2. 변경 파일과 UI

| 파일 | 변경 |
| --- | --- |
| `index.html` | 공통 복귀 링크, 뒤로가기 SVG, 접근성 상태 안내 |
| `academy.js` | 링크 하나를 현재 활성 헤더에 배치. 저장 완료 대기 및 실패 시 이동 차단·재시도 |
| `css/academy.css` | 기존 남색 디자인에 맞춘 링크, 모바일 헤더 내 별도 행, 실패 안내 겹침 방지 |
| `scripts/work-return-browser-e2e.mjs` | 독립 실행 가능한 로컬 브라우저 E2E |
| `docs/06_WORK_RETURN_HOTFIX_QA.md` | 본 보고서 |

- 표시명: **WORK로 돌아가기**. 고정 주소: `https://onoff-work.pages.dev/`.
- Desktop: Home / 과정 / Lesson의 기존 상단 헤더 우측.
- Mobile / Fold: 기존 활성 헤더 아래 행 우측. 메뉴를 열 필요 없이 전체 표시명 노출.
- DOM 복귀 링크는 항상 하나. 화면 전환 및 800px 경계 전환 시 같은 컨트롤을 이동.
- 일반 링크와 Enter 키 지원, 최소 40px 높이, 포커스 표시 및 상태 live region 제공.
- `history.back()` / logout 호출 없음. 동일 탭에서 명시적 WORK URL로 이동.

## 3. 학습 저장과 복원

- 초기 서버 동기화와 진행 중인 Lesson / Practice 저장의 완료를 기다림.
- 실패한 저장이 있으면 동일 event ID로 재시도. 여전히 실패하면 Academy에 남아 안내 표시.
- 현재 학습의 기존 `lesson.entered` 저장을 확인한 뒤 이동. 학습 완료 상태를 자동 생성하지 않음.
- 요청 제한 시간 15초. 응답 유실 후 재시도는 기존 서버의 event ID 중복 방지 기능 사용.
- 서버 진척 구조, 인증 API, D1, migration, 이수 정책 변경 없음.
- 복원 범위는 기존 서버 `lastLessonId` 단위. 세부 화면 스크롤 위치를 추가 저장하지 않음.

## 4. 실행 결과

| 검증 | 결과 |
| --- | --- |
| `npm run check` | PASS |
| `npm test` | 17 / 17 PASS |
| `npm run check:release-config` | PASS |
| `npm run prepare:pages` | PASS, 로컬 `dist` 생성 |
| `git diff --check` | PASS |
| `node scripts/work-return-browser-e2e.mjs` | 797 checks PASS, 결과 원본 `../../work-return-qa/results.json` |

기존 API 테스트는 sandbox의 localhost 연결 제한으로 한 번 실패했으며, 로컬 네트워크 접근을 허용한 재실행에서 전체 통과했다. Node의 기존 MODULE_TYPELESS_PACKAGE_JSON 경고는 남아 있다.

| 너비 | Worker | Admin | 링크·겹침·가로 넘침·진척 왕복 |
| --- | --- | --- | --- |
| Desktop 1440px | PASS | PASS | PASS |
| Mobile 390px | PASS | PASS | PASS |
| Fold Closed 320px | PASS | PASS | PASS |
| Fold Open 717px | PASS | PASS | PASS |

E2E는 실제 Academy 프런트엔드와 기존 API handler / 인증 세션 코드 / in-memory SQLite D1 adapter를 사용했다. DB는 테스트 프로세스 안에만 존재하며 Production D1에 접근하지 않았다. WORK 메뉴와 WORK 쿠키는 명시적인 테스트 대역이다.

검증 흐름:

1. Lesson 진행 및 기존 완료 UI 사용, 서버 상태 확인.
2. 복귀 링크 클릭 → 정확한 WORK URL의 테스트 메뉴 이동.
3. Academy / WORK 테스트 쿠키 값 보존 및 logout 미호출 확인.
4. WORK 테스트 메뉴에서 Academy 재진입.
5. 클라이언트 진척 캐시와 owner 캐시 제거 후 재로딩.
6. 서버에서 마지막 진행 중 Lesson, 기존 Lesson 완료, 진척률, 이수 상태 복원 및 이어하기 확인.

Home, 과정 소개, SOP / Platform / Risk / TBM / Special Lesson에서 링크의 유일성, 노출, 화면 내 위치, 클릭 방해 및 가로 넘침 검사. 정상 왕복 8개 시나리오의 console / page / network 오류 0건.

추가 PASS: 320px Enter 키 이동, Fold 크기 전환, 저장 지연 중 대기·중복 클릭 차단, 저장 503 시 이동 차단·안내 가시성, 복구 후 재시도, SOP Practice 정답 UI와 결과 보존. 서버에 Practice 저장 후 응답만 실패시키는 경우에도 재시도 뒤 `attempts = 1`, `passed = true` 확인. 의도적으로 주입한 503은 정상 시나리오 오류 0건 집계와 구분한다.

스크린샷: `../../work-return-qa/{learner,administrator}-{1440,390,320,717}-{home,lesson}.png`, `../../work-return-qa/save-failure-390.png`.

## 5. 실제 계정 검증 및 Release Gate

- 사용자 기존 실기: WORK → Academy 실제 계정 로그인 PASS (사용자 제공 결과).
- 이번 수정본의 실제 계정 WORK 왕복: **미실행**. 테스트 대역 왕복을 실제 WORK 인증 왕복 PASS로 표기하지 않음.
- 수정본은 배포하지 않았으므로 현재 Production에는 복귀 버튼이 아직 없음.
- **로컬 코드·빌드 Gate: PASS. 배포 후보로 준비됨.**
- **Production Release Gate: HOLD.** 실제 Worker/Admin 계정으로 수정본에서 저장 → WORK 복귀 → 실제 WORK 메뉴 Academy 재진입 → 서버 진척·이어하기를 확인하고, Cloudflare 인증 복구 후 정확한 Deployment metadata를 확인해야 한다.
- 기본 dirty 폴더가 아닌 위 Production 기준 release worktree를 배포 후보로 사용해야 한다.
- WORK 코드·DB, Academy 인증 API, LMS D1·migration 변경 및 진척 삭제 없음. Commit·Push·Production Deploy 없음.
