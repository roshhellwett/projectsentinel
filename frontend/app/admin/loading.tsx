export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-48 bg-rule/60 rounded mb-8" />

      <div className="np-card p-6">
        <div className="h-6 w-24 bg-rule/60 rounded mb-4" />

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-3/4 bg-rule/40 rounded" />
              <div className="h-4 w-1/4 bg-rule/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
