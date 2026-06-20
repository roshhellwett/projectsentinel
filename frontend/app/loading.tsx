

export default function Loading() {
  return (
    <div className="absolute top-0 left-0 w-full z-[100] pointer-events-none">
      <div className="h-[3px] w-full overflow-hidden bg-accent-soft/30">
        <div className="h-full bg-accent animate-progress-indeterminate shadow-[0_0_8px_rgba(var(--c-accent),0.4)]" />
      </div>
    </div>
  );
}
