"use client";

import { ArrowUpRight, History } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { RecentMeasurementCard } from "@/features/patient-health/components/RecentMeasurementCard";
import { RecentMeasurementModal } from "@/features/patient-health/components/RecentMeasurementModal";
import type {
  PatientHealthDataSource,
  PatientVitalSignRecordDto,
} from "@/features/patient-health/types/patient-health.types";

interface RecentMeasurementPreviewProps {
  records: PatientVitalSignRecordDto[];
  dataSource: PatientHealthDataSource;
  bloodTypeDisplay: string;
}

export function RecentMeasurementPreview({
  records,
  dataSource,
  bloodTypeDisplay,
}: RecentMeasurementPreviewProps) {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const previewRecords = records.slice(0, 2);

  return (
    <>
      <section className="w-full min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
              <History className="h-4 w-4 text-sky-600" />
              Lịch sử đo gần đây
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Mỗi mục tương ứng với một phiên đo
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryModalOpen(true)}
            className="h-auto shrink-0 gap-1 px-2 py-1 text-xs text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
          >
            Xem tất cả
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="space-y-2.5">
          {previewRecords.map((record) => (
            <RecentMeasurementCard
              key={record.id}
              record={record}
              dataSource={dataSource}
              bloodTypeDisplay={bloodTypeDisplay}
              expanded={expandedRecordId === record.id}
              onToggle={() =>
                setExpandedRecordId((current) => (current === record.id ? null : record.id))
              }
              compact
            />
          ))}
        </div>
      </section>

      <RecentMeasurementModal
        open={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        records={records}
        dataSource={dataSource}
        bloodTypeDisplay={bloodTypeDisplay}
      />
    </>
  );
}

