# ONOFF Academy

ONOFF SYSTEM의 업무 지식을 축적하고 공유하는 HTML First Digital Knowledge Library입니다.

## Knowledge Architecture

`Home → Library → Book → Table of Contents → Chapter → Read → Learn → Practice → Complete → Platform`

Academy는 Platform Manual이 아닙니다. Safety, BM, PLC, Automation, Leadership, Maintenance 등 회사의 모든 지식을 같은 Book·Chapter·Content Block 구조로 확장합니다.

### Academy Architecture v2

Status:

- ARCHITECTURE: **DECIDED**
- TOC v2: **PROPOSED / REVIEW REQUIRED**

Academy는 학습 목적에 따라 두 축으로 구분합니다.

- **Platform Academy** — “ONOFF를 어떻게 사용하고 운영하는가?” 실제 Product Workflow, Screen, Action과 Operation을 학습합니다.
- **Safety Library** — “안전을 어떻게 이해하고 실천하는가?” ONOFF 사용 여부와 관계없이 가치가 있는 범용 Safety Knowledge를 학습합니다.

두 영역은 분리하지만 단절하지 않습니다. Safety Library의 개념 학습에서 “ONOFF에서 활용하기”로 Platform Academy를 연결하고, Platform Academy에서는 “개념부터 학습하기”로 Safety Library를 연결하는 **Knowledge ↔ Product** 관계를 사용합니다.

현재 Worker Basic Course Foundation은 다음 4개 Chapter로 LOCK합니다.

1. CH01 Platform Philosophy
2. CH02 오늘 작업과 Daily Safety
3. CH03 Safety Start
4. CH04 작업 중과 작업 종료

Audit 제안은 이 Foundation을 다시 분해하거나 확정되지 않은 Operation Chapter를 선행 제작하지 않습니다. 미구현 기능은 Academy에서 가상 UI나 추정 Workflow로 만들지 않습니다.

## Content Development

새 교육은 페이지 전용 UI를 만들지 않고 `components/academy-components.css`의 Block을 조립합니다. Block 계약과 Workflow/SOP/교육/사고사례/설비/Guide Template은 `components/content-architecture.json`과 `components/README.md`를 기준으로 합니다.

## Live Preview

```powershell
npm run dev
```

브라우저에서 `http://127.0.0.1:4174`를 열면 HTML, CSS, JavaScript 변경 시 자동으로 새로고침됩니다. `__preview`에서는 Desktop, Laptop, Fold, Galaxy, iPhone과 Responsive 환경을 검토할 수 있습니다.

## Delivery

- 별도 Framework나 외부 UI Library 없음
- GitHub Pages에서 바로 실행
- Desktop / Mobile 반응형
- A4 Print 지원
- Search 확장을 고려한 Chapter Index

## 공통 UX QA

Node.js 22.13 이상에서 실행합니다. Windows PowerShell 예시입니다.

```powershell
npm ci
npx playwright install chromium
npm test
npm run test:ux
npm run test:ux:proof
```

`test:ux`는 실제 Chromium에서 320·390·717·1024·1366·1440·1920px를 검사합니다. 기존 6개 과정에서 검색, 진입, 목차, 이어하기, 서버 진척을 확인하고, 신규 교육 Fixture가 기존 공통 컴포넌트를 쓰는지 검사합니다. `test:ux:proof`는 격리 브라우저 응답에서 스크롤바 공간 예약을 제거해 1px 단언의 실패를 확인하고, 현재 CSS에서 통과하는지 확인합니다. 1366·1440px 검증은 스크롤바가 실제로 공간을 차지하는 환경을 요구합니다.

설치된 Edge를 화면에 표시해 검증하려면 `$env:ACADEMY_BROWSER_CHANNEL = 'msedge'` 설정 후 `npm run test:ux -- --headed` 또는 `npm run test:ux:proof -- --headed`를 실행합니다.

QA는 임의의 루프백 포트와 임시 LMS 기록을 사용합니다. WORK 복귀는 격리 응답으로 확인합니다. 신규 과정 Fixture는 브라우저에서만 등록되며 서버 과정과 기존 과목에는 영향을 주지 않습니다. 측정 JSON과 대표 브라우저 캡처는 `.academy-data/ux-qa/`에 저장됩니다. 별도 디렉터리가 필요하면 `ACADEMY_QA_OUTPUT`을 사용합니다.
