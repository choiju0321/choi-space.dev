import { permanentRedirect } from "next/navigation";

/** 구 경로 /career/package → /career/masters */
export default function CareerPackageRedirectPage() {
  permanentRedirect("/career/masters");
}
