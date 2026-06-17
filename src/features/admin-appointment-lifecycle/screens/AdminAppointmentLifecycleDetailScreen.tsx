"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Database,
  FileWarning,
  GitBranch,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminAppointmentLifecycle } from "@/features/admin-appointment-lifecycle/hooks/useAdminAppointmentLifecycle";
import { useLifecycleNodeDetail } from "@/features/admin-appointment-lifecycle/hooks/useLifecycleNodeDetail";
import {
  ActorSummary,
  LifecycleEdge,
  LifecycleNode,
  LifecycleNodeDetail,
  LifecycleWarning,
} from "@/features/admin-appointment-lifecycle/types/admin-appointment-lifecycle.types";
import {
  badgeToneClass,
  edgeForNode,
  formatActorConfidenceLabel,
  formatActorLabel,
  formatActorMeta,
  formatEdgeStatusLabel,
  formatPhaseLabel,
  formatStatusLabel,
  formatTimestamp,
  getActorConfidenceTone,
  getEdgeTone,
  getNodeStatusTone,
  getStatusTone,
  getWarningTone,
  groupNodesByPhase,
  snapshotValueToText,
  warningLabel,
} from "@/features/admin-appointment-lifecycle/utils/lifecycle-formatters";

const Pill = ({
  children,
  tone = "gray",
  className,
}: {
  children: React.ReactNode;
  tone?: Parameters<typeof badgeToneClass>[0];
  className?: string;
}) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", badgeToneClass(tone), className)}>
    {children}
  </span>
);

const WarningChips = ({ warnings = [], compact = false }: { warnings?: LifecycleWarning[]; compact?: boolean }) => {
  if (!warnings.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {warnings.map((warning, index) => (
        <Pill key={`${warning.code}-${index}`} tone={getWarningTone(warning.severity)} className={compact ? "px-2 py-0.5" : undefined}>
          <AlertTriangle className="h-3.5 w-3.5" />
          {warningLabel(warning)}
        </Pill>
      ))}
    </div>
  );
};

const ActorBlock = ({ actor }: { actor?: ActorSummary | null }) => {
  const meta = formatActorMeta(actor);

  return (
    <div className="flex items-start gap-2 text-sm">
      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{formatActorLabel(actor)}</p>
        {meta ? <p className="break-all text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </div>
  );
};

const SnapshotRows = ({ snapshot }: { snapshot?: Record<string, unknown> | null }) => {
  const entries = Object.entries(snapshot ?? {});

  if (!entries.length) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        No sanitized snapshot was provided for this node.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="divide-y">
        {entries.map(([key, value]) => (
          <div key={key} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[170px_minmax(0,1fr)]">
            <span className="font-medium text-muted-foreground">{formatStatusLabel(key)}</span>
            <span className="break-words text-foreground">{snapshotValueToText(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NodeDetailContent = ({
  selectedNode,
  edge,
  detail,
  loading,
  error,
  onRetry,
}: {
  selectedNode: LifecycleNode | null;
  edge?: LifecycleEdge;
  detail: LifecycleNodeDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) => {
  if (!selectedNode) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Select a lifecycle node to inspect its sanitized source detail.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading node detail...
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-3">
            <div>
              <p className="font-semibold">Node detail unavailable</p>
              <p>{error}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sourceCollection = detail?.sourceMeta?.collection || selectedNode.sourceCollection || "Missing related record";
  const sourceRecordId = detail?.sourceMeta?.recordId || selectedNode.sourceRecordId || "Missing related record";
  const warnings = detail?.warnings ?? selectedNode.warnings ?? [];
  const actor = detail?.actor ?? selectedNode.actor;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={getNodeStatusTone(selectedNode.nodeStatus)}>{formatStatusLabel(selectedNode.nodeStatus)}</Pill>
          <Pill tone="blue">{formatPhaseLabel(detail?.phase ?? selectedNode.phase)}</Pill>
          {detail?.complete === false ? <Pill tone="orange">Incomplete detail</Pill> : null}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{selectedNode.label || "Unlinked event"}</h3>
          <p className="text-sm text-muted-foreground">{detail?.eventType || selectedNode.eventType || "Unknown event"}</p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3">
          <span className="text-muted-foreground">Timestamp</span>
          <span className="text-right font-medium">{formatTimestamp(detail?.timestamp ?? selectedNode.timestamp)}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status before</p>
            <p className="mt-1 font-medium">{detail?.statusBefore || selectedNode.statusBefore || "Unknown status"}</p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status after</p>
            <p className="mt-1 font-medium">{detail?.statusAfter || selectedNode.statusAfter || "Unknown status"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">Actor</p>
          <Pill tone={getActorConfidenceTone(actor?.actorConfidence)}>
            {formatActorConfidenceLabel(actor?.actorConfidence)}
          </Pill>
        </div>
        <ActorBlock actor={actor} />
        {actor?.actorWarnings?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {actor.actorWarnings.map((warning) => (
              <Pill key={warning} tone="orange">{warning}</Pill>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            Source collection
          </p>
          <p className="mt-1 break-all font-medium">{sourceCollection}</p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Source record id</p>
          <p className="mt-1 break-all font-medium">{sourceRecordId}</p>
        </div>
      </div>

      {edge ? (
        <div className="rounded-xl border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Edge confidence</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill tone={getEdgeTone(edge.edgeStatus)}>{formatEdgeStatusLabel(edge.edgeStatus)}</Pill>
            <WarningChips warnings={edge.warnings} compact />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="font-semibold">Warnings</p>
        {warnings.length ? (
          <WarningChips warnings={warnings} />
        ) : (
          <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">No node warnings.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Sanitized domain snapshot</p>
        <SnapshotRows snapshot={detail?.domainSnapshot} />
      </div>
    </div>
  );
};

const NodeCard = ({
  node,
  edge,
  selected,
  onSelect,
}: {
  node: LifecycleNode;
  edge?: LifecycleEdge;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "w-full rounded-2xl border bg-background p-4 text-left shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50/60 dark:hover:border-sky-900/70 dark:hover:bg-sky-950/20",
      selected && "border-sky-500 bg-sky-50 ring-2 ring-sky-200 dark:border-sky-700 dark:bg-sky-950/30 dark:ring-sky-900/50"
    )}
  >
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="font-semibold text-foreground">{node.label || "Unlinked event"}</p>
        <p className="break-all text-xs uppercase tracking-wide text-muted-foreground">{node.eventType || "UNKNOWN_EVENT"}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        <Pill tone={getNodeStatusTone(node.nodeStatus)}>{formatStatusLabel(node.nodeStatus)}</Pill>
        {edge ? <Pill tone={getEdgeTone(edge.edgeStatus)}>{formatEdgeStatusLabel(edge.edgeStatus)}</Pill> : null}
      </div>
    </div>

    <div className="mt-3 grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarClock className="h-4 w-4" />
        <span>{formatTimestamp(node.timestamp)}</span>
      </div>
      <ActorBlock actor={node.actor} />
    </div>

    {node.summary && Object.keys(node.summary).length ? (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Object.entries(node.summary).slice(0, 3).map(([key, value]) => (
          <Pill key={key} tone="gray">
            {formatStatusLabel(key)}: {snapshotValueToText(value)}
          </Pill>
        ))}
      </div>
    ) : null}

    {node.warnings?.length ? (
      <div className="mt-3">
        <WarningChips warnings={node.warnings} compact />
      </div>
    ) : null}
  </button>
);

export default function AdminAppointmentLifecycleDetailScreen({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const { tree, loading, refreshing, error, refresh } = useAdminAppointmentLifecycle(appointmentId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({
    COMMUNICATION: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (role && role !== "ADMIN") {
      toast.error("Only admins can view appointment lifecycle data.");
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!tree?.nodes?.length) return;
    setSelectedNodeId((current) => current ?? tree.rootNodeId ?? tree.nodes[0]?.id ?? null);
  }, [tree]);

  const groupedPhases = useMemo(() => groupNodesByPhase(tree?.nodes ?? [], tree?.phases ?? []), [tree]);
  const selectedNode = useMemo(
    () => tree?.nodes?.find((node) => node.id === selectedNodeId) ?? null,
    [selectedNodeId, tree]
  );
  const selectedEdge = useMemo(
    () => (selectedNodeId ? edgeForNode(tree?.edges ?? [], selectedNodeId) : undefined),
    [selectedNodeId, tree]
  );
  const nodeDetail = useLifecycleNodeDetail(appointmentId, selectedNodeId);

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setMobileDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-[520px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="cursor-default border-rose-200 shadow-sm transition-none hover:scale-100 hover:shadow-sm dark:border-rose-900/50">
        <CardContent className="space-y-4 p-6">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/admin/appointments">
              <ArrowLeft className="h-4 w-4" />
              Back to appointments
            </Link>
          </Button>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Unable to load lifecycle</p>
                  <p className="text-sm">{error}</p>
                </div>
                <Button type="button" variant="outline" onClick={() => refresh()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tree) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Appointment lifecycle is unavailable.
      </div>
    );
  }

  const globalWarnings = tree.globalWarnings ?? [];
  const appointment = tree.appointment;

  return (
    <div className="space-y-5">
      <Card className="cursor-default overflow-hidden border-sky-200/70 shadow-sm transition-none hover:scale-100 hover:shadow-sm dark:border-sky-900/40">
        <CardHeader className="border-b border-sky-100/80 bg-gradient-to-r from-sky-50 via-white to-emerald-50 dark:border-sky-900/40 dark:from-sky-950/40 dark:via-gray-950 dark:to-emerald-950/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Button asChild variant="outline" size="sm" className="w-fit gap-2">
                <Link href="/admin/appointments">
                  <ArrowLeft className="h-4 w-4" />
                  Back to appointments
                </Link>
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <GitBranch className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  Lifecycle tree
                </CardTitle>
                <CardDescription className="mt-2 break-all">Appointment ID: {appointment.id || appointmentId}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill tone={getStatusTone(appointment.appointmentStatus)}>
                  {formatStatusLabel(appointment.appointmentStatus)}
                </Pill>
                <Pill tone={getStatusTone(appointment.depositStatus)}>
                  Deposit: {formatStatusLabel(appointment.depositStatus)}
                </Pill>
                <Pill tone={getStatusTone(appointment.assignmentStatus)}>
                  Assignment: {formatStatusLabel(appointment.assignmentStatus)}
                </Pill>
                {tree.reconstruction?.partial ? <Pill tone="orange">Reconstructed from incomplete data</Pill> : null}
              </div>
            </div>

            <Button type="button" variant="outline" onClick={() => refresh()} disabled={refreshing} className="gap-2">
              <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Patient</p>
            <p className="mt-1 break-all font-semibold">{appointment.patient?.email || "Missing related record"}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Doctor</p>
            <p className="mt-1 font-semibold">{appointment.doctor?.name || "Missing related record"}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled</p>
            <p className="mt-1 font-semibold">{formatTimestamp(appointment.scheduledAt)}</p>
          </div>
          <div className="rounded-xl border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Generated</p>
            <p className="mt-1 font-semibold">{formatTimestamp(tree.reconstruction?.generatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {globalWarnings.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <FileWarning className="h-5 w-5" />
            Reconstruction warnings
          </div>
          <WarningChips warnings={globalWarnings} />
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          {groupedPhases.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No lifecycle nodes were reconstructed for this appointment.
            </div>
          ) : (
            groupedPhases.map((group) => {
              const collapsed = collapsedPhases[group.phase] ?? false;

              return (
                <Card key={group.phase} className="cursor-default overflow-hidden border shadow-sm transition-none hover:scale-100 hover:shadow-sm">
                  <button
                    type="button"
                    onClick={() => setCollapsedPhases((current) => ({ ...current, [group.phase]: !collapsed }))}
                    className="flex w-full items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{formatPhaseLabel(group.phase)}</p>
                        <p className="text-xs text-muted-foreground">{group.nodes.length} node{group.nodes.length === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                    <Pill tone={getNodeStatusTone(group.phaseSummary?.status)}>
                      {formatStatusLabel(group.phaseSummary?.status, group.nodes.length ? "Unknown status" : "Missing related record")}
                    </Pill>
                  </button>

                  {!collapsed ? (
                    <CardContent className="space-y-4 pt-5">
                      {group.nodes.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                          No concrete lifecycle nodes in this phase.
                        </div>
                      ) : (
                        <div className="relative space-y-4 pl-5 before:absolute before:bottom-4 before:left-2 before:top-4 before:w-px before:bg-border">
                          {group.nodes.map((node) => (
                            <div key={node.id} className="relative">
                              <span className="absolute -left-[19px] top-5 h-3 w-3 rounded-full border-2 border-background bg-sky-500 shadow" />
                              <NodeCard
                                node={node}
                                edge={edgeForNode(tree.edges, node.id)}
                                selected={selectedNodeId === node.id}
                                onSelect={() => selectNode(node.id)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>

        <aside className="hidden xl:block">
          <Card className="sticky top-6 max-h-[calc(100vh-3rem)] cursor-default overflow-y-auto border shadow-sm transition-none hover:scale-100 hover:shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Node detail</CardTitle>
              <CardDescription>Lazy-loaded sanitized source detail for the selected lifecycle node.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <NodeDetailContent
                selectedNode={selectedNode}
                edge={selectedEdge}
                detail={nodeDetail.detail}
                loading={nodeDetail.loading}
                error={nodeDetail.error}
                onRetry={() => void nodeDetail.retry()}
              />
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl xl:hidden">
          <DialogHeader>
            <DialogTitle>Node detail</DialogTitle>
            <DialogDescription>Sanitized lifecycle source details.</DialogDescription>
          </DialogHeader>
          <NodeDetailContent
            selectedNode={selectedNode}
            edge={selectedEdge}
            detail={nodeDetail.detail}
            loading={nodeDetail.loading}
            error={nodeDetail.error}
            onRetry={() => void nodeDetail.retry()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
