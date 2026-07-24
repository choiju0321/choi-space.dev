import {
  AboutSection,
  CareerSection,
  ContactSection,
  FeaturedWorkSection,
  HeroSection,
  LifeSection,
} from "@/features/home";
import {
  getAboutMdxSource,
  getCareerWithDocumentStatus,
  getFeaturedProjects,
  getLife,
  getProfile,
} from "@/lib/content";

export default async function HomePage() {
  const profile = getProfile();
  const career = getCareerWithDocumentStatus();
  const life = getLife();
  const projects = getFeaturedProjects();
  const aboutSource = await getAboutMdxSource();

  return (
    <>
      <HeroSection profile={profile} />
      <AboutSection profile={profile} source={aboutSource} />
      <CareerSection career={career} profile={profile} />
      <LifeSection life={life} />
      <FeaturedWorkSection projects={projects} />
      <ContactSection profile={profile} />
    </>
  );
}
