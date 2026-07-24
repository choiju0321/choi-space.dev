import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/container";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
};

export function Section({
  children,
  className,
  id,
  containerClassName,
}: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-24 sm:py-32", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
