# Documentation Components

Academy 표준 Component는 `academy.css`의 디자인 토큰과 A4 인쇄 규칙을 공유하며 `Workflow Overview`를 향후 Chapter의 기준 Template로 사용합니다.

| Component | Class | 용도 |
|---|---|---|
| Page Title | `chapter-header` | Chapter 제목과 설명 |
| Workflow Card | `standard-workflow` | 역할별 단계와 연결 관계 |
| Tip | `callout tip` | 효율적인 사용 방법 |
| Note | `callout note` | 운영 시 참고 사항 |
| Warning | `callout warning` | 진행 전 필수 확인 사항 |
| Information | `callout info` | 배경 정보와 기준 설명 |
| FAQ | `workflow-faq`, `faq-list` | 질문과 답변 |
| Related Pages | `related-pages` | 연관 Chapter 연결 |
| Previous / Next | `chapter-pager` | 문서 순서 이동 |
| Best Practice | `best-practice` | 권장 운영 방식 |

새로운 Chapter는 별도 시각 스타일을 만들지 않고 이 Component를 조합하여 작성합니다.

## Component 구조 원칙

- Workflow Card는 역할, 단계 번호, 제목과 설명 순서를 유지합니다.
- Information, Tip, Warning은 공통 `callout` 구조에 의미별 Modifier만 적용합니다.
- FAQ는 질문을 `summary`, 답변을 본문 단락으로 구성합니다.
- Related Pages와 Previous / Next는 Chapter 마지막에서만 사용합니다.
- Workflow Diagram은 HTML 목록과 CSS 연결선을 사용하며 외부 라이브러리에 의존하지 않습니다.
