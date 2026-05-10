export const Template = [
  {
    id: "TIL",
    name: "TIL",
    template: `
    # TIL
    # 오늘 배운 내용 한 줄 요약
    - 간단하게 한줄로 정의

   ## 1. 학습 배경
   - 왜 이 내용을 보게 되었는지
   - 왜 이 내용이 필요한지 알려주기 

   ## 2. 핵심 개념 정리
   - 개념 1
   - 개념 2
   - 간단한 예시

   ## 3. 코드 / 예제
   // 핵심 코드
   // jsx, tsx?? 
    `,
  },

  {
    id: "Tutorial",
    name: "Tutorial",
    template: `
    # Tutorial
    # 튜토리얼 제목
    - 튜토리얼 설명

    ## 1. 학습 배경
    - 왜 이 내용을 보게 되었는지
    - 왜 이 내용이 필요한지 알려주기 

    ## 2. 핵심 개념 정리
    - 개념 1
    - 개념 2
    - 간단한 예시
    `,
  },
  {
    id: "trouble-shooting",
    name: "Trouble Shooting",
    template: `
## 트러블 슈팅
- 트러블 슈팅에 대해서 어떤 상황이 발생했고, 어떻게 해결했는지에 대해 문제상황을 정의하고 정리해주기

## 가설
- 어떤 원인이 있었고, 자신이 어떻게 생각했는지 가설작성

## 시도한 방법
- 방법 1(실패, 성공)
- 방법 2(실패, 성공)

## 실제원인 
- 구글링, or GPT... 
- 어떤 포인트를 놓쳤는지에 대해 나열

## 해결방법
- ex)SEO 최적화 위해 description 작성... 
  `,
  },
];

export const TEMPLATE_ID = [
  {
    id: "TIL",
    name: "TIL",
    description: `하루 동안 학습한 내용을 핵심 위주로 정리합니다. 
  개념 요약과 간단한 예제를 통해 배운 내용을 빠르게 복습하고 기록하는 공간입니다.`,
  },
  {
    id: "Deep_Dive",
    name: "Deep Dive",
    description: `특정 주제를 깊이 있게 분석합니다. 
  동작 원리, 내부 구조, 성능 관점까지 확장하여 기술을 구조적으로 이해하는 글을 다룹니다.`,
  },
  {
    id: "trouble-shooting",
    name: "Trouble Shooting",
    description: `개발 과정에서 겪은 문제와 해결 과정을 기록합니다. 
  에러 원인 분석부터 해결 방법, 배운 점까지 정리하는 실전 경험 중심의 글입니다.`,
  },
];
