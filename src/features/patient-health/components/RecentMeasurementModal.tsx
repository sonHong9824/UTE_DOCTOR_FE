"use client";

import { History } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecentMeasurementCard } from "@/features/patient-health/components/RecentMeasurementCard";
import type {
  PatientHealthDataSource,
  PatientVitalSignRecordDto,
} from "@/features/patient-health/types/patient-health.types";

interface RecentMeasurementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: PatientVitalSignRecordDto[];
  dataSource: PatientHealthDataSource;
  bloodTypeDisplay: string;
}

export function RecentMeasurementModal({
  open,
  onOpenChange,
  records,
  dataSource,
  bloodTypeDisplay,
}: RecentMeasurementModalProps) {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setExpandedRecordId(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-6 py-5 pr-12 dark:from-sky-950/40 dark:via-card dark:to-cyan-950/30">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200">
              <History className="h-5 w-5" />
            </span>
            Lịch sử đo gần đây
          </DialogTitle>
          <DialogDescription>Mỗi mục tương ứng với một phiên đo</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 dark:bg-slate-950/20">
          <div className="space-y-3">
            {records.map((record) => (
              <RecentMeasurementCard
                key={record.id}
                record={record}
                dataSource={dataSource}
                bloodTypeDisplay={bloodTypeDisplay}
                expanded={expandedRecordId === record.id}
                onToggle={() =>
                  setExpandedRecordId((current) => (current === record.id ? null : record.id))
                }
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

