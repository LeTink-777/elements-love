import type { Metadata } from "next";
import { SuccessView } from "@/components/SuccessView";

export const metadata: Metadata = {
  title: "Оплата принята — Совместимость по стихиям",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return <SuccessView />;
}
