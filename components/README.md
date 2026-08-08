# ONOFF Academy Content Design System

Academy 콘텐츠는 페이지별 스타일을 새로 만들지 않고 공통 Content Block을 조립해 제작합니다.

## Architecture

`Academy → Library → Book → Table of Contents → Chapter → Read → Learn → Practice → Complete`

- `academy-components.css`: 재사용 가능한 Presentation Component와 반응형·Print 규칙
- `content-architecture.json`: Block 계약, Chapter 필수 정보와 Template Recipe
- `index.html`: 실제 콘텐츠를 조립하는 소비자

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
