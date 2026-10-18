/** 详情页路由骨架: 海报 + 信息区 + 播放列表, 与最终布局同构 */
export default function DetailLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 rounded-lg bg-cinema-panel p-4 sm:flex-row sm:p-6">
        <div className="aspect-[2/3] w-32 shrink-0 animate-pulse rounded-md bg-white/5 sm:w-40" />
        <div className="flex-1 space-y-3.5 py-2">
          <div className="flex gap-1.5">
            <div className="h-5 w-10 animate-pulse rounded bg-white/5" />
            <div className="h-5 w-14 animate-pulse rounded bg-white/5" />
            <div className="h-5 w-12 animate-pulse rounded bg-white/5" />
          </div>
          <div className="h-8 w-3/5 animate-pulse rounded bg-white/5" />
          <div className="h-3 w-full animate-pulse rounded bg-white/5" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
          <div className="h-11 w-36 animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-2 rounded-lg bg-cinema-panel p-4">
          <div className="h-5 w-20 animate-pulse rounded bg-white/5" />
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded bg-white/5" />
            ))}
          </div>
        </div>
        <div className="hidden space-y-2.5 rounded-lg bg-cinema-panel p-4 lg:block">
          <div className="h-5 w-28 animate-pulse rounded bg-white/5" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <div className="h-14 w-10 animate-pulse rounded-sm bg-white/5" />
              <div className="h-3 flex-1 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
