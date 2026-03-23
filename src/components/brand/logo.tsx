import { ShieldCheck } from "lucide-react";

export function BrandLogo({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 font-bold ${className}`}>
      <div
        className={`p-1.5 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/30 ${iconClassName}`}
      >
        <ShieldCheck className="w-6 h-6" />
      </div>
      <span className="tracking-tight text-slate-900 dark:text-white">
        Brigad<span className="text-indigo-600">App</span>
      </span>
    </div>
  );
}
