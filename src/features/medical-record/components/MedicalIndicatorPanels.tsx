"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ClipboardList,
  Gauge,
  HeartPulse,
  Pill,
  Stethoscope,
  Utensils,
  type LucideIcon,
} from "lucide-react";

interface MedicalIndicatorPanelsProps {
  active: string;
  record: any;
  onSelectRecord: (record: any) => void;
}

const fmtDate = (value?: string | number | Date | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "-";
const fmtDateTime = (value?: string | number | Date | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

const cardClass =
  "rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-900";

const getHistoryStatusMeta = (status?: string) => {
  switch (status) {
    case "ONGOING":
      return { label: "Đang điều trị", className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" };
    case "RESOLVED":
      return { label: "Đã khỏi", className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" };
    default:
      return status
        ? { label: status, className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" }
        : null;
  }
};

function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-sm italic text-muted-foreground">{message}</p>
    </div>
  );
}

function renderPanel(active: string, record: any, onSelectRecord: (record: any) => void) {
  switch (active) {
    case "medicalHistory":
      return record.medicalHistory.length === 0 ? (
        <EmptyState icon={ClipboardList} message="Chưa có tiền sử bệnh" />
      ) : (
        <div className="space-y-3">
          {record.medicalHistory.map((r: any) => {
            const statusMeta = getHistoryStatusMeta(r.status);
            return (
              <div key={r._id || r.dateRecord} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                        {r.conditionName || r.diagnosis || r.name || "Chẩn đoán"}
                      </h4>
                      {statusMeta ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            statusMeta.className
                          )}
                        >
                          {statusMeta.label}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fmtDate(r.diagnosedAt || r.dateRecord)}
                      {r.diagnosisCode ? ` · ICD ${r.diagnosisCode}` : ""}
                    </p>
                    {r.note ? (
                      <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{r.note}</p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 rounded-lg"
                    onClick={() => onSelectRecord(r)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      );

    case "drugAllergies":
    case "foodAllergies": {
      const list = active === "drugAllergies" ? record.drugAllergies : record.foodAllergies;
      const icon = active === "drugAllergies" ? Pill : Utensils;
      const emptyMsg =
        active === "drugAllergies" ? "Chưa có dị ứng thuốc" : "Chưa có dị ứng thức ăn";
      return list.length === 0 ? (
        <EmptyState icon={icon} message={emptyMsg} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((r: any) => (
            <div key={r._id || r.substance || r.name} className={cardClass}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  {active === "drugAllergies" ? (
                    <Pill className="h-4 w-4" />
                  ) : (
                    <Utensils className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                    {r.substance || r.name}
                  </h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {r.reaction || r.note || "Chưa có mô tả phản ứng"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {r.severity ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-amber-200">
                        Mức độ: {r.severity}
                      </span>
                    ) : null}
                    {r.reportedBy ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        Nguồn: {r.reportedBy === "DOCTOR" ? "Bác sĩ" : "Bệnh nhân"}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "encounters":
      return record.encounters.length === 0 ? (
        <EmptyState icon={Stethoscope} message="Chưa có lượt khám" />
      ) : (
        <div className="space-y-3">
          {record.encounters.map((e: any) => (
            <div key={e._id || e.appointmentId} className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                    {e.diagnosis || "Chẩn đoán"}
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{fmtDateTime(e.dateRecord)}</p>
                  {e.note ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.note}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {Array.isArray(e.prescriptions) && e.prescriptions.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                        <Pill className="h-3 w-3" /> {e.prescriptions.length} thuốc
                      </span>
                    ) : null}
                    {Array.isArray(e.vitalSigns) &&
                      e.vitalSigns.map((v: any, idx: number) => (
                        <span
                          key={v._id || idx}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {v.type === "BP"
                            ? `HA ${v.bloodPressure?.systolic ?? "-"}/${v.bloodPressure?.diastolic ?? "-"}`
                            : v.type === "HR"
                              ? `HR ${v.value ?? "-"}`
                              : `${v.type} ${v.value ?? "-"}`}
                        </span>
                      ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-lg"
                  onClick={() => onSelectRecord(e)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          ))}
        </div>
      );

    case "bloodPressure":
      return record.bloodPressure.length === 0 ? (
        <EmptyState icon={Gauge} message="Chưa có dữ liệu huyết áp" />
      ) : (
        <div className="space-y-2.5">
          {record.bloodPressure.map((r: any) => (
            <div
              key={r._id || r.dateRecord}
              className={cn(cardClass, "flex items-center justify-between gap-3")}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  <Gauge className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {r.value?.systolic ?? "-"}/{r.value?.diastolic ?? "-"}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">mmHg</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{fmtDateTime(r.dateRecord)}</span>
            </div>
          ))}
        </div>
      );

    case "heartRate":
      return record.heartRate.length === 0 ? (
        <EmptyState icon={Activity} message="Chưa có dữ liệu nhịp tim" />
      ) : (
        <div className="space-y-2.5">
          {record.heartRate.map((r: any) => (
            <div
              key={r._id || r.dateRecord}
              className={cn(cardClass, "flex items-center justify-between gap-3")}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {r.value ?? "-"}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">bpm</span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{fmtDateTime(r.dateRecord)}</span>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

// Animated panel that shows the records for the selected medical category.
export default function MedicalIndicatorPanels({
  active,
  record,
  onSelectRecord,
}: MedicalIndicatorPanelsProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderPanel(active, record, onSelectRecord)}
      </motion.div>
    </AnimatePresence>
  );
}
