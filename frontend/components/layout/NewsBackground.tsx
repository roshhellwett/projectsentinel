export function NewsBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden scale-[1.02] transition-transform duration-700 ease-out"
        style={{ backgroundImage: 'url("/webmob.webp")', filter: "blur(2.5px)" }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block scale-[1.01] transition-transform duration-700 ease-out"
        style={{ backgroundImage: 'url("/webdesk.webp")', filter: "blur(2.5px)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          imageRendering: "pixelated",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-paper/30 via-transparent to-paper/80"
      />
    </div>
  );
}
