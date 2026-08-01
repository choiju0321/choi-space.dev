/**
 * 미래에셋캐피탈 제출용 Project Portfolio
 * 포지션: IT시스템 및 미들웨어 운영
 * 구조: SDS본 스토리(E2E / Before-After / Why) + Consulting 디자인
 */
const path = require("path");
const fs = require("fs");
const PptxGenJS = require("pptxgenjs");

const C = {
  // 주황 단일 브랜드 + 웜 뉴트럴 (파랑 제거)
  orange: "F58220",
  orangeDeep: "C45F12",
  ink: "2C2C2C",
  inkSoft: "5A5550",
  gray: "8A8580",
  grayDark: "4A4540",
  grayLine: "E5DDD4",
  paper: "FAF7F4",
  white: "FFFFFF",
  card: "FFFCF9",
  softOrange: "FEF3E8",
  charcoal: "2B2B2B",
  // 하위 호환 alias → 전부 잉크/주황 계열
  navy: "2C2C2C",
  navyMid: "5A5550",
  blue: "2C2C2C",
  graySoft: "FEF3E8",
};

const FONT = "Pretendard";
const W = 13.333;
const H = 7.5;
const MX = 0.72;
const ICON = (name) => path.join(__dirname, "assets", "icons", `${name}.png`);

function addChrome(slide, pptx, sectionLabel, pageNum, total = 8) {
  slide.addText("미래에셋캐피탈  ·  프로젝트 포트폴리오", {
    x: MX,
    y: 0.28,
    w: 7.5,
    h: 0.28,
    fontFace: FONT,
    fontSize: 10,
    color: C.gray,
  });
  slide.addText(sectionLabel, {
    x: 8.2,
    y: 0.28,
    w: 3.3,
    h: 0.28,
    fontFace: FONT,
    fontSize: 10,
    color: C.orange,
    bold: true,
    align: "right",
  });
  slide.addText(String(pageNum).padStart(2, "0"), {
    x: W - MX - 0.55,
    y: 0.28,
    w: 0.55,
    h: 0.28,
    fontFace: FONT,
    fontSize: 10,
    color: C.gray,
    align: "right",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX,
    y: 0.62,
    w: W - MX * 2,
    h: 0.01,
    fill: { color: C.grayLine },
    line: { width: 0 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX,
    y: 0.62,
    w: 1.4,
    h: 0.03,
    fill: { color: C.orange },
    line: { width: 0 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX,
    y: 7.05,
    w: W - MX * 2,
    h: 0.01,
    fill: { color: C.grayLine },
    line: { width: 0 },
  });
  slide.addText("최지웅  ·  금융 IT 엔지니어", {
    x: MX,
    y: 7.12,
    w: 7,
    h: 0.25,
    fontFace: FONT,
    fontSize: 9,
    color: C.gray,
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: W - MX - 1.2,
    y: 7.12,
    w: 1.2,
    h: 0.25,
    fontFace: FONT,
    fontSize: 9,
    color: C.gray,
    align: "right",
  });
}

function sectionTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: MX,
    y: 0.82,
    w: 11.5,
    h: 0.4,
    fontFace: FONT,
    fontSize: 24,
    color: C.ink,
    bold: true,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: MX,
      y: 1.22,
      w: 11.5,
      h: 0.28,
      fontFace: FONT,
      fontSize: 12,
      color: C.gray,
    });
  }
}

function iconBadge(slide, pptx, iconName, x, y, size = 0.38) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w: size,
    h: size,
    fill: { color: C.softOrange },
    line: { color: "F0C9A0", width: 0.75 },
    rectRadius: 0.08,
  });
  const pad = size * 0.2;
  slide.addImage({
    path: ICON(iconName),
    x: x + pad,
    y: y + pad,
    w: size - pad * 2,
    h: size - pad * 2,
  });
}

function card(slide, pptx, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    fill: { color: C.card },
    line: { color: C.grayLine, width: 0.75 },
    rectRadius: 0.1,
  });
}

function setPaper(slide) {
  slide.background = { color: C.paper };
}

function createDeck() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: W, height: H });
  pptx.layout = "WIDE";
  pptx.author = "최지웅";
  pptx.title = "프로젝트 포트폴리오 — 미래에셋캐피탈";
  pptx.subject = "IT시스템 및 미들웨어 운영";

  addCover(pptx);
  addPositioning(pptx);
  addCareer(pptx);
  addE2E(pptx);
  addBeforeAfter(pptx);
  addOpsKpi(pptx);
  addWhyMirae(pptx);
  addThankYou(pptx);

  return pptx;
}

/* 01 Cover */
function addCover(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.paper };

  // charcoal left + orange accent stripe
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 4.55,
    h: H,
    fill: { color: C.charcoal },
    line: { width: 0 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.55,
    y: 0,
    w: 0.1,
    h: H,
    fill: { color: C.orange },
    line: { width: 0 },
  });

  slide.addText("프로젝트\n포트폴리오", {
    x: 0.65,
    y: 2.15,
    w: 3.5,
    h: 1.5,
    fontFace: FONT,
    fontSize: 30,
    color: C.white,
    bold: true,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.65,
    y: 3.85,
    w: 1.2,
    h: 0.04,
    fill: { color: C.orange },
    line: { width: 0 },
  });
  slide.addText("미래에셋캐피탈", {
    x: 0.65,
    y: 4.2,
    w: 3.5,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    color: C.orange,
    bold: true,
  });
  slide.addText("IT시스템 및 미들웨어 운영", {
    x: 0.65,
    y: 4.55,
    w: 3.5,
    h: 0.35,
    fontFace: FONT,
    fontSize: 13,
    color: "C8C4BF",
  });

  slide.addText("최지웅", {
    x: 5.4,
    y: 2.2,
    w: 6.5,
    h: 0.65,
    fontFace: FONT,
    fontSize: 40,
    color: C.ink,
    bold: true,
  });
  slide.addText("금융 IT 엔지니어", {
    x: 5.4,
    y: 2.9,
    w: 6.5,
    h: 0.35,
    fontFace: FONT,
    fontSize: 18,
    color: C.orange,
    bold: true,
  });
  slide.addText("캐피탈 여신 계정계 개발·운영  ·  글로벌 여신 시스템 운영 PL", {
    x: 5.4,
    y: 3.4,
    w: 6.8,
    h: 0.35,
    fontFace: FONT,
    fontSize: 13,
    color: C.gray,
  });

  const chips = [
    { t: "우리금융캐피탈", s: "2018.05 — 2022.08  ·  IT개발팀 매니저" },
    { t: "LG CNS", s: "2022.09 — 재직 중  ·  KBC운영혁신팀 선임 / 운영 PL" },
  ];
  chips.forEach((c, i) => {
    const y = 4.15 + i * 0.85;
    card(slide, pptx, 5.4, y, 6.2, 0.72);
    slide.addText(c.t, {
      x: 5.7,
      y: y + 0.1,
      w: 5.6,
      h: 0.28,
      fontFace: FONT,
      fontSize: 14,
      color: C.ink,
      bold: true,
    });
    slide.addText(c.s, {
      x: 5.7,
      y: y + 0.38,
      w: 5.6,
      h: 0.25,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
    });
  });

  slide.addText("채용 제출용  ·  대외비", {
    x: 5.4,
    y: 6.9,
    w: 6.5,
    h: 0.25,
    fontFace: FONT,
    fontSize: 10,
    color: C.gray,
  });
}

/* 02 Positioning */
function addPositioning(pptx) {
  const slide = pptx.addSlide();
  setPaper(slide);
  addChrome(slide, pptx, "한 줄 소개", 2);

  slide.addText("캐피탈 여신 시스템의\n안정성과 정합성을 만들어온 8년", {
    x: MX,
    y: 1.5,
    w: 11.5,
    h: 1.3,
    fontFace: FONT,
    fontSize: 32,
    color: C.ink,
    bold: true,
  });
  slide.addText(
    "계정계 개발·운영부터 대외연계·미들웨어성 인터페이스까지,\n장애 대응을 넘어 운영 구조를 표준화해 왔습니다.",
    {
      x: MX,
      y: 3.0,
      w: 11.5,
      h: 0.7,
      fontFace: FONT,
      fontSize: 16,
      color: C.grayDark,
    },
  );

  const pillars = [
    { icon: "layers", title: "캐피탈 계정계", desc: "자동차·신용·담보대출\n전 구간 개발·운영" },
    { icon: "link", title: "대외연계 / 미들웨어", desc: "CB · H2H · ABA 등\n연계 정합성 설계" },
    { icon: "shield", title: "운영 안정화", desc: "재처리·모니터링·\n장애 표준 프로세스" },
    { icon: "zap", title: "성능 · 자동화", desc: "SQL·배치 최적화와\n반복업무 자동화" },
  ];
  pillars.forEach((p, i) => {
    const x = MX + i * 3.1;
    card(slide, pptx, x, 4.1, 2.95, 2.4);
    iconBadge(slide, pptx, p.icon, x + 0.25, 4.35, 0.42);
    slide.addText(p.title, {
      x: x + 0.25,
      y: 4.95,
      w: 2.45,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: C.ink,
      bold: true,
    });
    slide.addText(p.desc, {
      x: x + 0.25,
      y: 5.45,
      w: 2.45,
      h: 0.8,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    });
  });
}

/* 03 Career */
function addCareer(pptx) {
  const slide = pptx.addSlide();
  setPaper(slide);
  addChrome(slide, pptx, "경력 요약", 3);
  sectionTitle(slide, "경력 요약", "캐피탈 계정계 → 글로벌 여신 운영 PL로 이어진 경력");

  // left metric
  card(slide, pptx, MX, 1.7, 3.2, 4.9);
  slide.addText("8+", {
    x: MX + 0.3,
    y: 2.1,
    w: 2.6,
    h: 0.8,
    fontFace: FONT,
    fontSize: 52,
    color: C.orange,
    bold: true,
  });
  slide.addText("년", {
    x: MX + 0.3,
    y: 2.9,
    w: 2.6,
    h: 0.35,
    fontFace: FONT,
    fontSize: 16,
    color: C.orangeDeep,
    bold: true,
  });
  slide.addText("금융 IT\n여신 시스템", {
    x: MX + 0.3,
    y: 3.4,
    w: 2.6,
    h: 0.7,
    fontFace: FONT,
    fontSize: 13,
    color: C.gray,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX + 0.3,
    y: 4.3,
    w: 2.6,
    h: 0.01,
    fill: { color: C.grayLine },
    line: { width: 0 },
  });
  const comps = [
    "여신 계정계 전 구간",
    "CB / 대외연계 운영",
    "운영 PL · 안정화",
    "SQL · 배치 성능",
  ];
  comps.forEach((t, i) => {
    slide.addText("•  " + t, {
      x: MX + 0.3,
      y: 4.55 + i * 0.4,
      w: 2.6,
      h: 0.35,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    });
  });

  const jobs = [
    {
      period: "2022.09 — 재직 중",
      company: "LG CNS",
      role: "운영 PL · 선임",
      focus: "KB국민카드 캄보디아 글로벌 여신 시스템",
      bullets: [
        "지급·배치·대외연계 운영 총괄",
        "장애 표준화 · 모니터링 고도화",
        "성능 과제 · 신규 모듈 설계 리딩",
      ],
    },
    {
      period: "2018.05 — 2022.08",
      company: "우리금융캐피탈",
      role: "IT개발팀 매니저",
      focus: "자동차금융 · 신용 · 담보대출 계정계",
      bullets: [
        "여신 전 과정 개발·운영",
        "CB 실시간 집중 · 담보 자동화",
        "규제 대응 · 트래픽/성능 안정화",
      ],
    },
  ];
  jobs.forEach((j, i) => {
    const y = 1.7 + i * 2.45;
    card(slide, pptx, 4.2, y, 8.4, 2.25);
    slide.addText(j.period, {
      x: 4.5,
      y: y + 0.2,
      w: 3.2,
      h: 0.28,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
    });
    slide.addText(j.company, {
      x: 7.7,
      y: y + 0.15,
      w: 2.8,
      h: 0.35,
      fontFace: FONT,
      fontSize: 18,
      color: C.ink,
      bold: true,
    });
    slide.addText(j.role, {
      x: 10.5,
      y: y + 0.2,
      w: 1.9,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12,
      color: C.inkSoft,
      align: "right",
      bold: true,
    });
    slide.addText(j.focus, {
      x: 4.5,
      y: y + 0.55,
      w: 7.8,
      h: 0.3,
      fontFace: FONT,
      fontSize: 13,
      color: C.grayDark,
    });
    slide.addText(
      j.bullets.map((b) => ({ text: b, options: { breakLine: true } })),
      {
        x: 4.5,
        y: y + 1.0,
        w: 7.8,
        h: 1.0,
        fontFace: FONT,
        fontSize: 12,
        color: C.grayDark,
        bullet: { code: "25CF" },
      },
    );
  });
}

/* 04 E2E */
function addE2E(pptx) {
  const slide = pptx.addSlide();
  setPaper(slide);
  addChrome(slide, pptx, "업무 영역", 4);
  sectionTitle(
    slide,
    "여신 프로세스 전 구간",
    "캐피탈 계정계에서 고객 신청부터 채권관리까지 전 구간을 개발·운영",
  );

  const steps = [
    { t: "신청", d: "상품·고객\n접수" },
    { t: "CB조회", d: "신정원·NICE\n·KCB 연계" },
    { t: "심사", d: "CSS / 한도\n승인 프로세스" },
    { t: "확정", d: "약정·담보\n설정" },
    { t: "지급", d: "실행·대외\n연계 처리" },
    { t: "채권", d: "연체·회수\n관리" },
  ];
  steps.forEach((s, i) => {
    const x = MX + i * 2.05;
    card(slide, pptx, x, 1.85, 1.9, 1.7);
    slide.addText(String(i + 1).padStart(2, "0"), {
      x,
      y: 2.0,
      w: 1.9,
      h: 0.3,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
      align: "center",
    });
    slide.addText(s.t, {
      x,
      y: 2.35,
      w: 1.9,
      h: 0.4,
      fontFace: FONT,
      fontSize: 16,
      color: C.ink,
      bold: true,
      align: "center",
    });
    slide.addText(s.d, {
      x: x + 0.1,
      y: 2.85,
      w: 1.7,
      h: 0.55,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
      align: "center",
    });
    if (i < steps.length - 1) {
      slide.addText("→", {
        x: x + 1.75,
        y: 2.45,
        w: 0.4,
        h: 0.35,
        fontFace: FONT,
        fontSize: 16,
        color: C.orange,
        align: "center",
      });
    }
  });

  const domains = [
    {
      icon: "building",
      title: "CB 연계",
      desc: "신용정보원 · NICE · KCB\n실시간/파일 이중화 운영",
    },
    {
      icon: "settings",
      title: "심사 · 실행",
      desc: "한도·약정·담보 설정과\n지급 실행 프로세스",
    },
    {
      icon: "server",
      title: "대외연계 · 미들웨어",
      desc: "Cube FEP / AnyLink 기반\n연계 구간 안정화",
    },
    {
      icon: "activity",
      title: "운영 · 정합성",
      desc: "재처리·상태관리·모니터링으로\n트랜잭션 정합성 유지",
    },
  ];
  domains.forEach((d, i) => {
    const x = MX + i * 3.1;
    card(slide, pptx, x, 3.9, 2.95, 2.6);
    iconBadge(slide, pptx, d.icon, x + 0.25, 4.15, 0.42);
    slide.addText(d.title, {
      x: x + 0.25,
      y: 4.75,
      w: 2.45,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: C.ink,
      bold: true,
    });
    slide.addText(d.desc, {
      x: x + 0.25,
      y: 5.3,
      w: 2.45,
      h: 0.9,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    });
  });
}

/* 05 Before / After — CB */
function addBeforeAfter(pptx) {
  const slide = pptx.addSlide();
  setPaper(slide);
  addChrome(slide, pptx, "대표 성과 01", 5);
  sectionTitle(
    slide,
    "신용정보 실시간 집중 체계 구축",
    "우리금융캐피탈  ·  규제 대응과 데이터 정합성을 위한 실시간 전환",
  );

  // Before
  card(slide, pptx, MX, 1.75, 5.7, 3.5);
  slide.addText("개선 전", {
    x: MX + 0.35,
    y: 1.95,
    w: 5,
    h: 0.3,
    fontFace: FONT,
    fontSize: 12,
    color: C.gray,
    bold: true,
  });
  const before = ["D+1 파일 집중", "신용정보 반영 지연", "중복 대출 가능성", "규제 · 민원 리스크"];
  before.forEach((t, i) => {
    slide.addText(t, {
      x: MX + 0.5,
      y: 2.45 + i * 0.55,
      w: 5,
      h: 0.4,
      fontFace: FONT,
      fontSize: 16,
      color: C.grayDark,
    });
    if (i < before.length - 1) {
      slide.addText("↓", {
        x: MX + 0.5,
        y: 2.8 + i * 0.55,
        w: 5,
        h: 0.25,
        fontFace: FONT,
        fontSize: 12,
        color: C.grayLine,
      });
    }
  });

  // After — soft orange panel
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.9,
    y: 1.75,
    w: 5.7,
    h: 3.5,
    fill: { color: C.softOrange },
    line: { color: "F0C9A0", width: 1 },
    rectRadius: 0.1,
  });
  slide.addText("개선 후", {
    x: 7.25,
    y: 1.95,
    w: 5,
    h: 0.3,
    fontFace: FONT,
    fontSize: 12,
    color: C.orangeDeep,
    bold: true,
  });
  const after = ["실시간 온라인 집중", "즉시 반영 · 이중화", "중복 대출 예방", "규제 대응 체계 확보"];
  after.forEach((t, i) => {
    slide.addText(t, {
      x: 7.25,
      y: 2.45 + i * 0.55,
      w: 5,
      h: 0.4,
      fontFace: FONT,
      fontSize: 16,
      color: C.ink,
      bold: true,
    });
  });

  // Key results bar
  const kr = [
    { t: "실시간 집중", s: "체계 구축" },
    { t: "시차 제거", s: "데이터 정합성" },
    { t: "실패 알림", s: "운영 안정성" },
    { t: "NICE·KCB·신정원", s: "연계 운영" },
  ];
  kr.forEach((k, i) => {
    const x = MX + i * 3.1;
    card(slide, pptx, x, 5.5, 2.95, 1.15);
    slide.addText(k.t, {
      x: x + 0.2,
      y: 5.7,
      w: 2.55,
      h: 0.35,
      fontFace: FONT,
      fontSize: 13,
      color: C.ink,
      bold: true,
      align: "center",
    });
    slide.addText(k.s, {
      x: x + 0.2,
      y: 6.1,
      w: 2.55,
      h: 0.3,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
      align: "center",
    });
  });
}

/* 06 Ops KPI */
function addOpsKpi(pptx) {
  const slide = pptx.addSlide();
  setPaper(slide);
  addChrome(slide, pptx, "대표 성과 02", 6);
  sectionTitle(
    slide,
    "운영 안정화 · 성능 · 미들웨어 정합성",
    "LG CNS 글로벌 여신 운영 PL  ·  장애 대응을 넘어 구조적 안정화",
  );

  const actions = [
    { icon: "settings", t: "재처리 체계" },
    { icon: "shield", t: "장애 표준화" },
    { icon: "database", t: "SQL 튜닝" },
    { icon: "cpu", t: "배치 병렬화" },
    { icon: "activity", t: "TTS 모니터링" },
    { icon: "link", t: "대외연계 예외처리" },
  ];
  actions.forEach((a, i) => {
    const x = MX + i * 2.05;
    card(slide, pptx, x, 1.75, 1.95, 1.35);
    iconBadge(slide, pptx, a.icon, x + 0.75, 1.95, 0.4);
    slide.addText(a.t, {
      x: x + 0.1,
      y: 2.5,
      w: 1.75,
      h: 0.4,
      fontFace: FONT,
      fontSize: 12,
      color: C.ink,
      bold: true,
      align: "center",
    });
  });

  const kpis = [
    { v: "70%↓", l: "지급 오류율", s: "자동통지 · 재처리" },
    { v: "30%↓", l: "지급 처리시간", s: "SQL · 인덱스 개선" },
    { v: "80%↓", l: "배치/온라인 병목", s: "병렬 처리 적용" },
    { v: "24h", l: "장애 알림", s: "TTS · 배치 점검" },
  ];
  kpis.forEach((k, i) => {
    const x = MX + i * 3.1;
    card(slide, pptx, x, 3.4, 2.95, 3.15);
    slide.addText(k.v, {
      x: x + 0.2,
      y: 3.8,
      w: 2.55,
      h: 0.7,
      fontFace: FONT,
      fontSize: 34,
      color: C.orange,
      bold: true,
      align: "center",
    });
    slide.addText(k.l, {
      x: x + 0.2,
      y: 4.7,
      w: 2.55,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: C.ink,
      bold: true,
      align: "center",
    });
    slide.addText(k.s, {
      x: x + 0.2,
      y: 5.3,
      w: 2.55,
      h: 0.5,
      fontFace: FONT,
      fontSize: 12,
      color: C.gray,
      align: "center",
    });
  });
}

/* 07 Why Mirae */
function addWhyMirae(pptx) {
  const slide = pptx.addSlide();
  setPaper(slide);
  addChrome(slide, pptx, "지원 동기", 7);
  sectionTitle(
    slide,
    "왜 미래에셋캐피탈인가",
    "캐피탈 여신 IT 경험을 미래에셋캐피탈의 시스템·미들웨어 운영에 바로 연결",
  );

  card(slide, pptx, MX, 1.7, 12.0, 1.35);
  slide.addText(
    "캐피탈 계정계에서 쌓은 여신 도메인과 운영 정합성 경험을 바탕으로,\n미래에셋캐피탈의 IT시스템·미들웨어 운영 안정화와 디지털 고도화에 기여하고자 합니다.",
    {
      x: MX + 0.4,
      y: 1.95,
      w: 11.2,
      h: 0.9,
      fontFace: FONT,
      fontSize: 15,
      color: C.ink,
    },
  );

  const fits = [
    {
      icon: "layers",
      title: "여신전문금융과의 적합성",
      desc: "자동차·신용·담보 계정계 경험으로\n캐피탈 업무 맥락을 바로 이해합니다.",
    },
    {
      icon: "server",
      title: "시스템 · 미들웨어 운영",
      desc: "대외연계·상태관리·재처리 설계로\n운영 리스크를 구조적으로 줄입니다.",
    },
    {
      icon: "trending",
      title: "개발과 운영의 연결",
      desc: "요구 분석부터 배포·모니터링까지\n개선을 전 과정으로 실행합니다.",
    },
    {
      icon: "shield",
      title: "규제 · 정합성",
      desc: "CB 실시간 집중, 금리 개편 등\n규제 대응 시스템 전환 경험이 있습니다.",
    },
  ];
  fits.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MX + col * 6.15;
    const y = 3.3 + row * 1.7;
    card(slide, pptx, x, y, 5.95, 1.5);
    iconBadge(slide, pptx, f.icon, x + 0.25, y + 0.45, 0.45);
    slide.addText(f.title, {
      x: x + 0.9,
      y: y + 0.3,
      w: 4.7,
      h: 0.35,
      fontFace: FONT,
      fontSize: 15,
      color: C.ink,
      bold: true,
    });
    slide.addText(f.desc, {
      x: x + 0.9,
      y: y + 0.75,
      w: 4.7,
      h: 0.55,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    });
  });
}

/* 08 Thank You */
function addThankYou(pptx) {
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: C.charcoal },
    line: { width: 0 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.12,
    h: H,
    fill: { color: C.orange },
    line: { width: 0 },
  });
  slide.addText("감사합니다", {
    x: MX,
    y: 2.2,
    w: W - MX * 2,
    h: 0.7,
    fontFace: FONT,
    fontSize: 42,
    color: C.white,
    bold: true,
    align: "center",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: W / 2 - 0.6,
    y: 3.1,
    w: 1.2,
    h: 0.04,
    fill: { color: C.orange },
    line: { width: 0 },
  });
  slide.addText("최지웅  ·  금융 IT 엔지니어", {
    x: MX,
    y: 3.45,
    w: W - MX * 2,
    h: 0.35,
    fontFace: FONT,
    fontSize: 16,
    color: "B8B3AD",
    align: "center",
  });
  slide.addText("IT시스템 및 미들웨어 운영  ·  미래에셋캐피탈", {
    x: MX,
    y: 3.9,
    w: W - MX * 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.orange,
    align: "center",
  });
  slide.addText("choiry0321@gmail.com  ·  010-5413-6930", {
    x: MX,
    y: 4.5,
    w: W - MX * 2,
    h: 0.35,
    fontFace: FONT,
    fontSize: 14,
    color: C.white,
    align: "center",
  });
}

async function main() {
  if (!fs.existsSync(path.join(__dirname, "assets", "icons", "user.png"))) {
    require("./generate-icons.js");
  }
  const pptx = createDeck();
  const stamp = "20260802";
  const filename = `${stamp}_최지웅_미래에셋캐피탈_프로젝트포트폴리오_v1.3.pptx`;
  const distDir = path.join(__dirname, "dist");
  fs.mkdirSync(distDir, { recursive: true });
  const outPath = path.join(distDir, filename);

  const resumeDir = path.join("D:", "개인", "02_Career", "1. Resume");
  const miraeDir = path.join(resumeDir, "2026", `${stamp}_미래에셋캐피탈`);
  fs.mkdirSync(miraeDir, { recursive: true });

  await pptx.writeFile({ fileName: outPath });
  fs.copyFileSync(outPath, path.join(resumeDir, filename));
  fs.copyFileSync(outPath, path.join(miraeDir, filename));
  console.log("Saved:", outPath);
  console.log("Copied:", path.join(resumeDir, filename));
  console.log("Copied:", path.join(miraeDir, filename));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
