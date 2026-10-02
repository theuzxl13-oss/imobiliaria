export default function Loading() {
  return (
    <div>
      <div className="skeleton mb-2 h-8 w-64 rounded-lg" />
      <div className="skeleton mb-6 h-4 w-96 max-w-full rounded" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton mt-6 h-96 rounded-2xl" />
    </div>
  );
}
