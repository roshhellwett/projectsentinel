export default function ChatLoading() {
  return (
    <div className="chat-workspace site-container flex flex-col py-4 sm:py-6">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rule bg-paper">
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
