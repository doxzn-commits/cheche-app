import type { Metadata } from "next";
import Script from "next/script";
import "../styles/globals.css";
import BottomNav from "@/components/layout/BottomNav";
import GTMPageView from "@/components/analytics/GTMPageView";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NPWLSPWR');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NPWLSPWR"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <GTMPageView />

        <AuthSessionProvider>
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
        </AuthSessionProvider>
      </body>
    </html>
  );
}
