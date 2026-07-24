import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Growth",
  description: "자기계발·학습·회고 글을 모아 둡니다.",
};

export default function GrowthPage() {
  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Growth
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Growth
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          학습 노트, 회고, 습관, 성장에 관한 글입니다. Life(경험 아카이브)와
          나누어 둡니다.
        </p>
        <p className="mt-10 text-sm text-[var(--color-muted-soft)]">
          글 목록은 곧 연결합니다.
        </p>
      </Container>
    </div>
  );
}
