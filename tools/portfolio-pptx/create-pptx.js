/**
 * Financial IT Project Portfolio — Consulting-style PPTX
 * Tone: White / Navy / Gray · Pretendard · Executive Proposal
 */
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const C = {
  navy: "0B1F3A",
  navyMid: "1A3358",
  gray: "6B7280",
  grayDark: "374151",
  grayLine: "D1D5DB",
  graySoft: "F3F4F6",
  white: "FFFFFF",
  card: "F8F9FB",
};

const FONT = "Pretendard";
const W = 13.333;
const H = 7.5;
const MX = 0.72;
const ICON = (name) => path.join(__dirname, "assets", "icons", `${name}.png`);

function createDeck() {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: W, height: H });
  pptx.layout = "WIDE";
  pptx.author = "최지웅";
  pptx.title = "Project Portfolio — 최지웅";
  pptx.subject = "Financial IT Engineer Project Portfolio";

  addCover(pptx);
  addAbout(pptx);
  addCareer(pptx);
  addSkills(pptx);
  addProjectKb(pptx);
  addProjectWoori(pptx);
  addAchievements(pptx);
  addStrength(pptx);
  addThankYou(pptx);

  return pptx;
}

/* ─── shared chrome ─── */

function addChrome(slide, pptx, sectionLabel, pageNum) {
  slide.addText("PROJECT PORTFOLIO", {
    x: MX,
    y: 0.28,
    w: 4.2,
    h: 0.28,
    fontFace: FONT,
    fontSize: 10,
    color: C.gray,
    charSpacing: 3,
  });
  slide.addText(sectionLabel, {
    x: 5.2,
    y: 0.28,
    w: 5.8,
    h: 0.28,
    fontFace: FONT,
    fontSize: 10,
    color: C.navy,
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
    line: { color: C.grayLine, width: 0 },
  });
  // footer
  slide.addShape(pptx.ShapeType.rect, {
    x: MX,
    y: 7.05,
    w: W - MX * 2,
    h: 0.01,
    fill: { color: C.grayLine },
    line: { color: C.grayLine, width: 0 },
  });
  slide.addText("최지웅  ·  Financial IT Engineer", {
    x: MX,
    y: 7.12,
    w: 6,
    h: 0.25,
    fontFace: FONT,
    fontSize: 9,
    color: C.gray,
  });
  slide.addText(`${pageNum} / 9`, {
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
    w: 10,
    h: 0.42,
    fontFace: FONT,
    fontSize: 26,
    color: C.navy,
    bold: true,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: MX,
      y: 1.24,
      w: 11,
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
    fill: { color: C.graySoft },
    line: { color: C.grayLine, width: 0.75 },
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

/* ─── 01 Cover ─── */

function addCover(pptx) {
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: C.white },
    line: { color: C.white, width: 0 },
  });
  // left navy panel
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 4.6,
    h: H,
    fill: { color: C.navy },
    line: { color: C.navy, width: 0 },
  });
  slide.addText("PROJECT\nPORTFOLIO", {
    x: 0.65,
    y: 2.2,
    w: 3.5,
    h: 1.6,
    fontFace: FONT,
    fontSize: 32,
    color: C.white,
    bold: true,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.65,
    y: 4.0,
    w: 1.2,
    h: 0.04,
    fill: { color: C.white },
    line: { width: 0 },
  });
  slide.addText("Financial Systems  ·  Lending & Credit", {
    x: 0.65,
    y: 4.25,
    w: 3.5,
    h: 0.4,
    fontFace: FONT,
    fontSize: 11,
    color: "A8B3C5",
  });

  slide.addText("최지웅", {
    x: 5.4,
    y: 2.35,
    w: 6.5,
    h: 0.7,
    fontFace: FONT,
    fontSize: 40,
    color: C.navy,
    bold: true,
  });
  slide.addText("Ji-ung Choi", {
    x: 5.4,
    y: 3.05,
    w: 6.5,
    h: 0.35,
    fontFace: FONT,
    fontSize: 16,
    color: C.gray,
  });
  slide.addText("Financial IT Engineer", {
    x: 5.4,
    y: 3.55,
    w: 6.5,
    h: 0.35,
    fontFace: FONT,
    fontSize: 18,
    color: C.navyMid,
    bold: true,
  });

  // company chips
  const chips = [
    { label: "LG CNS", sub: "2022.09 — Present" },
    { label: "우리금융캐피탈", sub: "2018.05 — 2022.08" },
  ];
  chips.forEach((c, i) => {
    const y = 4.35 + i * 0.85;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.4,
      y,
      w: 5.8,
      h: 0.72,
      fill: { color: C.card },
      line: { color: C.grayLine, width: 0.75 },
      rectRadius: 0.1,
    });
    slide.addText(c.label, {
      x: 5.7,
      y: y + 0.1,
      w: 5.2,
      h: 0.3,
      fontFace: FONT,
      fontSize: 14,
      color: C.navy,
      bold: true,
    });
    slide.addText(c.sub, {
      x: 5.7,
      y: y + 0.38,
      w: 5.2,
      h: 0.25,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
    });
  });

  slide.addText("Confidential  ·  For recruitment use only", {
    x: 5.4,
    y: 6.9,
    w: 6.5,
    h: 0.25,
    fontFace: FONT,
    fontSize: 10,
    color: C.gray,
  });
}

/* ─── 02 About Me ─── */

function addAbout(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "ABOUT ME", 2);
  sectionTitle(slide, "About Me", "금융 여신·카드 IT 운영을 중심으로 한 경력 요약");

  // profile card
  card(slide, pptx, MX, 1.7, 4.0, 4.9);
  iconBadge(slide, pptx, "user", MX + 0.3, 1.95, 0.45);
  slide.addText("Profile", {
    x: MX + 0.9,
    y: 2.0,
    w: 2.8,
    h: 0.35,
    fontFace: FONT,
    fontSize: 14,
    color: C.navy,
    bold: true,
  });
  const profileRows = [
    ["Name", "최지웅 / Ji-ung Choi"],
    ["Role", "Financial IT Engineer"],
    ["Focus", "Lending · Credit · Ops PL"],
    ["Base", "서울"],
    ["Email", "choiry0321@gmail.com"],
  ];
  profileRows.forEach((row, i) => {
    const y = 2.6 + i * 0.55;
    slide.addText(row[0], {
      x: MX + 0.3,
      y,
      w: 1.3,
      h: 0.3,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
    });
    slide.addText(row[1], {
      x: MX + 1.6,
      y,
      w: 2.1,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12,
      color: C.navy,
      bold: true,
    });
  });

  // career years
  card(slide, pptx, 5.0, 1.7, 3.5, 2.2);
  iconBadge(slide, pptx, "clock", 5.3, 1.95, 0.4);
  slide.addText("Total Experience", {
    x: 5.85,
    y: 2.0,
    w: 2.4,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.navy,
    bold: true,
  });
  slide.addText("8+", {
    x: 5.3,
    y: 2.5,
    w: 3.0,
    h: 0.7,
    fontFace: FONT,
    fontSize: 48,
    color: C.navy,
    bold: true,
  });
  slide.addText("Years in Financial IT", {
    x: 5.3,
    y: 3.25,
    w: 3.0,
    h: 0.3,
    fontFace: FONT,
    fontSize: 12,
    color: C.gray,
  });

  // core competency
  card(slide, pptx, 8.75, 1.7, 3.85, 2.2);
  iconBadge(slide, pptx, "target", 9.05, 1.95, 0.4);
  slide.addText("Core Competency", {
    x: 9.6,
    y: 2.0,
    w: 2.7,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.navy,
    bold: true,
  });
  slide.addText("구조로 문제를 정의하고\n운영으로 안정성을 만듭니다.", {
    x: 9.05,
    y: 2.55,
    w: 3.3,
    h: 0.9,
    fontFace: FONT,
    fontSize: 13,
    color: C.grayDark,
  });

  // competency pills
  const comps = [
    { icon: "monitor", title: "운영 PL", desc: "글로벌 여신 시스템 운영 총괄" },
    { icon: "layers", title: "계정계", desc: "캐피탈·카드 여신 코어 개발·운영" },
    { icon: "link", title: "대외연계", desc: "CB · ABA · H2H 인터페이스" },
    { icon: "zap", title: "성능·안정화", desc: "SQL·배치·장애 대응 체계화" },
  ];
  comps.forEach((c, i) => {
    const x = 5.0 + (i % 2) * 3.8;
    const y = 4.15 + Math.floor(i / 2) * 1.2;
    card(slide, pptx, x, y, 3.6, 1.05);
    iconBadge(slide, pptx, c.icon, x + 0.2, y + 0.3, 0.42);
    slide.addText(c.title, {
      x: x + 0.8,
      y: y + 0.22,
      w: 2.5,
      h: 0.3,
      fontFace: FONT,
      fontSize: 13,
      color: C.navy,
      bold: true,
    });
    slide.addText(c.desc, {
      x: x + 0.8,
      y: y + 0.52,
      w: 2.5,
      h: 0.35,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
    });
  });
}

/* ─── 03 Career Summary ─── */

function addCareer(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "CAREER SUMMARY", 3);
  sectionTitle(slide, "Career Summary", "금융권 계정계·글로벌 여신 운영 중심의 경력 흐름");

  // timeline line
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.15,
    y: 2.0,
    w: 0.03,
    h: 4.5,
    fill: { color: C.grayLine },
    line: { width: 0 },
  });

  const jobs = [
    {
      period: "2022.09 — Present",
      company: "LG CNS",
      role: "KBC운영혁신팀 선임 · 운영 PL",
      focus: "KB국민카드 캄보디아 글로벌 여신 시스템",
      bullets: [
        "지급·심사·배치 구간 운영 총괄",
        "성능 개선 · 장애 대응 표준화",
        "리스 사전심사 · 대외연계 정합성",
      ],
      projects: "Payment Stabilization · Batch Perf · iFL · ABA Failover",
    },
    {
      period: "2018.05 — 2022.08",
      company: "우리금융캐피탈",
      role: "IT개발팀 매니저",
      focus: "자동차금융·신용·담보대출 계정계",
      bullets: [
        "여신 전 과정 개발·운영",
        "CB 실시간 집중 전환",
        "규제·자동화·성능 개선",
      ],
      projects: "CB Realtime · Collateral Auto · Traffic QoS · Rate Cap",
    },
  ];

  jobs.forEach((job, i) => {
    const y = 1.85 + i * 2.45;
    // dot
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 1.05,
      y: y + 0.15,
      w: 0.22,
      h: 0.22,
      fill: { color: C.navy },
      line: { width: 0 },
    });
    card(slide, pptx, 1.6, y, 10.9, 2.2);

    slide.addText(job.period, {
      x: 1.9,
      y: y + 0.2,
      w: 3.2,
      h: 0.28,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
    });
    slide.addText(job.company, {
      x: 5.2,
      y: y + 0.15,
      w: 4,
      h: 0.35,
      fontFace: FONT,
      fontSize: 18,
      color: C.navy,
      bold: true,
    });
    slide.addText(job.role, {
      x: 9.2,
      y: y + 0.2,
      w: 3.0,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12,
      color: C.navyMid,
      align: "right",
      bold: true,
    });

    slide.addText(job.focus, {
      x: 1.9,
      y: y + 0.55,
      w: 10.2,
      h: 0.28,
      fontFace: FONT,
      fontSize: 13,
      color: C.grayDark,
    });

    slide.addText(
      job.bullets.map((b) => ({ text: b, options: { breakLine: true } })),
      {
        x: 1.9,
        y: y + 0.95,
        w: 5.5,
        h: 1.0,
        fontFace: FONT,
        fontSize: 12,
        color: C.grayDark,
        bullet: { code: "25CF" },
        paraSpacing: { line: 22 },
      },
    );

    slide.addText("Key Projects", {
      x: 7.8,
      y: y + 0.95,
      w: 4.3,
      h: 0.25,
      fontFace: FONT,
      fontSize: 10,
      color: C.gray,
      bold: true,
    });
    slide.addText(job.projects, {
      x: 7.8,
      y: y + 1.25,
      w: 4.3,
      h: 0.7,
      fontFace: FONT,
      fontSize: 12,
      color: C.navy,
    });
  });
}

/* ─── 04 Core Skills ─── */

function addSkills(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "CORE SKILLS", 4);
  sectionTitle(slide, "Core Skills", "금융 계정계 개발·운영에 실제로 사용한 기술 스택");

  const groups = [
    {
      title: "Language",
      icon: "code",
      items: ["Java", "JavaScript", "SQL"],
    },
    {
      title: "Database",
      icon: "database",
      items: ["Oracle", "DB2", "MySQL"],
    },
    {
      title: "Framework / UI",
      icon: "monitor",
      items: ["XFrame", "MDD", "Devon Studio"],
    },
    {
      title: "Interface",
      icon: "link",
      items: ["AnyLink", "Cube FEP", "H2H / FTP"],
    },
    {
      title: "Ops & SCM",
      icon: "git",
      items: ["SVN", "FRISM", "Orange"],
    },
    {
      title: "Domain",
      icon: "building",
      items: ["여신 계정계", "CB 연계", "배치·성능"],
    },
  ];

  groups.forEach((g, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MX + col * 4.05;
    const y = 1.75 + row * 2.45;
    card(slide, pptx, x, y, 3.85, 2.25);
    iconBadge(slide, pptx, g.icon, x + 0.28, y + 0.28, 0.42);
    slide.addText(g.title, {
      x: x + 0.85,
      y: y + 0.32,
      w: 2.7,
      h: 0.35,
      fontFace: FONT,
      fontSize: 14,
      color: C.navy,
      bold: true,
    });
    g.items.forEach((item, j) => {
      const iy = y + 0.9 + j * 0.38;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.28,
        y: iy,
        w: 3.3,
        h: 0.32,
        fill: { color: C.white },
        line: { color: C.grayLine, width: 0.75 },
        rectRadius: 0.06,
      });
      slide.addText(item, {
        x: x + 0.4,
        y: iy,
        w: 3.0,
        h: 0.32,
        fontFace: FONT,
        fontSize: 12,
        color: C.grayDark,
        valign: "middle",
      });
    });
  });
}

/* ─── 05 Project KB ─── */

function addProjectKb(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "PROJECT 01", 5);
  sectionTitle(
    slide,
    "KB국민카드 캄보디아 글로벌 여신",
    "LG CNS  ·  운영 PL  ·  2022.09 — Present",
  );

  // Overview + Role
  card(slide, pptx, MX, 1.7, 5.9, 1.55);
  iconBadge(slide, pptx, "briefcase", MX + 0.25, 1.9, 0.36);
  slide.addText("Overview", {
    x: MX + 0.75,
    y: 1.92,
    w: 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.navy,
    bold: true,
  });
  slide.addText(
    "글로벌 여신 시스템의 지급·심사·배치·대외연계를 운영 PL로 총괄.\n안정성·성능·정합성을 동시에 관리하는 운영 체계를 고도화.",
    {
      x: MX + 0.25,
      y: 2.35,
      w: 5.4,
      h: 0.7,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    },
  );

  card(slide, pptx, 6.9, 1.7, 5.7, 1.55);
  iconBadge(slide, pptx, "user", 7.15, 1.9, 0.36);
  slide.addText("Role", {
    x: 7.65,
    y: 1.92,
    w: 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.navy,
    bold: true,
  });
  slide.addText(
    [
      { text: "운영 PL · 개선 설계 주도", options: { breakLine: true } },
      { text: "장애 표준화 · 성능 과제 운영", options: { breakLine: true } },
      { text: "신규 모듈(리스 사전심사) 설계·개발", options: {} },
    ],
    {
      x: 7.15,
      y: 2.35,
      w: 5.2,
      h: 0.75,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
      bullet: { code: "25CF" },
    },
  );

  // Architecture + Environment
  card(slide, pptx, MX, 3.4, 7.4, 1.35);
  iconBadge(slide, pptx, "layers", MX + 0.25, 3.55, 0.34);
  slide.addText("Architecture", {
    x: MX + 0.7,
    y: 3.55,
    w: 2.5,
    h: 0.28,
    fontFace: FONT,
    fontSize: 12,
    color: C.navy,
    bold: true,
  });
  const arch = ["H2H Payment", "Batch / SQL", "iFL Screen", "ABA Link", "TTS Monitor"];
  arch.forEach((a, i) => {
    const x = MX + 0.25 + (i % 3) * 2.35;
    const y = 3.95 + Math.floor(i / 3) * 0.42;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 2.2,
      h: 0.34,
      fill: { color: C.white },
      line: { color: C.navy, width: 1 },
      rectRadius: 0.07,
    });
    slide.addText(a, {
      x,
      y,
      w: 2.2,
      h: 0.34,
      fontFace: FONT,
      fontSize: 11,
      color: C.navy,
      align: "center",
      valign: "middle",
      bold: true,
    });
  });

  card(slide, pptx, 8.4, 3.4, 4.2, 1.35);
  iconBadge(slide, pptx, "cpu", 8.65, 3.55, 0.34);
  slide.addText("Environment", {
    x: 9.15,
    y: 3.55,
    w: 3,
    h: 0.28,
    fontFace: FONT,
    fontSize: 12,
    color: C.navy,
    bold: true,
  });
  slide.addText("Java  ·  Oracle / DB2  ·  XFrame5\nCube FEP / AnyLink  ·  SVN / FRISM", {
    x: 8.65,
    y: 4.0,
    w: 3.7,
    h: 0.55,
    fontFace: FONT,
    fontSize: 12,
    color: C.grayDark,
  });

  // Achievements
  const ach = [
    { num: "70%↓", label: "지급 오류율", icon: "shield" },
    { num: "30%↓", label: "지급 처리시간", icon: "zap" },
    { num: "80%↓", label: "배치·온라인 병목", icon: "trending" },
    { num: "7+", label: "주요 배치 자동점검", icon: "activity" },
  ];
  ach.forEach((a, i) => {
    const x = MX + i * 3.1;
    card(slide, pptx, x, 4.95, 2.95, 1.65);
    iconBadge(slide, pptx, a.icon, x + 0.2, 5.1, 0.32);
    slide.addText(a.num, {
      x: x + 0.2,
      y: 5.5,
      w: 2.55,
      h: 0.45,
      fontFace: FONT,
      fontSize: 24,
      color: C.navy,
      bold: true,
    });
    slide.addText(a.label, {
      x: x + 0.2,
      y: 6.05,
      w: 2.55,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12,
      color: C.gray,
    });
  });
}

/* ─── 06 Project Woori ─── */

function addProjectWoori(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "PROJECT 02", 6);
  sectionTitle(
    slide,
    "우리금융캐피탈 여신 계정계",
    "IT개발팀 매니저  ·  2018.05 — 2022.08",
  );

  card(slide, pptx, MX, 1.7, 5.9, 1.4);
  iconBadge(slide, pptx, "briefcase", MX + 0.25, 1.88, 0.36);
  slide.addText("Overview", {
    x: MX + 0.75,
    y: 1.9,
    w: 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.navy,
    bold: true,
  });
  slide.addText(
    "자동차금융·신용·담보대출 계정계 개발·운영.\nCB 연계·규제 대응·자동화를 중심으로 안정성을 강화.",
    {
      x: MX + 0.25,
      y: 2.3,
      w: 5.4,
      h: 0.6,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    },
  );

  card(slide, pptx, 6.9, 1.7, 5.7, 1.4);
  iconBadge(slide, pptx, "user", 7.15, 1.88, 0.36);
  slide.addText("Role", {
    x: 7.65,
    y: 1.9,
    w: 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: C.navy,
    bold: true,
  });
  slide.addText(
    [
      { text: "여신 전 과정 시스템 개발·운영", options: { breakLine: true } },
      { text: "CB·대외기관 인터페이스 설계", options: { breakLine: true } },
      { text: "규제·성능·자동화 과제 수행", options: {} },
    ],
    {
      x: 7.15,
      y: 2.28,
      w: 5.2,
      h: 0.7,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
      bullet: { code: "25CF" },
    },
  );

  const items = [
    {
      title: "CB 실시간 집중",
      desc: "D+1 파일 집중 → 온라인 실시간 전환\n이중화·실패 알림으로 규제 리스크 예방",
      icon: "activity",
    },
    {
      title: "담보 설정 자동화",
      desc: "정부24 / e-CAR 연계 배치 자동화\n수작업 제거 · 처리시간·정확성 개선",
      icon: "settings",
    },
    {
      title: "트래픽 · QoS 안정화",
      desc: "세션·대역폭 증설 + QoS 우선순위\n신용조회 지연·응답 성능 개선",
      icon: "server",
    },
    {
      title: "법정최고금리 개편",
      desc: "24% → 20% 금리 로직 전면 점검\n사전 검증으로 규제 위반 없이 전환",
      icon: "shield",
    },
  ];
  items.forEach((it, i) => {
    const x = MX + (i % 4) * 3.1;
    const y = 3.3;
    card(slide, pptx, x, y, 2.95, 2.7);
    iconBadge(slide, pptx, it.icon, x + 0.2, y + 0.2, 0.38);
    slide.addText(it.title, {
      x: x + 0.2,
      y: y + 0.75,
      w: 2.55,
      h: 0.5,
      fontFace: FONT,
      fontSize: 13,
      color: C.navy,
      bold: true,
    });
    slide.addText(it.desc, {
      x: x + 0.2,
      y: y + 1.35,
      w: 2.55,
      h: 1.15,
      fontFace: FONT,
      fontSize: 11,
      color: C.grayDark,
    });
  });

  card(slide, pptx, MX, 6.15, 12.0, 0.7);
  iconBadge(slide, pptx, "cpu", MX + 0.2, 6.3, 0.32);
  slide.addText("Environment", {
    x: MX + 0.65,
    y: 6.32,
    w: 1.6,
    h: 0.3,
    fontFace: FONT,
    fontSize: 12,
    color: C.navy,
    bold: true,
  });
  slide.addText(
    "Java  ·  Oracle  ·  XFrame / MDD  ·  Cube FEP / AnyLink  ·  SVN  ·  CB (신용정보원 · NICE · KCB)",
    {
      x: MX + 2.4,
      y: 6.32,
      w: 9.8,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12,
      color: C.grayDark,
    },
  );
}

/* ─── 07 Achievements ─── */

function addAchievements(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "ACHIEVEMENTS", 7);
  sectionTitle(slide, "Project Achievement", "숫자로 보는 운영·성능·안정화 성과");

  const metrics = [
    { value: "8+", label: "Years", sub: "Financial IT" },
    { value: "2", label: "Companies", sub: "Capital · Card" },
    { value: "8+", label: "Key Projects", sub: "Core Outcomes" },
    { value: "70%", label: "Error ↓", sub: "Payment Process" },
    { value: "30%", label: "Faster", sub: "Disbursement" },
    { value: "80%", label: "Faster", sub: "Batch / Online" },
    { value: "24h", label: "Monitoring", sub: "TTS Alert" },
    { value: "100%", label: "Compliance", sub: "Rate Cap Cutover" },
  ];

  metrics.forEach((m, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = MX + col * 3.1;
    const y = 1.85 + row * 2.45;
    card(slide, pptx, x, y, 2.95, 2.2);
    slide.addText(m.value, {
      x: x + 0.2,
      y: y + 0.35,
      w: 2.55,
      h: 0.7,
      fontFace: FONT,
      fontSize: 36,
      color: C.navy,
      bold: true,
      align: "center",
    });
    slide.addText(m.label, {
      x: x + 0.2,
      y: y + 1.15,
      w: 2.55,
      h: 0.35,
      fontFace: FONT,
      fontSize: 14,
      color: C.navyMid,
      bold: true,
      align: "center",
    });
    slide.addText(m.sub, {
      x: x + 0.2,
      y: y + 1.55,
      w: 2.55,
      h: 0.3,
      fontFace: FONT,
      fontSize: 11,
      color: C.gray,
      align: "center",
    });
  });
}

/* ─── 08 Strength ─── */

function addStrength(pptx) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addChrome(slide, pptx, "STRENGTH", 8);
  sectionTitle(slide, "Strength", "금융권 IT 경력직으로서 바로 기여할 수 있는 강점");

  const strengths = [
    {
      icon: "monitor",
      title: "금융 IT 운영",
      desc: "장애를 복구에서 끝내지 않고\n원인·구조를 표준으로 남깁니다.",
    },
    {
      icon: "layers",
      title: "계정계",
      desc: "캐피탈·카드 여신 코어의\n개발·운영 경험을 보유합니다.",
    },
    {
      icon: "link",
      title: "전자금융 · 대외연계",
      desc: "CB·ABA·H2H 등 연계 구간의\n정합성과 예외 처리를 설계합니다.",
    },
    {
      icon: "database",
      title: "SQL 성능개선",
      desc: "실행계획·인덱스·배치 병렬화로\n처리시간을 지속적으로 단축합니다.",
    },
    {
      icon: "settings",
      title: "운영 자동화",
      desc: "반복 업무와 모니터링을 자동화해\n야간·장애 대응 부담을 줄입니다.",
    },
    {
      icon: "target",
      title: "PL 경험",
      desc: "요구 분석부터 배포·운영까지\n개선 과제를 End-to-End로 이끕니다.",
    },
  ];

  strengths.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MX + col * 4.05;
    const y = 1.75 + row * 2.45;
    card(slide, pptx, x, y, 3.85, 2.25);
    iconBadge(slide, pptx, s.icon, x + 0.28, y + 0.3, 0.48);
    slide.addText(s.title, {
      x: x + 0.95,
      y: y + 0.38,
      w: 2.6,
      h: 0.35,
      fontFace: FONT,
      fontSize: 15,
      color: C.navy,
      bold: true,
    });
    slide.addText(s.desc, {
      x: x + 0.28,
      y: y + 1.05,
      w: 3.3,
      h: 0.9,
      fontFace: FONT,
      fontSize: 13,
      color: C.grayDark,
    });
  });
}

/* ─── 09 Thank You ─── */

function addThankYou(pptx) {
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: C.navy },
    line: { width: 0 },
  });
  slide.addText("Thank You", {
    x: MX,
    y: 2.4,
    w: W - MX * 2,
    h: 0.8,
    fontFace: FONT,
    fontSize: 44,
    color: C.white,
    bold: true,
    align: "center",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: W / 2 - 0.6,
    y: 3.4,
    w: 1.2,
    h: 0.04,
    fill: { color: C.white },
    line: { width: 0 },
  });
  slide.addText("최지웅  ·  Financial IT Engineer", {
    x: MX,
    y: 3.7,
    w: W - MX * 2,
    h: 0.4,
    fontFace: FONT,
    fontSize: 16,
    color: "A8B3C5",
    align: "center",
  });
  slide.addText("choiry0321@gmail.com", {
    x: MX,
    y: 4.25,
    w: W - MX * 2,
    h: 0.35,
    fontFace: FONT,
    fontSize: 14,
    color: C.white,
    align: "center",
  });
  slide.addText("LG CNS  ·  우리금융캐피탈", {
    x: MX,
    y: 5.0,
    w: W - MX * 2,
    h: 0.3,
    fontFace: FONT,
    fontSize: 12,
    color: "7A8BA3",
    align: "center",
  });
}

/* ─── run ─── */

async function main() {
  const pptx = createDeck();
  const outDir = path.join(__dirname, "dist");
  const fs = require("fs");
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = "20260802";
  const filename = `${stamp}_최지웅_Project_Portfolio_v1.0.pptx`;
  const outPath = path.join(outDir, filename);
  const careerPath = path.join(
    "D:",
    "개인",
    "02_Career",
    "1. Resume",
    filename,
  );

  await pptx.writeFile({ fileName: outPath });
  try {
    fs.copyFileSync(outPath, careerPath);
    console.log("Saved:", outPath);
    console.log("Copied:", careerPath);
  } catch (err) {
    console.log("Saved:", outPath);
    console.warn("Career folder copy skipped:", err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
