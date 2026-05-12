import type { Metadata } from "next";
import "./globals.css";
import StepNav from "@/components/StepNav";
import AiChat from "@/components/AiChat";

export const metadata: Metadata = {
  title: "LANDOS V1 — Land Development Feasibility",
  description: "ระบบวิเคราะห์ความเป็นไปได้ในการพัฒนาที่ดิน",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <div className="flex min-h-screen">
          <StepNav />
          <main className="flex-1 ml-64 min-h-screen">
            {children}
            <AiChat />
          </main>
        </div>
      </body>
    </html>
  );
}
