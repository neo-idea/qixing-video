/** 播放页路由骨架: 与最终布局同构, 导航即刻呈现 */
export default function PlayLoading() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
          <div className="absolute inset-0 grid place-items-center">
            <span className="block h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-cinema-brand" />
          </div>
        </div>
        <div className="mt-3 space-y-2.5 rounded-lg bg-cinema-panel p-4">
          <div className="h-6 w-1/2 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-2/5 animate-pulse rounded bg-white/5" />
        </div>
        <div className="mt-4 space-y-2 rounded-lg bg-cinema-panel p-4">
          <div className="h-4 w-28 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="hidden space-y-2 rounded-lg bg-cinema-panel p-4 lg:block">
        <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-9 animate-pulse rounded bg-white/5" />
        ))}
      </div>
    </div>
  );
}
