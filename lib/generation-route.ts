import type { GenerationType } from "@/lib/types";

const generationSourceRoutes: Record<GenerationType, string> = {
  "text-to-image": "/text-to-image",
  "image-to-image": "/image-to-image",
};

/**
 * Returns the creation route that owns a generated job.
 */
export function getGenerationSourceRoute(type: GenerationType): string {
  return generationSourceRoutes[type];
}
