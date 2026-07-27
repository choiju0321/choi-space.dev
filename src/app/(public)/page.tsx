import {
  AboutCardSection,
  BrandStorySection,
  ExploreSection,
  HeroSection,
} from "@/features/home";
import { getProfile } from "@/lib/content";

export default function HomePage() {
  const profile = getProfile();

  return (
    <>
      <HeroSection />
      <BrandStorySection />
      <AboutCardSection profile={profile} />
      <ExploreSection />
    </>
  );
}
