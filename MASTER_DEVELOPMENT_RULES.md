Rule 01 적용

Repository

onoff-academy

Preview

Academy Home(index.html)

Repository와 Preview 전환 완료 후
Sprint를 시작합니다.

## 신규 교육과 공통 UX

- 교육 콘텐츠와 공통 UX 변경은 별도로 검토할 수 있게 분리한다. 새 과정은 데이터와 Content Block으로 등록하고 기존 Theme, Catalog, Learning Shell을 사용한다.
- Header, Footer, 목차와 학습 Navigation은 공통 컴포넌트에서 관리한다. 과정별 복제를 피하고 공통 Typography, Spacing, 반응형 규칙을 먼저 적용한다.
- ADS-FINAL과 승인된 디자인을 기준으로 삼는다. Unified Learning UX와의 차이는 기존 개발 문서에 기록하고 디자인 재설계는 별도 승인을 받는다. 격리 Golden Learning UX Kit는 콘텐츠 구성의 참고이며, 운영 런타임과 LMS의 계약은 Unified Learning UX를 따른다.
- 기존 Course·Lesson ID와 LMS 인증, 진척, 이어하기, Practice 및 공식 이수 정책을 보호한다. 격리 Fixture는 신규 운영 과정이나 공식 평가로 등록하지 않는다.
- Production 및 P1 Integrity HOLD 상태에서 QA는 격리 데이터로 실행한다. 운영 배포, Migration, 운영 데이터 변경과 WORK·Safety 수정은 별도 범위다. Commit·Push·Merge는 사용자 승인 후 진행한다.

## 체험형 학습 Interaction Workspace

- 새 체험형 교육은 [Stable Learning Stage와 Interaction Workspace](docs/07_UNIFIED_LEARNING_UX.md#체험형-학습)를 우선 재사용한다. 제목·안내와 기본 스테이지, 완료·이전·목차·다음은 공통 Shell이 배치한다. 교육별 Header·Footer·Navigation을 구현하지 않는다.
- 교육은 그 과정의 도식·조작·시뮬레이션·피드백을 제공한다. 그림 비율이나 설명 길이 차이는 공통 스테이지에서 수용하고 Scene별 배치 CSS를 추가하지 않는다. 읽기형 학습은 기본 Learning Shell을 사용하며, 복잡한 회로·고장 진단 전체화면은 별도 확장 범위로 관리한다.
- 같은 viewport에서 반복 조작할 때 그림과 기존 조작 요소는 1px 이내로 유지하고 페이지 스크롤이 따라 움직이지 않는지 확인한다. 사용자가 펼친 상세나 창 크기 변경은 별도로 검증한다.
- Desktop은 가용 폭과 높이를 기준으로 나란히 배치하고 Mobile은 그림과 조작을 인접시킨다. 과정별 배치 CSS와 조작 레이아웃의 중복 구현을 금지한다.
- 44px 터치 영역, 가로 넘침, 그림·조작 동시 가시성과 스크롤 끝을 검증한다. 일반 Desktop Lesson 간 이동에서도 기본 스테이지와 하단 조작 좌표가 1px 이내인지 확인한다. 신규 체험에도 센서와 같은 공통 좌표 검사를 적용한다. 세부 검사와 실행 명령은 Unified Learning UX 문서를 따른다.

## Risk-Based QA

- 신규 교육 콘텐츠만 수정하면 변경한 Lesson의 화면과 학습 동작을 집중 검증한다.
- 신규 Course는 과정 진입부터 마지막 Lesson, 이어하기와 완료 표시까지 전체 학습 흐름을 검증한다.
- 신규 교육과 공통 UX 작업에서 README의 공통 UX QA를 실행한다. 공통 UX 변경은 등록된 기존 과정과 신규 교육 Fixture까지 확인한다. 기존 6개 과정은 공통 UX 회귀, 센서는 센서 브라우저 E2E로 확인한다. 브라우저에서 좌우 이동, 가로 넘침, 중복 탐색 요소와 서버 이벤트를 검증한다. 기존 과정은 자동 회귀를 기본으로 검증하고 전체 수동 실기를 매번 반복하지 않는다.
- 공통 UX·Navigation·LMS Core를 변경하면 영향을 받는 과정, 화면과 기능까지 QA 범위를 확대한다.
- 인증·진척·Practice·공식 이수 변경은 권한과 학습자 격리, 이벤트 저장·복원, 평가 결과와 공식 이수 판정 중 영향받는 항목을 강화해 회귀 검증한다.
- 자동 QA 실패 또는 공통 기능에 영향이 있는 경우에만 변경 대상 외의 수동 검증을 확대한다. 관련 과정과 기기에서 실패 또는 영향 경로를 확인한다.
- Production 배포에는 별도 Release Gate를 적용한다. 자동·수동 QA 통과는 배포 승인을 대신하지 않는다.
