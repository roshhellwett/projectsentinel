import { Z_INDEX } from "@/lib/theme/zIndex";

export default function Loading() {
  return (
    <div
      className={`fixed top-0 left-0 w-full ${Z_INDEX.loadingBar} pointer-events-none`}
    >
      <div className="h-[3px] w-full overflow-hidden bg-accent/10">
        <div
          className="h-full bg-gradient-to-r from-accent/60 via-accent to-accent/60 loading-bar-slide rounded-full"
          style={{
            boxShadow:
              "0 0 12px rgb(var(--c-accent) / 0.5), 0 0 4px rgb(var(--c-accent) / 0.3)",
          }}
        />
      </div>
    </div>
  );
}
