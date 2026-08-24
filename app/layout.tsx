import type { Metadata } from "next";
import { WorkspaceProvider } from "@/lib/workspace";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://science-evidence-lab.yurosung.chatgpt.site"),
  title: "과학 증거 탐구 작업실",
  description:
    "과학 자료를 관찰하고 질문을 만들며, 선택한 근거를 바탕으로 CER 설명을 완성하는 학생 탐구 작업실입니다.",
  openGraph: {
    title: "과학 증거 탐구 작업실",
    description: "자료를 보고, 질문하고, 근거로 설명합니다.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "과학 증거 탐구 작업실",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "과학 증거 탐구 작업실",
    description: "자료를 보고, 질문하고, 근거로 설명합니다.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
