# Special Safety Education Handbook Production Guide

Status: **MAPPING READY**  
Sprint: **SED-001**  
Golden Reference: **TBM Handbook / Platform Handbook**

이 문서는 특별안전교육 Handbook의 Chapter 제작 기준이다. SED-001에서는 Chapter Mapping만 확정하며 본문, 이미지, Practice와 새로운 Component를 제작하지 않는다.

## 1. Handbook 구조

| Chapter | Title | Production Type | 핵심 범위 |
| --- | --- | --- | --- |
| CH01 | 특별안전교육이란? | Summary | 교육 목적, 적용 대상과 현장 실행 원칙 |
| CH02 | 교육 대상 작업 | Summary | 하역기계 운반, 전압 75V 이상, 유해화학물질, 로봇 작업 소개 |
| CH03 | 하역기계 운반 | Workflow | OHS Vehicle → MTL 구간 이동 → 대차 적재 → 정비 위치 이동 → 복귀 |
| CH04 | 전압 75V 이상 | Workflow | 전원 차단 → LOTO → 잔류전압 확인 → 감전 예방 |
| CH05 | 유해화학물질 | Guide | 에탄올 와이퍼, 록타이트, 구리스의 취급·보관·SDS·보호구 |
| CH06 | 로봇 작업 | Workflow | Teach Mode, 협착, 비상정지, 작업반경, 2인 작업 |
| CH07 | Daily Work 연계 | Platform Workflow | Today's Work → 대상 확인 → Academy → 전자문서 → 전자서명 → Safety Start |

## 2. Production 원칙

- TBM과 Platform Handbook의 Chapter Header, Lesson, Sticky Header, Progress와 Fixed Bottom Navigation을 그대로 사용한다.
- 새로운 Layout, Navigation, Component 또는 이미지 표현 방식을 만들지 않는다.
- 한 Lesson에는 하나의 목적만 둔다.
- Workflow는 Desktop에서 기존 가로 흐름, Mobile/Fold7에서 중앙축의 수직 Down Arrow를 사용한다.
- 본문 내부 Navigation을 만들지 않고 Fixed Bottom Navigation 하나만 사용한다.
- 이미지가 필요할 때에는 실제 ONOFF 작업 기준을 우선하며, 생성 전 PM이 Source와 Crop 범위를 확정한다.

## 3. Chapter별 제작 준비

### CH01 · 특별안전교육이란?

- 형식: Summary
- 목적: 특별안전교육이 필요한 이유와 대상 작업을 이해한다.
- 자산: SED-001에서 생성하지 않는다.

### CH02 · 교육 대상 작업

- 형식: Summary
- 과정: 하역기계 운반 / 전압 75V 이상 / 유해화학물질 / 로봇 작업
- 목적: 사용자가 자신의 작업과 필요한 교육을 연결한다.

### CH03 · 하역기계 운반

- 기준 작업: 실제 ONOFF OHS Vehicle 운반
- Flow: OHS Vehicle → MTL 구간 이동 → 대차 적재 → 정비 위치 이동 → 복귀
- 제작 전 확인: 이동 구간, 작업 역할, 운반 장비, 접근 통제와 실제 사진 Source

### CH04 · 전압 75V 이상

- Flow: 전원 차단 → LOTO → 잔류전압 확인 → 감전 예방
- 제작 전 확인: 차단 기준, 검전 절차, LOTO 역할, 보호구와 작업 허가 기준

### CH05 · 유해화학물질

- 대상 물질: 에탄올 와이퍼 / 록타이트 / 구리스
- 학습 범위: 취급 / 보관 / SDS / 보호구
- 제작 전 확인: 최신 SDS, 현장 보관 기준, 폐기 기준과 실제 사용 조건

### CH06 · 로봇 작업

- 학습 범위: Teach Mode / 협착 / 비상정지 / 작업반경 / 2인 작업
- 제작 전 확인: 로봇 작업 Mode, 비상정지 위치, 접근 통제, 감시자와 작업자 역할

### CH07 · Daily Work 연계

- Flow: Today's Work → 특별안전교육 대상 확인 → Academy → 전자문서 → 전자서명 → Safety Start
- 목적: Academy 학습과 실제 Platform 작업 전 확인을 최소 Workflow로 연결한다.
- 실제 Platform 화면이 확정되지 않은 경우 Screenshot처럼 보이는 가상 UI를 만들지 않는다.

## 4. Asset Gate

SED-001에서는 이미지 생성, Crop, 삽입을 하지 않는다. 이후 Production Sprint에서는 Chapter별로 다음 항목을 먼저 확정한다.

1. Source 소유권과 보안 범위
2. 실제 작업 기준과 최신성
3. 사용할 Lesson과 메시지
4. Desktop/Mobile Crop 범위
5. 대체 텍스트
6. Broken Image 및 Fold7 Overflow QA

## 5. SED-001 완료 기준

- Academy Home에서 Special Safety Education Handbook 목차에 진입할 수 있다.
- CH01~CH07 Mapping이 목차에 표시된다.
- Chapter 제목, 유형과 핵심 범위가 이 문서에 확정된다.
- 본문, 이미지, 신규 Component는 생성되지 않는다.
