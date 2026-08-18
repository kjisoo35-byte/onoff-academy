# ONOFF Academy Content Design System

Academy 콘텐츠는 페이지별 스타일을 새로 만들지 않고 공통 Content Block을 조립해 제작합니다.

## Architecture

`Academy → Library → Book → Table of Contents → Chapter → Read → Learn → Practice → Complete`

Content Architecture v2의 상위 분류는 `Platform Academy`와 `Safety Library`입니다. 기존 Book·Chapter·Scene Component 계약은 두 영역이 공유하며, Presentation 구조가 학습 목적의 구분을 대신하지 않습니다.

### Content Classification

- `UNIVERSAL`: ONOFF를 사용하지 않는 사람에게도 독립적인 안전지식 가치가 있음 → Safety Library 후보
- `PLATFORM-SPECIFIC`: ONOFF 화면·기능·Workflow·Operation 설명 → Platform Academy 후보
- `MIXED`: Knowledge와 Product 사용법이 한 콘텐츠에 섞임 → 원본 가치를 보존하며 분리 후보
- `MERGE`: 독립 Chapter로 유지할 깊이나 고유 학습목표가 부족함 → Lesson/Section 통합 후보
- `HOLD`: 제품 Truth가 변하거나 미구현 상태임 → 안정화 전 선행 제작 금지

주제가 존재한다는 이유만으로 Chapter를 만들지 않습니다. Chapter는 하나의 학습목표를 충분히 완결할 때만 사용하고, 짧거나 중복된 콘텐츠는 Lesson/Section으로 통합합니다.

Safety Library는 필요 깊이에 따라 `WHY → CONCEPT → HOW → CASE → PRACTICE → COMPLETE`를 사용하고, Platform Academy는 `WHY → ACTUAL USER FLOW → ACTUAL PRODUCT SCREEN → ACTION → PRACTICE`를 우선합니다. 두 흐름을 모든 주제에 기계적으로 강제하지 않습니다.

Knowledge와 Product를 연결할 때는 콘텐츠를 복제하지 않고 상호 Link를 사용합니다. 확정되지 않은 Product 기능, 가상 Screen과 추정 Workflow는 Platform Academy 콘텐츠로 먼저 만들지 않습니다.

- `academy-components.css`: 재사용 가능한 Presentation Component와 반응형·Print 규칙
- `content-architecture.json`: Block 계약, Chapter 필수 정보와 Template Recipe
- `index.html`: 실제 콘텐츠를 조립하는 소비자

## Learning Mode Framework

Book Architecture의 기준 계층은 `Book → Part → Chapter → Scene`입니다. Safety Handbook은 3개 Part, 5개 Chapter, 20개 Scene으로 구성하며 모든 Chapter는 `WHY → CASE → WORKFLOW → TIP` Scene 패턴을 공유합니다.

- `Book Mode`: Library에서 진입하는 스크롤 기반 학습입니다. `WHY → CASE → WORKFLOW → TIP → PRACTICE → COMPLETE` 순서로 읽습니다.
- `Action Mode`: Platform Help에서 진입하는 현장형 표현입니다. 동일한 Scene 원본을 한 화면·한 행동 단위로 제공합니다.
- 두 Mode는 콘텐츠를 복제하지 않습니다. Chapter와 Scene 데이터는 공유하고 Presentation만 분리합니다.
- Chapter의 기본 설명 순서는 `WHY → WORKFLOW → ACTION → SCREEN → HELP`입니다.

## Component Contract

| Block | Class | 역할 |
|---|---|---|
| Hero | `ak-hero` | Book 또는 과정의 핵심 소개 |
| Book Cover | `ak-book-cover` | Book Identity |
| Learning Information | `ak-learning-info` | 시간·난이도·대상·업무·Book·Workflow |
| Table of Contents | `ak-toc` | Chapter 순서와 예상시간 |
| Chapter Header | `ak-chapter-header` | Chapter 제목과 학습 목적 |
| Scene | `ak-scene` | WHY·CASE·WORKFLOW·TIP·PRACTICE·COMPLETE 학습 장면 |
| Step Block | `ak-step-block` | 하나의 구체적 학습 단계 |
| Workflow | `ak-workflow` | 단계 간 순서와 완료 조건 |
| Image / Video | `ak-media` | 실사·Illustration·Screenshot·Video 공통 Frame |
| Tip / Warning | `ak-callout` | 맥락형 보조 정보 |
| FAQ | `ak-faq` | 질문과 답변 |
| Quiz | `ak-quiz` | 이해 확인 Block 구조 |
| Practice | `ak-practice` | 실습 목표·절차·완료 조건 |
| Related Learning | `ak-related` | 연결 학습 |
| Continue / Next | `ak-continue`, `ak-next-chapter` | 학습 연속성 |
| CTA | `ak-cta` | Academy 내부 다음 행동 |
| Platform Link | `ak-platform-link` | 학습 후 실제 업무 수행 |
| Footer | `ak-footer` | Book·Chapter·갱신 정보 |

## Learning Information

모든 Chapter는 아래 여섯 필드를 반드시 가지며, 본문은 `Scene` 배열로 구성합니다.

1. 예상 학습시간
2. 난이도
3. 대상
4. 관련 업무
5. 관련 Book
6. 관련 Workflow

## Template Recipes

### Workflow Template

`Chapter Header → Learning Info → Workflow → Step → Callout → FAQ → Practice → Related → Next → Platform Link → Footer`

### SOP Template

`Chapter Header → Learning Info → Callout → Step → Media → Warning → Practice → Quiz → Next → Footer`

### 교육 Template

`Chapter Header → Learning Info → Media → Step → Quiz → FAQ → Related → Next → Footer`

### 사고사례 Template

`Chapter Header → Learning Info → Media → Workflow → Callout → Practice → Related → Footer`

### 설비 Template

`Chapter Header → Learning Info → Media → Step → Warning → Practice → Platform Link → Footer`

### Guide Template

`Chapter Header → Learning Info → Step → Callout → FAQ → Continue → Next → Footer`

## Assembly Example

“네이버웍스 Drive에서 양식 작성” 교육은 새 Component 없이 다음과 같이 구성합니다.

```html
<article data-template="guide" data-book="works-drive">
  <header class="ak-chapter-header">...</header>
  <dl class="ak-learning-info">...</dl>
  <section class="ak-block ak-step-block">...</section>
  <figure class="ak-block ak-media" data-media="screenshot">...</figure>
  <aside class="ak-block ak-callout" data-kind="tip">...</aside>
  <section class="ak-block ak-practice">...</section>
  <section class="ak-block ak-faq">...</section>
  <nav class="ak-block ak-related">...</nav>
  <a class="ak-next-chapter" href="#next">...</a>
  <aside class="ak-block ak-platform-link">...</aside>
  <footer class="ak-footer">...</footer>
</article>
```

결론: 새로운 페이지 전용 CSS나 Component를 만들지 않고 기존 Block만으로 조립 가능합니다.

## Rules

- Book과 Chapter의 데이터는 Component 이름과 분리합니다.
- Platform 설명은 여러 Book 중 하나의 콘텐츠일 뿐 공통 Component의 전제가 아닙니다.
- 이미지 종류는 `data-media`만 변경하고 Frame 구조는 공유합니다.
- Quiz와 Practice는 이번 Sprint에서 구조만 정의하며 동작을 구현하지 않습니다.
- Desktop, Mobile, A4 Print는 동일 Markup을 공유하고 Presentation만 반응형으로 변경합니다.
- Workflow, 공식 용어, Role 행동, UX·데이터 의미, Platform Philosophy 등 Golden-impacting change는 관련 코드와 기준문서 갱신을 같은 Sprint에서 완료합니다. 단순 spacing, color, border, typography Micro UI는 Golden 의미를 바꾸지 않는 한 필수 동기화 대상이 아닙니다.
