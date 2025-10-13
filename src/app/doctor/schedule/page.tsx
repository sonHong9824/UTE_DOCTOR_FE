"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  CalendarDays, Clock, Plus, Users, AlertTriangle, 
  Calendar, ChevronRight, Filter, MoreVertical, CalendarCheck, 
  ArrowRight, ClipboardList, Loader2
} from "lucide-react";
import { getShiftsByDoctorMonth } from "@/apis/doctor/shift.api";

// Types
interface ShiftData {
  _id: string;
  doctorId: string;
  date: string;
  shift: "morning" | "afternoon" | "extra";
  status: "available" | "hasClient" | "completed";
  __v: number;
}

interface ShiftStatistics {
  totalShifts: number;
  available: number;
  hasClient: number;
  completed: number;
}

interface ShiftMonthData {
  month: number;
  year: number;
  statistics: ShiftStatistics;
  shifts: ShiftData[];
  groupedByDate: Record<string, ShiftData[]>;
}

interface ShiftResponseDto {
  code: string;
  message: string;
  data: ShiftMonthData;
}

type ShiftKey = "morning" | "afternoon" | "extra";

type Slot = {
  _id?: string;
  date: string;
  shiftKey: ShiftKey;
  start: string;
  end: string;
  location?: string;
  notes?: string;
  hasClient?: boolean;
  completed?: boolean;
  status?: "available" | "hasClient" | "completed";
};

const viDays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return viDays[d.getDay()];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month - 1];
}

function enumerateMonthDays(year: number, month: number): string[] {
  const daysInMonth = getDaysInMonth(year, month);
  const days: string[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    days.push(`${yearStr}-${monthStr}-${dayStr}`);
  }
  return days;
}

// Dữ liệu ca từ API sẽ được quy đổi ra Slot để hiển thị ở các tab

export default function SchedulePage() {
  const doctorId = "68ec9bbb97af2916bddd47fa";
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [shift, setShift] = useState<ShiftKey>("morning");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [dialogMode, setDialogMode] = useState<"register" | "register_month" | "cancel" | "warning">("register");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftKey | null>(null);
  const [now, setNow] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [monthData, setMonthData] = useState<ShiftMonthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  function formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const monthStart = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const SHIFTS: { key: ShiftKey; label: string; start: string; end: string }[] = [
    { key: "morning", label: "Ca sáng (07:30 - 11:30)", start: "07:30", end: "11:30" },
    { key: "afternoon", label: "Ca chiều (13:30 - 17:30)", start: "13:30", end: "17:30" },
    { key: "extra", label: "Ngoài giờ (18:00 - 21:00)", start: "18:00", end: "21:00" },
  ];

  function normalizeMonthData(api: any): ShiftMonthData {
    const normalizedShifts: ShiftData[] = (api?.shifts || []).map((s: any) => ({
      _id: s._id,
      doctorId: s.doctorId,
      date: s.date,
      shift: s.shift as ShiftKey,
      status: s.status as "available" | "hasClient" | "completed",
      __v: s.__v ?? 0,
    }));
    return {
      month: api?.month ?? now.getMonth() + 1,
      year: api?.year ?? now.getFullYear(),
      statistics: api?.statistics ?? { totalShifts: 0, available: 0, hasClient: 0, completed: 0 },
      shifts: normalizedShifts,
      groupedByDate: api?.groupedByDate ?? {},
    } as ShiftMonthData;
  }

  const apiSlots = useMemo<Slot[]>(() => {
    if (!monthData) return [];
    return monthData.shifts.map((s) => {
      const def = SHIFTS.find((x) => x.key === (s.shift as ShiftKey));
      return {
        _id: s._id,
        date: s.date,
        shiftKey: s.shift as ShiftKey,
        start: def?.start ?? "",
        end: def?.end ?? "",
        status: s.status,
      } as Slot;
    });
  }, [monthData]);

  const allSlots = useMemo<Slot[]>(() => {
    // Ưu tiên hiển thị cả ca từ API và các ca tạo tạm ở client
    return [...apiSlots, ...slots];
  }, [apiSlots, slots]);

 const fetchShifts = async () => {
  try {
    setLoading(true);

    const response = await getShiftsByDoctorMonth(
      doctorId,
      now.getMonth() + 1,
      now.getFullYear()
    );

    if (response.code === "SUCCESS") {
      const data = normalizeMonthData(response.data);

      // Cập nhật dữ liệu tháng (đã chuẩn hóa)
      setMonthData(data);
      // slots vẫn giữ để thêm ca tạm từ client nếu cần
    } else {
      console.error("Fetch failed:", response.message);
    }
  } catch (error) {
    console.error("Error fetching shifts:", error);

    setMonthData({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      statistics: { totalShifts: 0, available: 0, hasClient: 0, completed: 0 },
      shifts: [],
      groupedByDate: {}
    });
    setSlots([]);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchShifts();
  }, [now]);

  const todayList = useMemo(() => {
    return allSlots
      .filter((s) => s.date === todayStr)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [allSlots, todayStr]);

  const weekGroups = useMemo(() => {
    const result: Record<string, Slot[]> = {};
    viDays.forEach((day) => (result[day] = []));
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - weekStart.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = viDays[d.getDay()];
      result[dayLabel] = allSlots.filter((s) => s.date === dateStr);
    }
    return result;
  }, [allSlots, now]);

  const addSlot = async () => {
    if (!date) return;
    if (date < monthStart || date > monthEnd) return;
    const s = SHIFTS.find((x) => x.key === shift)!;
    
    // TODO: Call API to create shift
    setSlots((prev) => [
      ...prev,
      { 
        date, 
        shiftKey: shift, 
        start: s.start, 
        end: s.end, 
        location, 
        notes, 
        hasClient: false, 
        completed: false,
        status: "available"
      },
    ]);
    
    setOpen(false);
    setDate(todayStr);
    setShift("morning");
    setLocation("");
    setNotes("");
  };

  function getShiftState(dateStr: string, key: ShiftKey): "none" | "registered" | "hasClient" | "completed" {
    const found = allSlots.find((s) => s.date === dateStr && s.shiftKey === key);
    if (!found) return "none";
    if (found.status === "completed") return "completed";
    if (found.status === "hasClient") return "hasClient";
    if (found.status === "available") return "registered";
    return "none";
  }

  function onClickShift(dateStr: string, key: ShiftKey) {
    const state = getShiftState(dateStr, key);
    if (state === "none") {
      setDialogMode("register");
      setOpen(true);
      setDate(dateStr);
      setShift(key);
      setSelectedDate(dateStr);
      setSelectedShift(key);
    } else if (state === "registered") {
      setDialogMode("cancel");
      setOpen(true);
      setSelectedDate(dateStr);
      setSelectedShift(key);
    } else if (state === "hasClient" || state === "completed") {
      setDialogMode("warning");
      setOpen(true);
      setSelectedDate(dateStr);
      setSelectedShift(key);
    }
  }

  function cancelSlot() {
    if (!selectedDate || !selectedShift) return;
    // TODO: Call API to delete shift
    setSlots((prev) => prev.filter((s) => !(s.date === selectedDate && s.shiftKey === selectedShift)));
    setOpen(false);
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMonth = Number(e.target.value);
    setNow(new Date(now.getFullYear(), newMonth - 1, 1));
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setNow(new Date(Number(e.target.value), now.getMonth(), 1));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch làm việc</h1>
          <p className="text-muted-foreground">Quản lý và đăng ký lịch làm việc của bạn</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Lọc</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Tất cả ca trực</DropdownMenuItem>
              <DropdownMenuItem>Chỉ ca đã đăng ký</DropdownMenuItem>
              <DropdownMenuItem>Chỉ ca có lịch hẹn</DropdownMenuItem>
              <DropdownMenuItem>Chỉ ca đã hoàn thành</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-9">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Xem lịch</span>
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Đăng ký ca trực</span>
            <span className="inline sm:hidden">Đăng ký</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ca trực hôm nay</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayList.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayList.filter((s) => s.completed).length} ca đã hoàn thành
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              Xem chi tiết
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số ca đăng ký</CardTitle>
            <ClipboardList className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthData?.statistics.totalShifts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monthData?.statistics.hasClient || 0} ca có lịch hẹn
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              Xem chi tiết
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bệnh nhân đã khám</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthData?.statistics.completed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monthData?.statistics.totalShifts 
                ? Math.round((monthData.statistics.completed / monthData.statistics.totalShifts) * 100) 
                : 0}% hoàn thành
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              Xem chi tiết
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="month">
        <TabsList className="mb-4">
          <TabsTrigger value="day" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            Theo ngày
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> 
            Theo tuần
          </TabsTrigger>
          <TabsTrigger value="month" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> 
            Theo tháng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch làm việc hôm nay</CardTitle>
                <CardDescription>
                  {formatDate(todayStr)} - {getDayLabel(todayStr)}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Đánh dấu hoàn thành
              </Button>
            </CardHeader>
            <CardContent>
              {todayList.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Chưa có lịch nào hôm nay</p>
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => setOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Đăng ký lịch
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayList.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-semibold">{slot.start}</p>
                          <p className="text-xs text-muted-foreground">-</p>
                          <p className="text-sm font-semibold">{slot.end}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{slot.location || "Phòng khám"}</p>
                            {slot.hasClient && (
                              <Badge variant={slot.completed ? "success" : "warning"} className="text-xs">
                                {slot.completed ? "Đã khám" : "Có lịch hẹn"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{slot.notes || "Không có ghi chú"}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem>Đánh dấu hoàn thành</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Hủy lịch</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {viDays.map((label) => (
              <Card key={label}>
                <CardHeader>
                  <CardTitle className="text-lg">{label}</CardTitle>
                  <CardDescription>
                    {(weekGroups[label] || []).length} ca trực
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(weekGroups[label] || []).length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-sm text-muted-foreground">Không có lịch</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(weekGroups[label] || []).map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                          <div className="text-center">
                            <p className="text-xs font-semibold">{slot.start}</p>
                            <p className="text-xs text-muted-foreground">-</p>
                            <p className="text-xs font-semibold">{slot.end}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{slot.location || "Phòng khám"}</p>
                              {slot.hasClient && (
                                <Badge variant={slot.completed ? "success" : "warning"} className="text-xs">
                                  {slot.completed ? "Đã khám" : "Có lịch"}
                                </Badge>
                              )}
                            </div>
                            {slot.notes && (
                              <p className="text-xs text-muted-foreground truncate">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <Plus className="mr-1 h-3 w-3" />
                    Thêm ca trực
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="mb-3">Lịch làm việc theo tháng</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={now.getMonth() + 1}
                      onChange={handleMonthChange}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                      ))}
                    </select>

                    <select
                      value={now.getFullYear()}
                      onChange={handleYearChange}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    >
                      {Array.from({ length: 5 }, (_, i) => (
                        <option key={i} value={new Date().getFullYear() - 2 + i}>
                          {new Date().getFullYear() - 2 + i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <CardDescription>
                    {formatDate(monthStart)} - {formatDate(monthEnd)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setOpen(true);
                  setDialogMode("register_month");
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Đăng ký tháng
                </Button>
                <Button variant="outline" size="sm">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Xuất lịch
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Ngày</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Ca sáng</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Ca chiều</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Ngoài giờ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enumerateMonthDays(now.getFullYear(), now.getMonth() + 1).map((dStr) => (
                        <tr key={dStr} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatDate(dStr)}</span>
                              <span className="text-sm text-muted-foreground">({getDayLabel(dStr)})</span>
                            </div>
                          </td>
                          {["morning", "afternoon", "extra"].map((k) => {
                            const state = getShiftState(dStr, k as ShiftKey);
                            const cls = state === "completed"
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
                              : state === "hasClient"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900"
                              : state === "registered"
                              ? "bg-muted text-muted-foreground border-border"
                              : "bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground";
                            const label = state === "completed"
                              ? "Có khách - Đã khám"
                              : state === "hasClient"
                              ? "Có khách"
                              : state === "registered"
                              ? "Đã đăng ký"
                              : "Chưa đăng ký";
                            return (
                              <td key={k} className="px-4 py-3">
                                <button onClick={() => onClickShift(dStr, k as ShiftKey)} className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${cls}`}>
                                  {label}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {dialogMode === "register" && "Đăng ký lịch làm việc"}
              {dialogMode === "cancel" && "Hủy lịch đã đăng ký"}
              {dialogMode === "warning" && "Thông báo"}
              {dialogMode === "register_month" && "Đăng ký lịch theo tháng"}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === "register" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ngày làm việc</label>
                  <input 
                    type="date" 
                    min={monthStart} 
                    max={monthEnd} 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ca làm việc</label>
                  <select 
                    value={shift} 
                    onChange={(e) => setShift(e.target.value as ShiftKey)} 
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
                  >
                    {SHIFTS.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Giờ bắt đầu</label>
                    <input 
                      value={SHIFTS.find((x) => x.key === shift)?.start} 
                      readOnly 
                      className="w-full h-10 rounded-lg border px-3 text-sm text-muted-foreground" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Giờ kết thúc</label>
                    <input 
                      value={SHIFTS.find((x) => x.key === shift)?.end} 
                      readOnly 
                      className="w-full h-10 rounded-lg border px-3 text-sm text-muted-foreground" 
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Địa điểm làm việc</label>
                  <input 
                    placeholder="Phòng khám / Khoa / Phòng" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="w-full h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Ghi chú</label>
                  <textarea 
                    placeholder="Mô tả nội dung công việc..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="w-full min-h-24 rounded-lg border p-3 text-sm focus:outline-none focus:ring-2" 
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={addSlot}>
                  <Plus className="w-4 h-4 mr-2" />
                  Đăng ký lịch
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogMode === "cancel" && (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <p className="font-medium mb-2">Xác nhận hủy lịch</p>
                <p className="text-sm text-muted-foreground">
                  Bạn có chắc muốn hủy lịch đã đăng ký cho <span className="font-medium">{selectedDate}</span> (
                  {selectedShift === "morning" ? "Buổi sáng" : selectedShift === "afternoon" ? "Buổi chiều" : "Ngoài giờ"}
                  )?
                </p>
              </div>
              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Không
                </Button>
                <Button variant="destructive" onClick={cancelSlot}>
                  Hủy lịch
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogMode === "warning" && (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="font-medium mb-2">Không thể thao tác</p>
                <p className="text-sm text-muted-foreground">
                  Ca này đã có khách đặt hoặc đã hoàn thành. Vui lòng thao tác tại hệ thống quản lý lịch hẹn để thay đổi.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>
                  Đã hiểu
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}