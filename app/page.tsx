export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#e8e2d3] text-[#2e332d]">
      <h1 className="sr-only">寻味二里半——岳麓山下的人间烟火</h1>
      <iframe
        src="/map/index.html"
        title="寻味二里半互动地图"
        className="h-full w-full border-0 bg-[#e8e2d3]"
        allow="geolocation; fullscreen"
        allowFullScreen
      />
      <noscript>
        <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-6 text-center shadow-xl">
          请开启浏览器 JavaScript 后浏览“寻味二里半”互动地图。
        </p>
      </noscript>
    </main>
  );
}
