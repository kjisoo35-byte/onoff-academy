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
