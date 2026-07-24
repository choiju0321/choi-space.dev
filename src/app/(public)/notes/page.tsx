import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Notes",
  description: "정보·칼럼·청약·팁 정리 글을 모아 둡니다.",
};

export default function NotesPage() {
  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Notes
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Notes
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          청약·기사형 정리, 팁, 스크랩 해설처럼 정보성 글을 둡니다. 개인 자산
          관리(Finance)와는 별개입니다.
        </p>
        <p className="mt-10 text-sm text-[var(--color-muted-soft)]">
          글 목록은 곧 연결합니다.
        </p>
      </Container>
    </div>
  );
}
