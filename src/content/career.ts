import type { CareerContent } from "@/types/content";

/**
 * Career(연혁)
 *
 * 서류는 항목마다 `documentFormId`로 양식만 지정합니다.
 * 양식 정의는 `document-forms.ts` (향후 관리자에서 등록).
 */
export const career: CareerContent = {
  basics: {
    birthDate: "1991.03.21",
    location: "서울",
  },
  education: [
    {
      id: "highschool",
      title: "졸업",
      organization: "양지고등학교",
      period: "2007.03 — 2010.02",
      documentFormId: "highschool",
    },
    {
      id: "hongik",
      title: "컴퓨터공학과 졸업",
      organization: "홍익대학교(서울)",
      period: "2010.03 — 2017.02",
      documentFormId: "university",
    },
  ],
  military: [
    {
      id: "rok-army-armor",
      title: "육군 만기전역 · 전차조종수",
      organization: "대한민국 육군 · 기갑",
      period: "2011.03.21 — 2012.12.20",
      description: "기갑병 / 전차조종수",
      documentFormId: "military",
    },
  ],
  training: [
    {
      id: "woori-digital-academy",
      title: "빅데이터 분석 전문가 과정",
      organization: "숭실대학교 · Woori Digital Academy",
      period: "2021.09 — 2021.12",
      description: "Digital Analytic Specialist 과정 수료 (150시간)",
      documentFormId: "training",
    },
    {
      id: "iot-embedded",
      title: "IoT 기반 시스템 구축 과정",
      organization: "대한상공회의소",
      period: "2017.08 — 2017.12",
      description: "IoT 기반 임베디드 정보시스템 구축 과정 수료 (730시간)",
      documentFormId: "training",
    },
  ],
  certifications: [
    {
      id: "sqld",
      title: "SQLD (SQL개발자)",
      organization: "한국데이터진흥원",
      period: "2021.04",
      documentFormId: "certification",
    },
    {
      id: "engineer-info-processing",
      title: "정보처리기사",
      organization: "한국산업인력공단",
      period: "2020.10",
      documentFormId: "certification",
    },
    {
      id: "ocp",
      title: "OCP (Oracle 11g Certified DBA)",
      organization: "Oracle",
      period: "2015.09",
      documentFormId: "certification",
    },
    {
      id: "ocwcd",
      title: "OCWCD",
      organization: "Oracle",
      period: "2015.08",
      documentFormId: "certification",
    },
    {
      id: "ocjp",
      title: "OCJP",
      organization: "Oracle",
      period: "2015.08",
      documentFormId: "certification",
    },
    {
      id: "oca",
      title: "OCA",
      organization: "Oracle",
      period: "2015.08",
      documentFormId: "certification",
    },
  ],
  awards: [
    {
      id: "woori-digital-award",
      title: "우수상",
      organization: "숭실대학교 · Woori Digital Academy",
      period: "2021.12",
      description: "우리디지털아카데미 과정 수료 및 프로젝트 발표 성적",
      documentFormId: "award",
    },
  ],
};
