export default function ChatLoading() {
  return (
    <div className="mx-auto flex h-dynamic min-h-dynamic w-full max-w-5xl flex-col px-0 py-0 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-paper/95 shadow-none sm:rounded-[1.75rem] sm:border sm:border-rule/70 sm:shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-3 border-b border-rule/80 bg-paper/95 px-3.5 py-3 backdrop-blur-xl sm:px-4 sm:py-4">
          <div className="h-9 w-9 rounded-full bg-paper-2 animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-paper-2 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-24 rounded bg-paper-2 animate-pulse" />
            <div className="h-4 w-32 rounded bg-paper-2 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-ink" />
        </div>
      </div>
    </div>
  );
}