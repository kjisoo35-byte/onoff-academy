# ONOFF Academy Design System

Status: **LOCKED**  
Version: **ADS-FINAL**  
Scope: ONOFF Academy 전체 Handbook

이 문서는 ONOFF Academy UI의 공식 기준이다. 이후 Sprint에서는 구조와 Component를 변경하지 않고 Handbook 콘텐츠만 제작한다.

## 1. 기본 원칙

- Academy는 공통 Library Design System 위에서 `Platform Academy`와 `Safety Library`를 제공하는 Knowledge Center다. Platform Documentation은 두 축 중 Product 학습 영역이다.
- Reference UI의 구조, 정보 계층, Navigation과 배치를 따른다.
- 새로운 UI, Flow, Navigation 또는 Component를 발명하지 않는다.
- 모든 Handbook은 동일한 Component와 간격을 재사용한다.
- 모든 제목과 본문은 왼쪽 정렬한다.

## 2. Typography

- Chapter, Title, Subtitle, 본문의 Heading 계층을 모든 Lesson에서 동일하게 유지한다.
- Title과 Subtitle 사이, Subtitle과 Divider 사이의 간격을 공통 CSS에서 관리한다.
- 개별 Chapter에 Typography 예외를 추가하지 않는다.

## 3. Layout

- 공통 Content Padding, Section Margin과 Divider를 사용한다.
- 페이지 상단에 장식 목적의 Hero Margin 또는 빈 Spacer를 만들지 않는다.
- Chapter 순서는 `Chapter → Title → Subtitle → Divider → 본문 → TIP → Navigation`이다.
- Image, Video, Quiz는 정의된 선택 위치에만 삽입한다.

## 4. Library와 Book Cover

- Home은 스크롤 없는 Library Entrance다.
- Book Cover는 실사 이미지를 사용한다.
- ONOFF Navy Overlay를 적용해 텍스트 가독성을 확보한다.
- Library 항목은 흰색 Book Card와 그 안의 세로형 Cover로 구성한다.
- 실사 이미지는 작은 Book Cover 내부에만 표시하며 Card 전체 또는 Home 배경으로 사용하지 않는다.
- Cover는 좌측 Spine과 세로형 비율을 사용해 실제 책의 형태를 유지한다.
- `HANDBOOK`, Book 제목, 설명과 진입 화살표는 Cover 밖의 정보 영역에 표시한다.
- 아이콘 기반 Cover를 사용하지 않는다.
- 공식 이미지 자산은 `assets/academy-handbook-covers-v1.png`이다.

## 5. Lesson

모든 Lesson은 다음 순서를 사용한다.

1. Chapter
2. Title
3. Subtitle
4. 본문
5. Image — 선택
6. TIP
7. Video — 선택
8. Quiz — 선택
9. Navigation

WHY, CASE, WORKFLOW, TIP은 동일한 Lesson Component 규칙을 사용한다.

## 6. Navigation

- Navigation Component는 하나만 사용한다.
- 기본 구성은 `이전 Lesson / 목차 / 다음 Lesson`이다.
- 세 항목은 동일한 폭, 높이, Radius, Border, Font와 Padding을 사용한다.
- 마지막 Lesson은 `이전 Lesson / 목차 / Handbook Complete`로 표시한다.
- 마지막 Lesson에서 다음 Lesson 버튼은 표시하지 않는다.

## 7. Workflow

- 모든 Step 사이에 Flow Arrow를 표시한다.
- 모든 Step은 동일한 간격과 동일한 시각 스타일을 사용한다.
- ACTIVE Step만 색상으로 강조하지 않는다.
- 현재 위치는 색상이 아닌 별도의 Progress Indicator로 표현한다.

## 8. Table of Contents

- Breadcrumb와 불필요한 설명을 표시하지 않는다.
- Part와 Chapter만 표시한다.
- Part 제목은 왼쪽 정렬하고 Bold를 사용한다.

## 9. Logo와 Hero

- Hero는 실사 기반 Background Visual과 ONOFF Navy Overlay를 사용한다.
- 회사 로고, ONOFF Academy와 한 줄 철학을 표시한다.
- Hero의 유일한 Primary Action은 `Safety Handbook 시작`이다.
- Home은 한 화면 Landing을 유지한다.

## 10. 변경 통제

- Component 수정은 모든 Handbook에 공통 적용되어야 한다.
- 개별 Chapter용 Layout 또는 CSS 예외를 만들지 않는다.
- Design System 변경이 필요한 경우 PM 승인 전에는 적용하지 않는다.
- ADS-FINAL 이후 허용되는 기본 작업은 Handbook 콘텐츠 작성과 공식 자산 교체뿐이다.
