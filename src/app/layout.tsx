import type { Metadata, Viewport } from "next";
import GAScript from "@/components/GAScript";
import "./globals.css";

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
  maximumScale: 1,
  userScalable: false,
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
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bg-surface-muted">
        <GAScript />
        <main className="mx-auto min-h-dvh max-w-mobile bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
