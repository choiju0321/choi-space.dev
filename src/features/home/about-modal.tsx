"use client";

import { Modal } from "@/components/ui/modal";
import { ProfilePortrait } from "@/components/ui/profile-portrait";
import { homeContent } from "@/content/home";
import type { ProfileImage } from "@/types/content";

type AboutModalProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  image: ProfileImage;
};

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--color-border)]/60 pt-7 first:border-t-0 first:pt-0">
      <h3 className="text-[0.7rem] font-medium tracking-[0.16em] text-[var(--color-muted-soft)] uppercase">
        {title}
      </h3>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

/** Profile sheet — 랜딩을 떠나지 않고 사람을 더 깊게 본다 */
export function AboutModal({ open, onClose, email, image }: AboutModalProps) {
  const { aboutModal } = homeContent;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={aboutModal.eyebrow}
      title={aboutModal.title}
      description={aboutModal.description}
      className="max-w-xl sm:max-w-2xl"
    >
      <div className="space-y-7 pb-2">
        <Block title="Profile">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <ProfilePortrait
              image={image}
              className="mx-auto w-full max-w-[140px] sm:mx-0"
            />
            <div className="space-y-2 text-sm leading-7 text-[var(--color-muted)]">
              {aboutModal.profile.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </Block>

        <Block title="Timeline">
          <ul className="space-y-5">
            {aboutModal.timeline.map((item) => (
              <li key={`${item.period}-${item.label}`} className="flex gap-4">
                <p className="w-[4.5rem] shrink-0 pt-0.5 text-[0.7rem] tabular-nums tracking-wide text-[var(--color-muted-soft)] uppercase sm:w-24">
                  {item.period}
                </p>
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Values">
          <ul className="space-y-2.5 text-sm leading-7 text-[var(--color-muted)]">
            {aboutModal.values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </Block>

        <Block title="Hobbies">
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            {aboutModal.hobbies.join(" · ")}
          </p>
        </Block>

        <Block title="Skills">
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            {aboutModal.skills.join(" · ")}
          </p>
        </Block>

        <Block title="Contact">
          <p className="text-sm leading-7 text-[var(--color-muted)]">
            {aboutModal.contactNote}
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            {email}
          </a>
        </Block>
      </div>
    </Modal>
  );
}
