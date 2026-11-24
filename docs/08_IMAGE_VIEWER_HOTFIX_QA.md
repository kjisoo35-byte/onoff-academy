# 공통 이미지 확대·이동 Hotfix QA

2026-11-23 / Source: `codex/academy-unified-development` / Production **HOLD**

## 결과

공통 이미지 뷰어에서 확대 후 상하좌우 이동을 확인했다. Fold7 Chrome의 실제 손가락 드래그·축소·닫기·재진입은 사용자가 모두 정상이라고 확인했다. 기존 AUTO BAT 메뉴 2와 4174 서버, USB ADB reverse, scrcpy를 재사용했다.

## 원인과 변경

기존 뷰어는 중앙 정렬한 이미지와 `overflow:auto`만 제공했다. 자체 확대 좌표·터치 이동 처리가 없어 모바일 브라우저 확대와 이미지의 잘린 영역 탐색을 제어하지 못했다.

- `components/image-viewport.js`: 공통 Pointer Events 처리, 단일 포인터 드래그와 두 포인터 핀치, 마우스 휠·더블클릭·방향키, 1–8배 배율.
- 이동 범위는 각 축에서 `max(0, (맞춤 이미지 크기 × 배율 − 뷰포트 크기) / 2)`로 제한한다. 이미지가 작은 축에서는 이동하지 않는다. 확대·축소는 선택 지점의 이미지 좌표를 유지하며, 100%에서는 가운데 맞춤으로 돌아온다.
- `academy.js`: 기존 공통 dialog에 확대·축소·화면 맞춤을 연결한다. 열기·닫기·이미지 로드·화면 크기 변경 시 초기화한다. 배경을 고정하고 닫을 때 원래 스크롤과 초점을 복구한다.
- `css/academy.css`: 뷰어 내부의 기본 터치 스크롤을 막고, 고정 뷰포트와 변환 이미지로 이동한다. 포인터 캡처로 이미지 밖으로 이어지는 드래그도 처리한다.
- `index.html`: 공통 컨트롤러 스크립트 한 개를 추가한다.
- `test/image-viewport.test.js`: 맞춤 크기·작은 이미지 제한·네 모서리 경계·확대 기준점·핀치 중심·축소 초기화의 7개 테스트.

기존 이미지 파일·교안·Learning Shell·LMS Core·인증·진척·Practice·이수 정책은 수정하지 않았다. Git diff에는 작업 전부터 존재한 통합 Learning Shell 변경이 함께 보이므로, 이번 변경은 작업 시작 시 보존한 소스와 대조했다.

## 검증

| 검증 | 결과 |
| --- | --- |
| 단위 테스트 | 7/7 PASS |
| 390px 모바일 | Risk S-TRA 기준표, TBM 세로 Summary, SOP 가로 이미지: 핀치·드래그로 네 모서리 도달, 축소·화면 맞춤·닫기·뒤로가기·재진입 PASS |
| 717px Fold 뷰포트 | 같은 3개 이미지와 터치 입력 PASS |
| 1366px PC Edge | Risk Practical FORM-04 넓은 표, TBM 일반 사진: 마우스 휠 확대·드래그로 네 모서리 도달·배율 조절·초기화 PASS |
| 배경 스크롤 | 뷰어 안 이동 중 배경 위치 유지, 닫을 때 원래 읽던 위치 복원 PASS |
| 외부 회귀 | 390/717/1366px에서 Escape 닫기·재진입·창 크기 변경 초기화·페이지 스크롤·과정 Navigation PASS |
| Fold7 실기 | SM-F966N Chrome에서 150% 좌우 이동과 506% 상하 이동을 scrcpy 터치 주입으로 확인 |
| 실제 손가락 | 사용자가 좌우·상하 이동, 축소, 닫기, 재진입 초기화 모두 정상이라고 응답 |

390px·717px는 자동화된 실제 Chromium 터치 입력(CDP) 검증이다. Fold7 물리 기기 확인과 구분한다. PC 검증은 설치된 Edge를 headless 모드에서 실제 마우스 입력으로 구동했다.

브라우저 QA는 기존 4174 Preview만 사용하고, API 요청은 별도 로컬 fixture로 가로챘다. 기존 진척 파일을 초기화하거나 덮어쓰지 않았다. 실기 화면은 기존 전용 로컬 QA 계정만 사용했다.

## 증거와 실행

- 단위 테스트: `node --test test/image-viewport.test.js` (통합 Worktree에서 실행)
- 자동화 코드와 PNG: 원본 Repository의 `.qa-launcher/image-hotfix-20261123/` 아래 `verify-viewer.cjs`, `verify-lifecycle.cjs`, `viewer-results/`.
- 기존 실행: 바탕화면 `ONOFF_QA_START` → **2. Academy (Unified Development)**.
- 주소: `http://127.0.0.1:4174/index.html#risk-assessment-stra` → 가능성(F) 기준표 선택.

기존 AUTO BAT와 실행 포트를 새로 만들지 않았다. Production 배포·Migration·Commit·Push·Merge는 수행하지 않았다. 별도 Practice 조사는 [읽기 전용 보고서](09_PRACTICE_COMPLETION_READ_ONLY_AUDIT.md)에 기록했다.
