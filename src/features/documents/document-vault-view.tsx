import { FadeIn } from "@/components/ui/fade-in";
import { DocumentWorkbench } from "@/features/documents/document-manager";
import type { DocumentSlotStatus } from "@/types/content";

type VaultGroupView = {
  id: string;
  label: string;
  description: string;
  documents: DocumentSlotStatus[];
};

type DocumentVaultViewProps = {
  groups: VaultGroupView[];
};

export function DocumentVaultView({ groups }: DocumentVaultViewProps) {
  const total = groups.reduce((sum, group) => sum + group.documents.length, 0);
  const ready = groups.reduce(
    (sum, group) =>
      sum + group.documents.filter((document) => document.available).length,
    0,
  );

  return (
    <div className="mt-10">
      <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
        등록 {ready}/{total}
      </p>

      <div className="mt-10 space-y-14">
        {groups.map((group, index) => (
          <FadeIn key={group.id} delayMs={index * 40}>
            <section>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                {group.label}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {group.description}
              </p>
              <div className="mt-5">
                <DocumentWorkbench documents={group.documents} />
              </div>
            </section>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
