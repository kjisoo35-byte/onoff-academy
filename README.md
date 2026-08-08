# ONOFF Academy

ONOFF SYSTEM의 업무 지식을 축적하고 공유하는 HTML First Digital Knowledge Library입니다.

## Knowledge Architecture

`Home → Library → Book → Table of Contents → Chapter → Read → Learn → Practice → Complete → Platform`

Academy는 Platform Manual이 아닙니다. Safety, BM, PLC, Automation, Leadership, Maintenance 등 회사의 모든 지식을 같은 Book·Chapter·Content Block 구조로 확장합니다.

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
