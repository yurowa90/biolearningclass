import type { EvidenceCard } from "@/lib/domain";

export const evidenceCards: EvidenceCard[] = [
  {
    id: "ev-enzyme-temperature",
    revision: 1,
    title: "온도에 따라 효소 반응 속도는 어떻게 달라질까",
    phenomenon:
      "같은 양의 카탈레이스와 과산화 수소를 반응시켰지만 온도에 따라 1분 동안 발생한 산소의 부피가 달랐다.",
    evidenceType: "experiment",
    difficulty: 2,
    curriculumLinks: [
      {
        courseId: "integrated-science-1",
        domain: "시스템과 상호작용",
        standardCode: "10통과1-03-05",
      },
      {
        courseId: "science-inquiry-1",
        domain: "과학 탐구의 과정과 절차",
        standardCode: "10과탐1-02-03",
      },
      {
        courseId: "biology",
        domain: "생명 시스템의 구성",
        standardCode: "12생과01-03",
      },
      {
        courseId: "cell-metabolism",
        domain: "물질대사와 에너지",
        standardCode: "12세포02-03",
      },
    ],
    biologicalScales: ["분자", "세포"],
    coreConcepts: ["효소", "활성화 에너지", "변인 통제"],
    chart: {
      title: "온도별 산소 발생량",
      unit: "mL/min",
      points: [
        { label: "5℃", value: 18, displayValue: "1.1" },
        { label: "20℃", value: 52, displayValue: "3.2" },
        { label: "37℃", value: 100, displayValue: "6.1" },
        { label: "60℃", value: 13, displayValue: "0.8" },
      ],
    },
    method:
      "효소와 기질의 양, 반응 시간은 같게 하고 반응 온도만 바꾼 수업용 모의 실험이다.",
    limitation:
      "각 온도에서 한 번씩 측정한 값이므로 반복 측정과 오차 범위가 제시되지 않았다.",
    source: {
      label: "수업용 모의 자료",
      note: "1차 화면과 탐구 흐름 검증용이며 정식 게시 전에 원자료로 교체한다.",
      license: "내부 검토용",
    },
    reviewStatus: "draft",
  },
  {
    id: "ev-osmosis-potato",
    revision: 1,
    title: "용액 농도와 감자 조직의 질량 변화",
    phenomenon:
      "같은 크기의 감자 조각을 서로 다른 농도의 설탕 용액에 넣자 질량 변화율이 달라졌다.",
    evidenceType: "experiment",
    difficulty: 2,
    curriculumLinks: [
      {
        courseId: "integrated-science-1",
        domain: "시스템과 상호작용",
        standardCode: "10통과1-03-05",
      },
      {
        courseId: "science-inquiry-1",
        domain: "과학 탐구의 과정과 절차",
        standardCode: "10과탐1-02-03",
      },
      {
        courseId: "cell-metabolism",
        domain: "세포",
        standardCode: "12세포01-05",
      },
    ],
    biologicalScales: ["세포", "조직"],
    coreConcepts: ["삼투", "농도 기울기", "변화율"],
    chart: {
      title: "설탕 용액 농도별 질량 변화율",
      unit: "%",
      points: [
        { label: "0.0 M", value: 100, displayValue: "+8.4" },
        { label: "0.2 M", value: 58, displayValue: "+3.1" },
        { label: "0.4 M", value: 25, displayValue: "−1.2" },
        { label: "0.6 M", value: 12, displayValue: "−6.5" },
      ],
    },
    method:
      "크기와 초기 질량이 비슷한 감자 조각을 각 농도 용액에 같은 시간 동안 넣은 모의 자료다.",
    limitation:
      "감자 개체 차이와 표면의 물기를 제거하는 방식이 결과에 영향을 줄 수 있다.",
    source: {
      label: "수업용 모의 자료",
      note: "탐구 흐름 검증용 데이터로 정식 게시 전 반복 측정 자료가 필요하다.",
      license: "내부 검토용",
    },
    reviewStatus: "draft",
  },
  {
    id: "ev-antibiotic-resistance",
    revision: 1,
    title: "항생제 사용 뒤 내성 개체의 비율 변화",
    phenomenon:
      "세균 집단에 항생제를 반복적으로 처리하자 살아남은 집단에서 내성 표현형의 비율이 증가했다.",
    evidenceType: "comparison",
    difficulty: 3,
    curriculumLinks: [
      {
        courseId: "integrated-science-2",
        domain: "변화와 다양성",
        standardCode: "10통과2-01-02",
      },
      {
        courseId: "science-inquiry-2",
        domain: "생활 속의 과학 탐구",
        standardCode: "10과탐2-01-02",
      },
      {
        courseId: "biology",
        domain: "생명의 연속성과 다양성",
        standardCode: "12생과03-03",
      },
    ],
    biologicalScales: ["개체군", "유전자"],
    coreConcepts: ["자연선택", "변이", "상관과 인과"],
    chart: {
      title: "처리 회차별 내성 표현형 비율",
      unit: "%",
      points: [
        { label: "처리 전", value: 8, displayValue: "4" },
        { label: "1회", value: 28, displayValue: "14" },
        { label: "2회", value: 56, displayValue: "28" },
        { label: "3회", value: 88, displayValue: "44" },
      ],
    },
    method:
      "항생제 처리 뒤 생존 집단에서 내성 표현형의 비율을 비교한 모의 자료다.",
    limitation:
      "내성의 유전적 원인과 돌연변이 발생 시점은 이 자료만으로 확인할 수 없다.",
    source: {
      label: "수업용 모의 자료",
      note: "진화 설명의 타당성을 검토하기 위한 1차 시드 데이터다.",
      license: "내부 검토용",
    },
    reviewStatus: "draft",
  },
  {
    id: "ev-lac-operon-expression",
    revision: 1,
    title: "배지 조건에 따른 유전자 발현 산물의 활성 비교",
    phenomenon:
      "같은 대장균 집단을 포도당과 젖당 조합이 다른 배지에서 배양하자 β-갈락토시데이스 활성이 달라졌다.",
    evidenceType: "comparison",
    difficulty: 4,
    curriculumLinks: [
      {
        courseId: "integrated-science-1",
        domain: "시스템과 상호작용",
        standardCode: "10통과1-03-06",
      },
      {
        courseId: "science-inquiry-1",
        domain: "과학 탐구의 과정과 절차",
        standardCode: "10과탐1-02-03",
      },
      {
        courseId: "genetics",
        domain: "유전자의 발현",
        standardCode: "12유전02-03",
      },
    ],
    biologicalScales: ["분자", "세포"],
    coreConcepts: ["유전자 발현 조절", "오페론", "상호작용"],
    chart: {
      title: "배지 조건별 β-갈락토시데이스 상대 활성",
      unit: "상대값",
      points: [
        { label: "포도당+ / 젖당−", value: 3, displayValue: "3" },
        { label: "포도당+ / 젖당+", value: 18, displayValue: "18" },
        { label: "포도당− / 젖당−", value: 4, displayValue: "4" },
        { label: "포도당− / 젖당+", value: 100, displayValue: "100" },
      ],
    },
    method:
      "유전적으로 같은 대장균을 포도당과 젖당의 유무만 다른 배지에서 같은 시간 배양한 뒤 효소의 상대 활성을 비교한 수업용 모의 자료다.",
    limitation:
      "효소 활성은 유전자 발현의 간접 지표이며, 이 자료만으로 전사량과 단백질량을 따로 구분할 수 없다.",
    source: {
      label: "수업용 모의 자료",
      note: "유전자 발현 조절 탐구 흐름을 검증하기 위한 모의 값이며 정식 게시 전에 원자료로 교체한다.",
      license: "내부 검토용",
    },
    reviewStatus: "draft",
  },
];
