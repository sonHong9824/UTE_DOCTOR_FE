import { CheckCircle2, Lightbulb } from "lucide-react";

const tips = [
  "Duy trì vận động phù hợp và đều đặn.",
  "Ăn uống cân bằng, ngủ đủ giấc.",
  "Tái khám theo lịch hoặc hướng dẫn của nhân viên y tế.",
];

export function HealthTipsCard() {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-card dark:to-cyan-950/20">
      <div className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
        <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
          <Lightbulb className="h-4 w-4" />
        </span>
        Gợi ý chăm sóc sức khỏe
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
        Thông tin tham khảo chung
      </p>
      <ul className="mt-3 space-y-3">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

