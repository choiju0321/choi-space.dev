import {
  AboutCardSection,
  BrandStorySection,
  ExploreSection,
  HeroSection,
} from "@/features/home";
import { AboutModalProvider } from "@/features/home/about-modal-context";
import { getProfile } from "@/lib/content";

export default function HomePage() {
  const profile = getProfile();

  return (
    <AboutModalProvider email={profile.email} image={profile.image}>
      <HeroSection />
      <BrandStorySection />
      <AboutCardSection profile={profile} />
      <ExploreSection />
    </AboutModalProvider>
  );
}
