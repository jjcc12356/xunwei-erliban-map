import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '寻味二里半｜岳麓山下的人间烟火',
  description:
    '从岳麓山脚到湘江之畔，在三维地图、潇湘十二时辰、城市漫游与智能搜索中阅读二里半的山水、文脉与烟火。',
  openGraph: {
    title: '寻味二里半｜岳麓山下的人间烟火',
    description:
      '一张融合山水、文脉、烟火与十二时辰的长沙人文互动地图。',
    type: 'website',
    images: [{ url: '/og.png', width: 1280, height: 720 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '寻味二里半｜岳麓山下的人间烟火',
    description:
      '一张融合山水、文脉、烟火与十二时辰的长沙人文互动地图。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
