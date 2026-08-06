# ONOFF Academy

ONOFF Platform의 공식 학습 및 운영 가이드를 위한 GitHub Pages Documentation Site입니다.

## 구성

- 단일 `index.html` Documentation Website
- 반응형 Desktop, Tablet, Mobile Navigation
- 검색 UI와 Chapter 탐색
- A4 Print Manual
- GitHub Pages 정적 배포 파일

별도 Build 또는 외부 라이브러리가 필요하지 않습니다. 새 Chapter는 독립 페이지로 분리하지 않고 Navigation, 본문, Search Index, Related Pages와 Release Notes를 함께 확장합니다.

## Live Preview

```powershell
npm run dev
```

브라우저에서 `http://127.0.0.1:4174`를 열면 HTML, CSS와 JavaScript 저장 시 자동으로 새로고침됩니다. `file://`로 직접 연 페이지는 Live Reload 대상이 아닙니다.
