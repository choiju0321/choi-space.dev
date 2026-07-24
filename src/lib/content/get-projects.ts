import { projects } from "@/content/projects";
import type { Project } from "@/types/content";

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}
