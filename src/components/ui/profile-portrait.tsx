import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ProfileImage } from "@/types/content";

type ProfilePortraitProps = {
  image: ProfileImage;
  className?: string;
  priority?: boolean;
};

export function ProfilePortrait({
  image,
  className,
  priority = false,
}: ProfilePortraitProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-surface-muted)]",
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        className="h-full w-full object-cover object-top"
        sizes="(max-width: 768px) 280px, 360px"
      />
    </div>
  );
}
