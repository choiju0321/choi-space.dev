"""Generate 제자벨 발제문 PDF from Trevari meeting topics."""

from pathlib import Path

from fpdf import FPDF

FONT = Path(r"C:\Windows\Fonts\malgun.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\malgunbd.ttf")

ARCHIVE_DIR = Path(r"D:\개인\04_Personal\07. Activity\트레바리\[202603-202606] 문-조은풀")
PROJECT_DIR = Path(r"D:\Projects\choi-space\private\reading\presentations")
FILE_NAME = "202607_발제문_제자벨.pdf"
SLUG_PDF = "2026-06-30-jezebel.pdf"

SECTIONS = [
    {
        "title": "막장드라마의 여주인공, 글라디스",
        "questions": [
            "여러분이 본 작품 중 가장 '막장' 이라고 느꼈던 영화나 소설은 무엇인가요?",
            "<제자벨>에는 어떤 막장드라마적 요소가 등장한다고 생각하나요?",
            "글라디스를 한 단어로 표현한다면?",
        ],
    },
    {
        "title": "소설의 시작: 재판",
        "questions": [
            "만약 시간의 순서대로 이야기가 진행되었다면 글라디스를 지금과 다르게 바라봤을까요?",
            "재판 장면을 먼저 본 덕분에 그녀를 더 냉정하게 판단하게 되었나요, 아니면 오히려 이해하게 되었나요?",
        ],
    },
    {
        "title": "늙음을 견디지 못하는 글라디스",
        "questions": [
            "젊음을 유지하려는 노력은 어디까지 자연스럽다고 생각하시나요?",
            "어디부터를 '관리'가 아닌 '집착'이라 부를 수 있을까요?",
            "여러분이 생각하는 '건강한 자기관리'와 '집착'의 경계는 어디인가요?",
        ],
    },
    {
        "title": "여자 vs 엄마",
        "questions": [
            "여러분은 글라디스를 좋은 엄마라고 생각하시나요?",
            "그녀에게 모성애가 없었던 걸까요, 아니면 다른 욕망이 더 컸던 걸까요?",
            "우리는 '엄마라면 이래야 한다'는 기준으로 그녀를 더 엄격하게 판단하고 있는 것은 아닐까요?",
            "똑같이 행동한 인물이 '아버지'였다면 지금처럼 비난했을까요?",
        ],
    },
    {
        "title": "글라디스는 진짜 '제자벨'인가, 시대의 희생자인가",
        "questions": [
            "글라디스는 자신의 아름다움과 젊음을 무기로 타인을 조종한, 이름 그대로의 '제자벨'에 가까운가요?",
            "아니면 여성의 가치를 외모와 젊음으로만 평가하던 시대가 만들어낸 희생자에 가까운가요?",
            "그녀의 비극은 개인의 선택 때문일까요, 아니면 시대·계급·성별이라는 환경의 영향도 컸을까요?",
            "만약 글라디스가 다른 시대, 다른 환경에서 태어났다면 같은 삶을 살았을까요?",
            "오늘날 우리는 외모, 나이, 사회적 역할이라는 기준에서 완전히 자유로워졌다고 할 수 있을까요?",
            "글라디스에게 '젊음'이 자신의 존재를 증명하는 유일한 방법이었다면, 지금 나에게 절대 잃고 싶지 않은 것은 무엇인가요?",
        ],
    },
    {
        "title": "마무리 토크",
        "questions": [
            "소설 속 인상적인 구절들을 나눠보아요.",
            "다음 모임에 바라는 점이 있나요?",
            "다같이 단체 사진 찍어보아요.",
        ],
    },
]

SCHEDULE = [
    ("19:30", "오프닝 & 독후감 토크"),
    ("19:50", "북 토크"),
    ("21:00", "쉬는 시간"),
    ("21:10", "북 토크"),
    ("22:20", "마무리 발언"),
    ("22:30", "모임 끝!"),
]


class PresentationPDF(FPDF):
    def footer(self) -> None:
        self.set_y(-12)
        self.set_font("Malgun", size=9)
        self.set_text_color(140, 140, 140)
        self.cell(0, 8, f"{self.page_no()}", align="C")


def add_heading(pdf: PresentationPDF, text: str, size: int = 18) -> None:
    pdf.set_font("Malgun", "B", size)
    pdf.set_text_color(28, 28, 28)
    pdf.multi_cell(0, size * 0.65, text)
    pdf.ln(4)


def add_meta(pdf: PresentationPDF, label: str, value: str) -> None:
    pdf.set_font("Malgun", size=11)
    pdf.set_text_color(110, 110, 110)
    pdf.cell(28, 7, label)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 7, value, new_x="LMARGIN", new_y="NEXT")


def add_question(pdf: PresentationPDF, text: str) -> None:
    if pdf.get_y() > 260:
        pdf.add_page()
    pdf.set_font("Malgun", size=12)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(0, 7.5, f"·  {text}")
    pdf.ln(3)


def build() -> Path:
    pdf = PresentationPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_font("Malgun", "", str(FONT))
    pdf.add_font("Malgun", "B", str(FONT_BOLD if FONT_BOLD.exists() else FONT))
    pdf.set_margins(18, 18, 18)

    # Cover
    pdf.add_page()
    pdf.ln(28)
    pdf.set_font("Malgun", size=12)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 8, "트레바리 · 문-조은풀 · 2026년 7월", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    pdf.set_font("Malgun", "B", 28)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 14, "제자벨", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Malgun", size=14)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(0, 8, "이렌 네미롭스키", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(16)
    pdf.set_draw_color(210, 210, 210)
    pdf.line(60, pdf.get_y(), 150, pdf.get_y())
    pdf.ln(14)
    pdf.set_font("Malgun", size=12)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(0, 8, "발제문 · 북토크 질문", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 7, "발제자 · 파트너  조은진", align="C", new_x="LMARGIN", new_y="NEXT")

    # Meta / schedule
    pdf.add_page()
    add_heading(pdf, "모임 안내")
    add_meta(pdf, "클럽", "문-조은풀")
    add_meta(pdf, "읽을거리", "이렌 네미롭스키 『제자벨』")
    add_meta(pdf, "발제자", "조은진")
    add_meta(pdf, "파트너", "조은진")
    pdf.ln(8)
    add_heading(pdf, "시간표", size=15)
    for time, item in SCHEDULE:
        pdf.set_font("Malgun", size=12)
        pdf.set_text_color(110, 110, 110)
        pdf.cell(22, 8, time)
        pdf.set_text_color(35, 35, 35)
        pdf.cell(0, 8, item, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)
    add_heading(pdf, "공지", size=15)
    pdf.set_font("Malgun", size=12)
    pdf.set_text_color(45, 45, 45)
    pdf.multi_cell(
        0,
        7.5,
        "금요일 저녁으로 시간이 변경된 첫 모임, 시간 걱정 없이 하고 싶었던 이야기 다 나누고 갑시다.",
    )

    # Topics
    for section in SECTIONS:
        pdf.add_page()
        pdf.set_font("Malgun", size=10)
        pdf.set_text_color(130, 130, 130)
        pdf.cell(0, 6, "북토크", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)
        add_heading(pdf, section["title"], size=17)
        pdf.ln(2)
        for question in section["questions"]:
            add_question(pdf, question)

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    PROJECT_DIR.mkdir(parents=True, exist_ok=True)

    archive_path = ARCHIVE_DIR / FILE_NAME
    project_path = PROJECT_DIR / SLUG_PDF
    pdf.output(str(archive_path))
    project_path.write_bytes(archive_path.read_bytes())
    print(f"Wrote {archive_path}")
    print(f"Wrote {project_path}")
    return archive_path


if __name__ == "__main__":
    build()
