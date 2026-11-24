# Unified Learning UX 개발 기준

격리 개발 브랜치의 출발점은 WORK 복귀 릴리스 8d804830이다. 운영 배포와 ADS-FINAL 개정은 별도 승인 단계다.

## 새 학습을 연결할 때

- [academy.js](../academy.js)의 기존 과정·Lesson 카탈로그와 데스크톱 학습 순서에 같은 Chapter 경로를 등록한다. 공통 라우터는 선택된 Lesson과 순서 항목을 찾아 Shell을 연결하고, 이동할 때 기존 DOM을 복원한다.
- 교육 작성자는 제목, 원문, 이미지, 문제와 피드백을 제공한다. [Learning Shell](../components/learning-shell.js)은 공통 헤더, WORK 복귀 컨트롤 위치, 서버 진척 표시, 제목, 펼칠 수 있는 소개와 과정 목차를 구성한다.
- 이전·다음과 완료는 Runtime이 생성한 탐색 요소와 이벤트를 사용한다. 목차는 과정 순서를 입력으로 받는다. 기존 Lesson ID, 평가·이수 조건, 진척 저장 이벤트는 LMS의 책임이다.
- 색상·글꼴·콘텐츠 최대 폭·버튼·카드 모서리·반응형 간격은 [공통 스타일](../components/learning-foundation.css)을 사용한다. 학습 그림과 시뮬레이션은 각 콘텐츠가 담당한다.
- 단자대 Golden Lesson은 위 구조에 연결할 수 있다. 실제 단자대 도식·조작·피드백, 과정 등록, 서버 진척 테스트는 해당 Lesson을 구현할 때 확인한다.

## ADS-FINAL과의 차이

[ADS-FINAL](01_ACADEMY_DESIGN_SYSTEM.md)은 Chapter → Title → Subtitle → Divider → 본문 → TIP → Navigation 순서 및 Part·Chapter 목차를 규정한다. 통합 개발본은 서버 진척을 제목 위에 두고 원래 설명·표지는 펼침으로 제공하며, 과정 순서에서 Chapter 목차를 구성한다. 이 차이를 Academy 전체의 잠금 기준으로 승격하려면 별도 승인이 필요하다.

## 보호할 회귀 기준

390px와 1366px에서 여섯 과정의 홈·과정 소개·학습·목차·이전/다음·WORK 복귀·이어하기를 기준 소스와 대조한다. 실제 사용자 데이터와 분리한 로컬 계정으로 이벤트 종류·횟수·Lesson ID·최종 진척률·공식 이수 값을 비교한다. Practical·TBM·Special의 기존 Practice 결과 이벤트 공백은 P1 Integrity HOLD로 유지한다.
