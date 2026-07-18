import type { Metadata } from "next";
import { InteriorinStudio } from "@/components/product/interiorin-studio";

export const metadata: Metadata = {
  title: "Interiorin — instant spatial design studio",
  description: "Enter an interior or exterior space, generate reasoned 3D directions, refine them by voice or text, compare named versions, and export a professional review package.",
};

export default function StudioPage() {
  return <InteriorinStudio />;
}
