"use client";
import { completeAppointment, getTodayAppointments } from "@/apis/appointment/appointment.api";
import { getMedicines, Medicine } from "@/apis/medicine/medicine.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import MedicalRecordDetailScreen from "@/features/medical-record/screens/MedicalRecordDetailScreen";
import { cn } from "@/lib/utils";
import { formatApiDateToLocalTime, parseApiDateTimeToLocal } from "@/utils/time.util";
import { Calendar, CheckCircle2, FileText, Plus, UserRound, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "Nam" | "Nữ";
  lastVisit: string;
  condition: string;
  status: "pending" | "done";
  avatar?: string;
};

type PendingRow = {
  rowId: string;
  time?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  service?: string;
  reason?: string;
  appt?: any | null;
  source: "appointment" | "patient";
  patientObj?: Patient;
};

// Helper to format a Date to local YYYY-MM-DD (avoid UTC timezone offset)
const formatDateLocal = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatLastVisitDate = (value?: string | number | Date) => {
  const parsed = value !== undefined ? parseApiDateTimeToLocal(value) : null;
  return formatDateLocal(parsed ?? new Date());
};

const formatDateDisplay = (value?: string | number | Date | null) => {
  if (value === undefined || value === null) return "-";
  const parsed = parseApiDateTimeToLocal(value);
  return parsed ? parsed.toLocaleDateString("vi-VN") : "-";
};

const formatTimeValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return "--:--";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "--:--";

    // Preserve backend HH:mm format while normalizing single-digit hour.
    const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) {
      return `${hhmmMatch[1].padStart(2, "0")}:${hhmmMatch[2]}`;
    }
  }

  const formatted = formatApiDateToLocalTime(value);
  return formatted || "--:--";
};

const formatTimeRange = (startTime?: string | number | null, endTime?: string | number | null) => {
  const start = formatTimeValue(startTime);
  const end = formatTimeValue(endTime);
  if (start === "--:--" && end === "--:--") return undefined;
  return `${start} - ${end}`;
};

const formatPatientId = (id?: string | null) => {
  if (!id) return '-';
  const s = String(id);
  return s.slice(-8).toUpperCase();
};

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Patient>("lastVisit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"pending" | "done">("pending");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState("");
  // medication form states
  const [drugQuery, setDrugQuery] = useState("");
  const [drugQty, setDrugQty] = useState<number>(1);
  const [drugNoteOption, setDrugNoteOption] = useState<string>("");
  const [drugNoteCustom, setDrugNoteCustom] = useState<string>("");
  const [drugNoteInput, setDrugNoteInput] = useState<string>("");
  const [medList, setMedList] = useState<Array<{ medicineId?: string; name: string; qty: number; note?: string }>>([]);
  const [medCatalog, setMedCatalog] = useState<Medicine[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<any | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  const filtered = useMemo(() => {
    // If viewing pending patients, derive them from today's appointments
    if (activeTab === "pending") {
      const pendingAppts = (todayAppointments || []).filter((a) => a.appointmentStatus !== "COMPLETED");

      // map appointment -> minimal Patient
      const mapped: Patient[] = pendingAppts
        .filter((a) => a.patient)
        .map((a) => {
          const p = a.patient;
          return {
            id: p._id || p.id || p.profileId || String(a._id || Math.random()),
            name: p.name || "Bệnh nhân",
            age: p.age || 0,
            gender: p.gender || "Nam",
            lastVisit: formatLastVisitDate(a?.date),
            condition: a?.reasonForAppointment || a?.serviceType || "",
            status: "pending",
            avatar: p.profileId?.avatarUrl || undefined,
          } as Patient;
        });

      // deduplicate by id
      const map = new Map<string, Patient>();
      for (const p of mapped) map.set(p.id, p);

      // apply search filter
      const filteredMapped = Array.from(map.values()).filter((p) =>
        [p.id, p.name, p.condition].some((v) => v.toLowerCase().includes(query.toLowerCase()))
      );

      // sort
      const sorted = filteredMapped.sort((a, b) => {
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
        return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });

      return sorted;
    }

    // otherwise (done tab) use patients state
    const base = patients
      .filter((p) => p.status === activeTab)
      .filter((p) => [p.id, p.name, p.condition].some((v) => v.toLowerCase().includes(query.toLowerCase())));

    // Sort by selected field
    return [...base].sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [patients, activeTab, query, sortBy, sortDir, todayAppointments]);

  // count of pending appointments (used in tab label)
  const pendingCount = (todayAppointments || []).filter((a) => a.appointmentStatus !== "COMPLETED").length;

  // build combined pending rows: appointment rows first, then patient-only pending entries
  const pendingRows = useMemo<PendingRow[]>(() => {
    const apptRows: PendingRow[] = (todayAppointments || [])
      .filter((a) => a.appointmentStatus !== "COMPLETED")
      .filter((a) => a.patient)
      .map((a) => {
        const prof = a.patient?.profileId;
        const med = a.patient?.medicalRecord || prof?.medicalRecord || undefined;
        return ({
          rowId: a._id,
          time: formatTimeRange(a.startTime, a.endTime),
          patientId: a.patient?._id || a.patient?.id || (prof && prof._id) || `APPT_${a._id}`,
          patientName: prof?.name || a.patient?.name || "Bệnh nhân",
          patientPhone: prof?.phone || a.patient?.phone,
          service: a.serviceType,
          reason: a.reasonForAppointment,
          appt: a,
          source: "appointment",
          patientObj: {
            id: a.patient?._id || a.patient?.id || (prof && prof._id) || `APPT_${a._id}`,
            name: prof?.name || a.patient?.name || "Bệnh nhân",
            age: a.patient?.age || 0,
            gender: a.patient?.gender || "Nam",
            lastVisit: formatLastVisitDate(a?.date),
            condition: a?.reasonForAppointment || a?.serviceType || "",
            status: a?.appointmentStatus === "COMPLETED" ? "done" : "pending",
            avatar: a.patient?.profileId?.avatarUrl || undefined,
          },
        } as PendingRow);
      });

    const apptIds = new Set(apptRows.map((r) => r.patientId));

    const patientOnly: PendingRow[] = (patients || [])
      .filter((p) => p.status === "pending" && !apptIds.has(p.id))
      .map((p) => ({
        rowId: p.id,
        patientId: p.id,
        patientName: p.name,
        patientPhone: undefined,
        service: undefined,
        reason: undefined,
        appt: null,
        source: "patient",
        patientObj: p,
      }));

    // combine and then apply search & sort similar to previous behavior
    const combined = [...apptRows, ...patientOnly];

    const searched = combined.filter((r) =>
      [r.patientId, r.patientName, r.reason, r.service]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(query.toLowerCase()))
    );

    const sorted = searched.sort((a, b) => {
      const va = (a as any)[sortBy];
      const vb = (b as any)[sortBy];
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va || "").localeCompare(String(vb || "")) : String(vb || "").localeCompare(String(va || ""));
    });

    return sorted;
  }, [todayAppointments, patients, query, sortBy, sortDir]);

  const toggleSort = (key: keyof Patient) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const openCompleteForm = (id: string) => {
    setSelectedId(id);
    setDiagnosis("");
    setTreatment("");
    setNotes("");
    setMedications("");
    setOpen(true);
  };

  const openApptDetail = (appt: any) => {
    setSelectedAppt(appt);
    setDetailOpen(true);
  };

  const markAppointmentComplete = (apptId: string) => {
    setTodayAppointments((prev) => prev.map((a) => (a._id === apptId ? { ...a, appointmentStatus: "COMPLETED" } : a)));
  };

  useEffect(() => {
    // fetch medicines catalog
    (async () => {
      try {
        const res = await getMedicines();
        // API may return either a raw array or an ApiResponse wrapper { code, message, data }
        let items: Medicine[] = [];
        if (Array.isArray(res)) items = res as Medicine[];
        else if (Array.isArray((res as any)?.data)) items = (res as any).data;
        else if (Array.isArray((res as any)?.items)) items = (res as any).items;
        else items = [];
        setMedCatalog(items);
      } catch (err) {
        console.error("Failed to load medicines", err);
        setMedCatalog([]);
      }
    })();

    const fetch = async () => {
      try {
        setApptLoading(true);
        const res = await getTodayAppointments();
        const items = res?.data || [];
        if (String(res?.code) === "SUCCESS") setTodayAppointments(items);
        else setTodayAppointments([]);

        // derive minimal patient list from appointments (remove duplicates)
        try {
          const extracted = (items || [])
            .filter((a: any) => a.patient)
            .map((a: any, idx: number) => {
              const p = a.patient;
              return {
                id: p._id || p.id || p.profileId || `APPT_${idx}`,
                name: p.name || "Bệnh nhân",
                age: p.age || 0,
                gender: p.gender || "Nam",
                lastVisit: formatLastVisitDate(a?.date),
                condition: a?.reasonForAppointment || a?.serviceType || "",
                status: a?.appointmentStatus === "COMPLETED" ? "done" : "pending",
                avatar: p.profileId?.avatarUrl || undefined,
              } as Patient;
            });

          // merge unique by id (preserve existing patients stored in state)
          const map = new Map<string, Patient>();
          for (const p of extracted) map.set(p.id, p);
          setPatients((prev) => {
            for (const p of prev) map.set(p.id, p);
            return Array.from(map.values());
          });
        } catch (err) {
          // ignore mapping errors
        }
      } catch (err) {
        console.error("Error fetching today appointments", err);
        setTodayAppointments([]);
      } finally {
        setApptLoading(false);
      }
    };

    fetch();
  }, []);

  const submitCompletion = () => {
    if (!selectedId) return;
  const today = formatDateLocal(new Date());
    const exists = patients.find((p) => p.id === selectedId);
    if (exists) {
      setPatients((prev) => prev.map((p) => (p.id === selectedId ? { ...p, status: "done", lastVisit: today } : p)));
    } else {
      // create a minimal patient entry from selectedAppt if available
      const appt = selectedAppt || todayAppointments.find(a => a.patient && (a.patient._id === selectedId || a.patient.id === selectedId));
      const newPatient: Patient = {
        id: selectedId,
        name: appt?.patient?.name || "Bệnh nhân",
        age: 0,
        gender: "Nam",
        lastVisit: today,
        condition: appt?.reasonForAppointment || appt?.serviceType || "",
        status: "done",
        avatar: "/assets/bs/bs-Minh.jpg",
      };
      setPatients((prev) => [newPatient, ...prev]);
    }

    // mark appointment completed if present
    setTodayAppointments((prev) => prev.map((a) => (a.patient && (a.patient._id === selectedId || a.patient.id === selectedId)) ? { ...a, appointmentStatus: "COMPLETED" } : a));
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Quản lý bệnh nhân</h1> */}
          <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi và thăm khám bệnh nhân</p>
        </div>
        {/* <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-3 text-sm">
                <Filter className="w-4 h-4 mr-2" />
                Lọc nâng cao
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Tất cả bệnh nhân</DropdownMenuItem>
              <DropdownMenuItem>Khám trong tuần</DropdownMenuItem>
              <DropdownMenuItem>Khám trong tháng</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Thêm bệnh nhân
          </Button>
        </div> */}
      </div>
      
      {/* merged: appointments will be shown in the Pending tab below */}

      {/* Search and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="Tìm theo tên, mã, chẩn đoán..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div> */}
        <div className="flex items-center gap-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tổng bệnh nhân</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.filter(p => p.status === "pending").length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Chờ khám</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.filter(p => p.status === "done").length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Đã khám</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs 
        defaultValue="pending" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "pending" | "done")}
        className="w-full"
      >
        <TabsList className="mb-6 grid grid-cols-2 w-full max-w-md">
          <TabsTrigger 
            value="pending" 
            className="flex items-center gap-2"
          >
            <UserRound className="h-4 w-4" />
            Chưa khám ({pendingCount})
          </TabsTrigger>
          <TabsTrigger 
            value="done" 
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Đã khám ({patients.filter(p => p.status === "done").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Bệnh nhân chờ khám</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Danh sách bệnh nhân đang chờ khám</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thời gian</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Bệnh nhân</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dịch vụ</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ghi chú</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phí</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRows.map((r) => (
                      <tr key={r.rowId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 text-sm">{r.time ?? '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={r.patientObj?.avatar} alt={r.patientName} />
                              <AvatarFallback>{r.patientName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{r.patientName} {((r.appt && r.appt.patient?.medicalRecord?.bloodType) || (r.patientObj && (r.patientObj as any).bloodType)) && (
                                <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 text-muted-foreground">{r.appt?.patient?.medicalRecord?.bloodType ?? (r.patientObj as any).bloodType}</span>
                              )}</div>
                              <div className="text-xs text-muted-foreground">{r.patientPhone ?? ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{r.service ?? (r.patientObj?.condition) ?? '-'}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{r.reason ?? '-'}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{r.appt?.consultationFee ? Number(r.appt.consultationFee).toLocaleString() + ' VNĐ' : '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => { if (r.appt) { openApptDetail(r.appt); } }}>
                              Xem chi tiết
                            </Button>
                            {/* <Button size="sm" variant="outline" onClick={() => { setSelectedMedicalRecord(r.appt?.patient?.medicalRecord || (r.patientObj as any)?.medicalRecord || r.patientObj || {}); setMedicalOpen(true); }}>
                              Xem bệnh án
                            </Button> */}
                            <Button size="sm" onClick={() => { openCompleteForm(r.patientId); if (r.appt) setSelectedAppt(r.appt); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">Hoàn thành</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="done">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Bệnh nhân đã khám</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Lịch sử khám bệnh đã hoàn thành</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Mã BN</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Họ tên</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Tuổi</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Ngày khám</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Chẩn đoán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            {formatPatientId(p.id)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={p.avatar} alt={p.name} />
                              <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.age} tuổi</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.gender}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.lastVisit}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                            {p.condition}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Hoàn thành khám bệnh</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Diagnosis + Notes */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Chẩn đoán chính</label>
                <Textarea
                  placeholder="Nhập chẩn đoán chính..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="min-h-36"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Ghi chú bổ sung</label>
                <Textarea
                  placeholder="Ghi chú thêm về tình trạng bệnh nhân..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-36"
                />
              </div>
            </div>

            {/* Right: Medication selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Tìm thuốc</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tên thuốc..."
                      value={drugQuery}
                      onChange={(e) => setDrugQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={drugQty}
                      onChange={(e) => setDrugQty(Number(e.target.value))}
                      className="w-24"
                    />
                    <Button onClick={() => {
                      const name = drugQuery.trim();
                      if (!name) return;
                      const qty = Number(drugQty) > 0 ? Number(drugQty) : 1;
                      // try to find medicine id from catalog
                      const found = medCatalog.find((m) => m.name.toLowerCase() === name.toLowerCase());
                      const medicineId = found?._id;
                      // note comes from the editable input (can be populated from presets)
                      const note = drugNoteInput.trim() || undefined;

                      setMedList((prev) => [...prev, { medicineId, name, qty, note }]);
                      setDrugQuery("");
                      setDrugQty(1);
                      setDrugNoteOption("");
                      setDrugNoteCustom("");
                      setDrugNoteInput("");
                    }}>
                      <Plus className="w-4 h-4 mr-2" /> Thêm
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <select className="w-40 px-2 rounded border" value={drugNoteOption} onChange={(e) => {
                      const v = e.target.value;
                      setDrugNoteOption(v);
                      if (v && v !== 'other') setDrugNoteInput(v);
                      else if (v === 'other') setDrugNoteInput('');
                      else setDrugNoteInput('');
                    }}>
                      <option value="">Ghi chú thuốc</option>
                      <option value="Ngày uống 3 lần, mỗi lần 1 viên">3 lần, lần 1 viên</option>
                      <option value="Ngày uống 2 lần, mỗi lần 1 viên (sáng, chiều)">2 lần, lần 1 viên</option>
                      <option value="Trước khi ăn 30 phút, mỗi lần 1 viên">Sớm 30 phút, lần 1 viên</option>
                      {/* <option value="Sau ăn">Sau ăn</option>
                      <option value="Trước ăn">Trước ăn</option> */}
                      <option value="other">Khác...</option>
                    </select>

                    <div className="flex-1">
                      <Input placeholder="Ghi chú thuốc (có thể chọn hoặc nhập)..." value={drugNoteInput} onChange={(e) => setDrugNoteInput(e.target.value)} />
                    </div>
                  </div>

                {/* suggestions */}
                {drugQuery && (
                  <div className="mt-2 border rounded-md bg-white dark:bg-gray-900 p-2 max-h-64 overflow-auto">
                    {medCatalog
                      .filter((m) => m.name.toLowerCase().includes(drugQuery.toLowerCase()))
                      .slice(0, 8)
                      .map((m) => (
                        <div key={m._id} className="py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" onClick={() => setDrugQuery(m.name)}>
                          <div className="font-medium">{m.name}</div>
                          {m.packaging && <div className="text-xs text-muted-foreground">{m.packaging}</div>}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Danh sách thuốc</label>
                <div className="max-h-96 overflow-auto space-y-2 pr-2">
                    {medList.length === 0 && <div className="text-sm text-muted-foreground">Chưa có thuốc nào được thêm</div>}
                  {medList.map((m, idx) => (
                    <div key={`${m.name}-${idx}`} className="flex items-center justify-between gap-3 border rounded p-2">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">Số lượng: {m.qty}{m.note ? ` • ${m.note}` : ''}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setMedList((prev) => prev.filter((_, i) => i !== idx))}>Xóa</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={async () => { console.log('Med list', medList);
                // Client-side validation
                if (!diagnosis || diagnosis.trim() === "") {
                  toast.error("Vui lòng nhập chẩn đoán chính");
                  return;
                }

                // Ensure each prescription has a non-empty note string (server validation requires this)
                for (let i = 0; i < medList.length; i++) {
                  const it = medList[i];
                  if (typeof it.note !== 'string' || it.note.trim() === '') {
                    toast.error(`Vui lòng nhập ghi chú cho thuốc thứ ${i + 1}`);
                    return;
                  }
                  if (!it.name || String(it.name).trim() === '') {
                    toast.error(`Tên thuốc ở mục ${i + 1} không được để trống`);
                    return;
                  }
                  if (!Number(it.qty) || Number(it.qty) <= 0) {
                    toast.error(`Số lượng thuốc ở mục ${i + 1} phải lớn hơn 0`);
                    return;
                  }
                }

                // Build prescriptions for API (omit empty medicineId)
                const prescriptions = medList.map((m) => {
                  const base: any = { name: m.name, quantity: Number(m.qty || 1), note: String(m.note || '') };
                  if (m.medicineId) base.medicineId = m.medicineId;
                  return base;
                });

                // appointmentId: try selectedAppt first
                const apptId = selectedAppt?._id || (todayAppointments.find(a => a.patient && (a.patient._id === selectedId || a.patient.id === selectedId))?._id);
                if (apptId) {
                  try {
                    const payload = { appointmentId: apptId, diagnosis, note: notes, prescriptions };
                    console.log('=== Completing appointment ===');
                    console.log('Payload:', JSON.stringify(payload, null, 2));
                    console.log('Prescriptions count:', prescriptions.length);
                    console.log('Med list:', medList);
                    
                    const response = await completeAppointment(payload);
                    console.log('Complete appointment response:', response);
                    
                    toast.success('Hoàn thành khám bệnh thành công');
                    setOpen(false);
                    setMedList([]);
                    setDiagnosis('');
                    setNotes('');
                    
                    // local updates
                    const todayStr = formatDateLocal(new Date());
                    setPatients((prev) => prev.map((p) => (p.id === selectedId ? { ...p, status: "done", lastVisit: todayStr } : p)));
                    setTodayAppointments((prev) => prev.map((a) => (a._id === apptId ? { ...a, appointmentStatus: "COMPLETED" } : a)));
                  } catch (e) {
                    console.error('Failed completing appointment', e);
                    console.error('Error details:', (e as any)?.response?.data);
                    const msg = (e as any)?.response?.data?.message || (e as any)?.message || 'Lỗi khi hoàn thành lịch hẹn';
                    toast.error(msg);
                  }
                } else {
                  // fallback: just update local state
                  submitCompletion();
                }
              }} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lưu và hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical record dialog */}
      <Dialog open={medicalOpen} onOpenChange={setMedicalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Bệnh án bệnh nhân</DialogTitle>
          </DialogHeader>
          <div>
            {selectedMedicalRecord ? (
              <MedicalRecordDetailScreen medicalRecord={selectedMedicalRecord} />
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">Không có hồ sơ</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicalOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment detail dialog (modernized) */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Chi tiết lịch hẹn</DialogTitle>
          </DialogHeader>
          {selectedAppt ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Patient card */}
              <Card className="col-span-1 shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedAppt.patient?.profileId?.avatarUrl} alt={selectedAppt.patient?.profileId?.name ?? selectedAppt.patient?.name} />
                      <AvatarFallback>{((selectedAppt.patient?.profileId?.name ?? selectedAppt.patient?.name) || "B").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedAppt.patient?.profileId?.name ?? selectedAppt.patient?.name ?? '-'}</h3>
                      <div className="text-sm text-muted-foreground">Mã BN: <span className="font-medium">{formatPatientId(selectedAppt.patient?._id ?? selectedAppt.patient?.id)}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Số điện thoại</span>
                      <span className="font-medium">{selectedAppt.patient?.profileId?.phone ?? selectedAppt.patient?.phone ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{selectedAppt.patient?.profileId?.email ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Địa chỉ</span>
                      <span className="font-medium">{selectedAppt.patient?.profileId?.address ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Giới tính</span>
                      <span className="font-medium">{selectedAppt.patient?.profileId?.gender ?? '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ngày sinh</span>
                      <span className="font-medium">{formatDateDisplay(selectedAppt.patient?.profileId?.dob)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Chiều cao</span>
                      <span className="font-medium">{selectedAppt.patient?.height ? `${selectedAppt.patient.height} cm` : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cân nặng</span>
                      <span className="font-medium">{selectedAppt.patient?.weight ? `${selectedAppt.patient.weight} kg` : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nhóm máu</span>
                      <span className="font-medium">{selectedAppt.patient?.bloodType ?? selectedAppt.patient?.profileId?.bloodType ?? '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right: Appointment summary and actions */}
              <div className="col-span-2 space-y-4">
                <Card className="shadow-sm border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Lịch hẹn</div>
                        <h4 className="text-lg font-semibold mt-1 text-gray-900 dark:text-white">{selectedAppt.label ?? selectedAppt.serviceType ?? 'Lịch hẹn khám'}</h4>
                        <div className="text-sm text-muted-foreground mt-1">{formatDateDisplay(selectedAppt.date)} • {formatTimeValue(selectedAppt.startTime)} - {formatTimeValue(selectedAppt.endTime)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn('px-3 py-1 rounded-full text-sm', selectedAppt.appointmentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                          {selectedAppt.appointmentStatus ?? '-'}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Phí khám</div>
                          <div className="text-lg font-semibold">{selectedAppt.consultationFee ? Number(selectedAppt.consultationFee).toLocaleString() + ' VNĐ' : '-'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Ghi chú</p>
                      <p className="text-sm text-muted-foreground mt-2">{selectedAppt.reasonForAppointment ?? '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => { setSelectedMedicalRecord(selectedAppt.patient?.medicalRecord || selectedAppt.patient || {}); setMedicalOpen(true); }}>
                    <FileText className="w-4 h-4 mr-2" /> Xem bệnh án
                  </Button>
                  {selectedAppt.appointmentStatus !== 'COMPLETED' && (
                    <Button onClick={() => { openCompleteForm(selectedAppt.patient?._id || selectedAppt.patient?.id); setDetailOpen(false); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Hoàn thành
                    </Button>
                  )}
                  {/* <Button variant="ghost" onClick={() => setDetailOpen(false)}>Đóng</Button> */}
                </div>

                {/* Small medical-record preview */}
                <Card className="shadow-none border-t">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">Tiền sử bệnh</div>
                        <div className="font-medium">{selectedAppt.patient?.medicalRecord?.medicalHistory?.length ?? 0}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">Dị ứng thuốc</div>
                        <div className="font-medium">{selectedAppt.patient?.medicalRecord?.drugAllergies?.length ?? 0}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">Dị ứng thức ăn</div>
                        <div className="font-medium">{selectedAppt.patient?.medicalRecord?.foodAllergies?.length ?? 0}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">Ghi nhận huyết áp</div>
                        <div className="font-medium">{selectedAppt.patient?.medicalRecord?.bloodPressure?.length ?? 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div>Không có dữ liệu</div>
          )}
          <DialogFooter className="gap-3" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
