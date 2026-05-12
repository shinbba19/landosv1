import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "LANDOS V1 — Land Development Feasibility",
  description: "ระบบวิเคราะห์ความเป็นไปได้ในการพัฒนาที่ดิน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
