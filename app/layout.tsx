import type { Metadata } from "next";
import "../styles/globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "체체 (CheChé)",
  description: "당신의 체험단, 이제 한 곳에서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div
          style={{
            maxWidth: "393px",
            margin: "0 auto",
            height: "100dvh",
            background: "var(--bg-card)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
