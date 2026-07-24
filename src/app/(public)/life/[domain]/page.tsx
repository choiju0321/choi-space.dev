import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PlaceArchiveExplorer } from "@/features/place/place-archive-explorer";
import {
  getPlaceListItems,
} from "@/lib/content/get-place";
import type { PlaceDomain } from "@/types/place";

const DOMAIN_META: Record<
  PlaceDomain,
  { label: string; title: string; description: string }
> = {
  food: {
    label: "Food",
    title: "맛집 기록",
    description: "식사와 맛집 기록을 모읍니다.",
  },
  cafe: {
    label: "Cafe",
    title: "카페 기록",
    description: "카페와 공간의 기록을 모읍니다.",
  },
  travel: {
    label: "Travel",
    title: "여행 기록",
    description: "여행의 장면들을 모읍니다.",
  },
};

type PageProps = {
  params: Promise<{ domain: string }>;
};

function asDomain(value: string): PlaceDomain | null {
  if (value === "food" || value === "cafe" || value === "travel") return value;
  return null;
}

export function generateStaticParams() {
  return [{ domain: "food" }, { domain: "cafe" }, { domain: "travel" }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw } = await params;
  const domain = asDomain(raw);
  if (!domain) return { title: "Life" };
  return {
    title: DOMAIN_META[domain].label,
    description: DOMAIN_META[domain].description,
  };
}

export default async function PlaceArchivePage({ params }: PageProps) {
  const { domain: raw } = await params;
  const domain = asDomain(raw);
  if (!domain) notFound();

  const meta = DOMAIN_META[domain];
  const items = getPlaceListItems(domain);

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/#life" className="transition-opacity hover:opacity-70">
            Life
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {meta.label}
        </p>
        <header className="mt-6">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            {meta.label}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
            {meta.description}
          </p>
        </header>
        <div className="mt-10">
          <PlaceArchiveExplorer
            domain={domain}
            domainLabel={meta.title}
            items={items}
          />
        </div>
      </Container>
    </div>
  );
}
