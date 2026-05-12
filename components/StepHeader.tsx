import clsx from "clsx";

interface Props {
  step: number;
  title: string;
  subtitle: string;
  className?: string;
}

export default function StepHeader({ step, title, subtitle, className }: Props) {
  return (
    <div className={clsx("mb-8", className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
          {step}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
