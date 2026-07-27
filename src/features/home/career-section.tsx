import { DocumentSlotAttachments } from "@/features/content/document-slot-attachments";
import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import type {
  CareerContentWithStatus,
  CareerRecordWithDocuments,
  Profile,
} from "@/types/content";

type CareerSectionProps = {
  career: CareerContentWithStatus;
  profile: Pick<Profile, "name" | "email">;
};

function RecordList({ items }: { items: CareerRecordWithDocuments[] }) {
  return (
    <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {items.map((item) => (
        <li key={item.id} className="py-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <div className="min-w-0 max-w-xl">
              <p className="text-base font-medium tracking-tight text-[var(--color-foreground)] sm:text-lg">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.organization}
              </p>
              {item.description ? (
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
                  {item.description}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {item.period}
            </p>
          </div>
          {item.documents.length > 0 ? (
            <DocumentSlotAttachments documents={item.documents} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function CareerGroup({
  label,
  children,
  delayMs = 0,
}: {
  label: string;
  children: React.ReactNode;
  delayMs?: number;
}) {
  return (
    <FadeIn delayMs={delayMs} className="mt-14 first:mt-10">
      <h3 className="text-sm font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
        {label}
      </h3>
      <div className="mt-5">{children}</div>
    </FadeIn>
  );
}

export function CareerSection({ career, profile }: CareerSectionProps) {
  const basics = [
    { label: "이름", value: profile.name },
    { label: "생년월일", value: career.basics.birthDate },
    { label: "거주지", value: career.basics.location },
    { label: "이메일", value: profile.email },
  ];

  return (
    <Section id="career" className="bg-[var(--color-surface)]">
      <FadeIn>
        <p className="text-sm font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          Career
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          연혁
        </h2>
        <p className="mt-4 max-w-xl text-base text-[var(--color-muted)]">
          기본 정보부터 학력·병역·교육, 자격, 수상까지 — 어떤 길을 걸어왔는지
          정리했습니다.
        </p>
      </FadeIn>

      <CareerGroup label="기본정보" delayMs={40}>
        <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {basics.map((item) => (
            <div
              key={item.label}
              className="border-b border-[var(--color-border)] pb-4"
            >
              <dt className="text-sm text-[var(--color-muted-soft)]">
                {item.label}
              </dt>
              <dd className="mt-1 text-base text-[var(--color-foreground)]">
                {item.label === "이메일" ? (
                  <a
                    href={`mailto:${item.value}`}
                    className="transition-opacity hover:opacity-70"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </CareerGroup>

      <CareerGroup label="학력" delayMs={80}>
        <RecordList items={career.education} />
      </CareerGroup>

      <CareerGroup label="병역" delayMs={100}>
        <RecordList items={career.military} />
      </CareerGroup>

      <CareerGroup label="교육" delayMs={120}>
        <RecordList items={career.training} />
      </CareerGroup>

      <CareerGroup label="자격증" delayMs={140}>
        <RecordList items={career.certifications} />
      </CareerGroup>

      <CareerGroup label="수상내역" delayMs={170}>
        <RecordList items={career.awards} />
      </CareerGroup>
    </Section>
  );
}
