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
import { hasWriteSession } from "@/lib/write/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = getProfile();
  const life = getLife();
  const projects = getFeaturedProjects();
  const aboutSource = await getAboutMdxSource();
  const authenticated = await hasWriteSession();

  // 일반: 블로그성 Life 중심. Career·상세 서류는 관리자(또는 향후 이직 패키지)용.
  const career = authenticated ? getCareerWithDocumentStatus() : null;

  return (
    <>
      <HeroSection profile={profile} />
      <AboutSection profile={profile} source={aboutSource} />
      <LifeSection life={life} />
      {career ? <CareerSection career={career} profile={profile} /> : null}
      {authenticated ? <FeaturedWorkSection projects={projects} /> : null}
      <ContactSection profile={profile} />
    </>
  );
}
