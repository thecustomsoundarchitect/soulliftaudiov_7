import { useLocation } from "wouter";

export default function NavigationArrows({ back, next }: { back?: string; next?: string }) {
  const [, navigate] = useLocation();

  return (
    <div className="flex justify-between mt-8 px-6">
      {back && (
        <button
          onClick={() => navigate(back)}
          className="text-base hover:underline"
        >
          ← Back
        </button>
      )}
      {next && (
        <button
          onClick={() => navigate(next)}
          className="text-base hover:underline"
        >
          Next →
        </button>
      )}
    </div>
  );
}