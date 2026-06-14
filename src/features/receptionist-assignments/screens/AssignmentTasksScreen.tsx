"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Loader2, RefreshCcw } from "lucide-react";

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
import {
  AssignmentTask,
  acceptAssignmentTask,
  getBlockedReasonMessage,
  isTransientBlockedReason,
  listAssignmentTasks,
  releaseAssignmentTask,
} from "@/apis/appointment/assignment-task.api";
import { AssignDoctorSlotDialog } from "../components/AssignDoctorSlotDialog";
import { useAssignmentTaskRealtime } from "../hooks/useAssignmentTaskRealtime";

// The DB queue is the source of truth; poll so the screen stays correct with zero realtime.
const QUEUE_POLL_INTERVAL_MS = 20_000;

type LoadMode = "initial" | "refresh" | "silent";

type StatusFilter = "PENDING" | "ASSIGNED";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "PENDING", label: "Chờ nhận" },
  { value: "ASSIGNED", label: "Đã nhận" },
];

const formatDeadline = (deadlineAt: number): string => {
  try {
    return new Date(deadlineAt).toLocaleString("vi-VN");
  } catch {
    return String(deadlineAt);
  }
};

export default function AssignmentTasksScreen() {
  const [tasks, setTasks] = useState<AssignmentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("PENDING");
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [assignTask, setAssignTask] = useState<AssignmentTask | null>(null);
  const [currentAccountId, setCurrentAccountId] = useState<string>("");

  // Keep the latest filter readable from interval/realtime callbacks without re-subscribing.
  const filterRef = useRef<StatusFilter>(filter);
  filterRef.current = filter;
  // Guard so background (poll/realtime) refreshes never stack on top of each other.
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentAccountId(localStorage.getItem("accountId") ?? localStorage.getItem("id") ?? "");
    }
  }, []);

  const load = useCallback(async (status: StatusFilter, mode: LoadMode = "initial") => {
    if (mode === "silent" && inFlightRef.current) return;
    inFlightRef.current = true;
    if (mode === "initial") setLoading(true);
    else if (mode === "refresh") setRefreshing(true);
    try {
      const res = await listAssignmentTasks({ status, limit: 50 });
      setTasks(res.data?.items ?? []);
    } catch (error) {
      // Background refresh failures must not spam toasts — the next poll tick retries.
      if (mode !== "silent") {
        toast.error(getBlockedReasonMessage(error, "Không thể tải danh sách yêu cầu phân công."));
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(filter, "initial");
  }, [filter, load]);

  // Polling fallback: works even if every realtime notification is missed.
  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      void load(filterRef.current, "silent");
    }, QUEUE_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  // Realtime nudge (best-effort): refresh sooner when an ASSIGNMENT_TASK_* notification arrives.
  useAssignmentTaskRealtime(() => {
    void load(filterRef.current, "silent");
  });

  const handleAccept = useCallback(
    async (task: AssignmentTask) => {
      if (busyTaskId) return;
      setBusyTaskId(task._id);
      try {
        await acceptAssignmentTask(task._id);
        toast.success("Đã nhận yêu cầu. Hãy phân công bác sĩ và khung giờ.");
        await load(filter, "refresh");
      } catch (error) {
        const message = getBlockedReasonMessage(error, "Không thể nhận yêu cầu.");
        // TASK_LOCK_HELD is transient (another receptionist is mid-action) → retryable info toast;
        // the task is still PENDING so its card stays visible after refresh. A durable reason
        // (e.g. TASK_ALREADY_ACCEPTED) is an error and the stale card drops out of the PENDING
        // filter automatically. Either way, refresh to reflect the DB truth.
        if (isTransientBlockedReason(error)) {
          toast.info(message);
        } else {
          toast.error(message);
        }
        await load(filter, "refresh");
      } finally {
        setBusyTaskId(null);
      }
    },
    [busyTaskId, filter, load]
  );

  const handleRelease = useCallback(
    async (task: AssignmentTask) => {
      if (busyTaskId) return;
      setBusyTaskId(task._id);
      try {
        await releaseAssignmentTask(task._id);
        toast.success("Đã trả yêu cầu về hàng đợi.");
        await load(filter, "refresh");
      } catch (error) {
        toast.error(getBlockedReasonMessage(error, "Không thể trả yêu cầu."));
      } finally {
        setBusyTaskId(null);
      }
    },
    [busyTaskId, filter, load]
  );

  const isOwner = (task: AssignmentTask) =>
    Boolean(currentAccountId) && task.acceptedByReceptionistId === currentAccountId;

  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="cursor-default overflow-hidden border-emerald-200/70 shadow-sm transition-none hover:scale-100 dark:border-emerald-900/40">
        <CardHeader className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50 via-white to-sky-50 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-gray-950 dark:to-sky-950/30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ClipboardList className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Phân công bác sĩ
              </CardTitle>
              <CardDescription>
                Hàng đợi các lịch hẹn đặt không chọn bác sĩ. Nhận yêu cầu rồi phân công bác sĩ và khung giờ.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void load(filter, "refresh")}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chuyên khoa</TableHead>
                  <TableHead>Lý do khám</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Hạn xử lý</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Đang tải hàng đợi...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                      Không có yêu cầu nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => {
                    const busy = busyTaskId === task._id;
                    return (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">{task.specialty || "—"}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{task.reasonForAppointment || "—"}</TableCell>
                        <TableCell>{task.patientEmail || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="orange">{formatDeadline(task.deadlineAt)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {task.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void handleAccept(task)}
                              disabled={Boolean(busyTaskId)}
                              className="gap-2"
                            >
                              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              Nhận
                            </Button>
                          ) : task.status === "ASSIGNED" && isOwner(task) ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setAssignTask(task)}
                                disabled={Boolean(busyTaskId)}
                              >
                                Phân công
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void handleRelease(task)}
                                disabled={Boolean(busyTaskId)}
                              >
                                Trả lại
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {task.status === "ASSIGNED" ? "Lễ tân khác đang xử lý" : task.status}
                            </span>
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

      <AssignDoctorSlotDialog
        task={assignTask}
        onClose={() => setAssignTask(null)}
        onAssigned={() => {
          setAssignTask(null);
          void load(filter, "refresh");
        }}
      />
    </div>
  );
}
