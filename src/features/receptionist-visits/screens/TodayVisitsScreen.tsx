"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { VisitStatusEnum } from "@/enum/visit-status.enum";
import VitalSignFormDialog from "@/features/receptionist-visits/components/VitalSignFormDialog";
import { useTodayVisits } from "@/features/receptionist-visits/hooks/useTodayVisits";
import type { VisitItem } from "@/features/receptionist-visits/types/visit.types";
import {
    formatVisitSchedule,
    getVisitStatusLabel,
    getVisitStatusVariant,
} from "@/features/receptionist-visits/utils/visit.utils";
import { Activity, CheckCircle2, Clock3, Loader2, RefreshCcw, Users } from "lucide-react";
import { useState } from "react";

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "waiting", label: "Chờ check-in" },
  { value: "checked-in", label: "Đã check-in" },
] as const;

export default function TodayVisitsScreen() {
  const {
    visits,
    loading,
    refreshing,
    checkingInVisitId,
    error,
    filter,
    setFilter,
    refresh,
    checkInVisit,
    counts,
  } = useTodayVisits();

  const [vitalSignVisit, setVitalSignVisit] = useState<VisitItem | null>(null);
  const [vitalSignDialogOpen, setVitalSignDialogOpen] = useState(false);

  const openVitalSignDialog = (visit: VisitItem) => {
    setVitalSignVisit(visit);
    setVitalSignDialogOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="cursor-default overflow-hidden border-emerald-200/70 shadow-sm transition-none hover:scale-100 dark:border-emerald-900/40">
        <CardHeader className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50 via-white to-sky-50 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-gray-950 dark:to-sky-950/30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Today Visits
              </CardTitle>
              <CardDescription>
                Quản lý lượt khám trong ngày và thực hiện check-in cho bệnh nhân đã đến quầy.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1">
                  <Clock3 className="h-4 w-4 text-amber-600" />
                  Chờ check-in: <strong className="text-foreground">{counts.waiting}</strong>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Đã check-in: <strong className="text-foreground">{counts.checkedIn}</strong>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1">
                  Tổng: <strong className="text-foreground">{counts.total}</strong>
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={() => refresh()} disabled={refreshing} className="gap-2">
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((option) => {
              const active = filter === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          {error && !loading ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
              <div className="flex items-center justify-between gap-3">
                <p>{error}</p>
                <Button type="button" size="sm" variant="outline" onClick={() => refresh()}>
                  Thử lại
                </Button>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Đang tải danh sách lượt khám...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : visits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      Không có lượt khám phù hợp với bộ lọc hiện tại.
                    </TableCell>
                  </TableRow>
                ) : (
                  visits.map((visit) => {
                    const isCheckingIn = checkingInVisitId === visit.id;
                    const canCheckIn = visit.status === VisitStatusEnum.CREATED;
                    const canRecordVitalSign =
                      visit.status === VisitStatusEnum.CHECKED_IN ||
                      visit.status === VisitStatusEnum.IN_PROGRESS;

                    return (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.patientName}</TableCell>
                        <TableCell>{visit.doctorName}</TableCell>
                        <TableCell>{formatVisitSchedule(visit.scheduledAt)}</TableCell>
                        <TableCell>
                          <Badge variant={getVisitStatusVariant(visit.status)}>
                            {getVisitStatusLabel(visit.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canCheckIn ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void checkInVisit(visit.id)}
                              disabled={Boolean(checkingInVisitId)}
                              className="gap-2"
                            >
                              {isCheckingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              {isCheckingIn ? "Đang xử lý" : "Check-in"}
                            </Button>
                          ) : canRecordVitalSign ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openVitalSignDialog(visit)}
                              className="gap-2"
                            >
                              <Activity className="h-4 w-4" />
                              Ghi nhận chỉ số
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VitalSignFormDialog
        visit={vitalSignVisit}
        open={vitalSignDialogOpen}
        onOpenChange={setVitalSignDialogOpen}
      />
    </div>
  );
}