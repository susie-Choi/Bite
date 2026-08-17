import type { Metadata, Viewport } from "next";
import Script from "next/script";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import "./globals.css";

const GTM_ID = "GTM-MF3GJX4J";

export const metadata: Metadata = {
  title: "여행한끼 – 여행지 마트에서, 오늘 뭐 먹지?",
  description:
    "해외여행 중 현지 마트·편의점에서 한 끼를 해결해야 할 때, 지금 내 상황에 맞는 간편식을 추천합니다.",
  openGraph: {
    title: "여행한끼",
    description: "여행지 마트에서, 오늘 뭐 먹지?",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        {/* End Google Tag Manager */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-surface-muted">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <WebVitalsReporter />
        <main className="mx-auto min-h-dvh max-w-mobile bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
