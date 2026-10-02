import { PropertyGridSkeleton } from "./property-card";

export function ListingSkeleton() {
  return (
    <>
      <div className="hero-pattern h-44" />
      <div className="container-site grid gap-6 py-10 lg:grid-cols-[300px_1fr]">
        <div className="skeleton hidden h-[640px] rounded-2xl lg:block" />
        <div>
          <div className="skeleton mb-5 h-6 w-48 rounded" />
          <PropertyGridSkeleton count={6} />
        </div>
      </div>
    </>
  );
}
