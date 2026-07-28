export default function ChatLoading() {
  return (
    <div className="mx-auto flex min-h-dynamic w-full max-w-3xl flex-col bg-paper">
      <div className="flex items-center gap-3 border-b border-rule bg-paper/90 px-4 py-3 backdrop-blur-md">
        <div className="h-9 w-9 rounded-full bg-paper-2 animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-paper-2 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-24 rounded bg-paper-2 animate-pulse" />
          <div className="h-4 w-32 rounded bg-paper-2 animate-pulse" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-rule border-t-ink" />
      </div>
    </div>
  );
}