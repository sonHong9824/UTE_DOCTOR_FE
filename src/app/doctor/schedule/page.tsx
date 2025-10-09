"use client";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarDays, Clock, Plus, CheckCircle2, Users, AlertTriangle, 
  Calendar, ChevronRight, Filter, MoreVertical, CalendarCheck, 
  CalendarX, ArrowRight, Calendar as CalendarIcon, ClipboardList
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type ShiftKey = "morning" | "noon" | "afternoon";

type Slot = {
  date: string; // YYYY-MM-DD
  shiftKey: ShiftKey;
  start: string; // HH:mm
  end: string; // HH:mm
  location?: string;
  notes?: string;
  hasClient?: boolean; // có khách đặt
  completed?: boolean; // đã khám xong
};

const viDays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return viDays[d.getDay()];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function SchedulePage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const SHIFTS: { key: ShiftKey; label: string; start: string; end: string }[] = [
    { key: "morning", label: "Buổi sáng (08:00 - 11:30)", start: "08:00", end: "11:30" },
    { key: "noon", label: "Buổi trưa (11:30 - 13:30)", start: "11:30", end: "13:30" },
    { key: "afternoon", label: "Buổi chiều (13:30 - 17:00)", start: "13:30", end: "17:00" },
  ];
  const [slots, setSlots] = useState<Slot[]>([
    { date: todayStr, shiftKey: "morning", start: "08:00", end: "11:30", location: "Phòng 201", notes: "Khám tổng quát", hasClient: true, completed: false },
    { date: todayStr, shiftKey: "afternoon", start: "13:30", end: "17:00", location: "Phòng 202", notes: "Siêu âm", hasClient: true, completed: true },
  ]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayStr);
  const [shift, setShift] = useState<ShiftKey>("morning");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [dialogMode, setDialogMode] = useState<"register" | "cancel" | "warning">("register");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftKey | null>(null);

  const todayList = useMemo(() => {
    return [...slots]
      .filter((s) => s.date === todayStr)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [slots, todayStr]);

  const weekGroups = useMemo(() => {
    const result: Record<string, Slot[]> = {};
    viDays.forEach((day) => (result[day] = []));

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start from Sunday
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = viDays[d.getDay()];
      const daySlots = slots.filter((s) => s.date === dateStr);
      result[dayLabel] = daySlots;
    }
    return result;
  }, [slots, now]);

  const addSlot = () => {
    if (!date) return;
    // Enforce date in current month
    if (date < monthStart || date > monthEnd) return;
    const s = SHIFTS.find((x) => x.key === shift)!;
    setSlots((prev) => [
      ...prev,
      { date, shiftKey: shift, start: s.start, end: s.end, location, notes, hasClient: false, completed: false },
    ]);
    setOpen(false);
    setDate(todayStr);
    setShift("morning");
    setLocation("");
    setNotes("");
  };

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
    }

    // Tạo mảng ngày dạng YYYY-MM-DD
    function enumerateMonthDays(year: number, month: number): string[] {
    const daysInMonth = getDaysInMonth(year, month);
    const days: string[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        days.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    return days;
    }

    // Trả về ngày bắt đầu và kết thúc tháng (string)
    function getMonthRange(year: number, month: number) {
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, getDaysInMonth(year, month)).toISOString().slice(0, 10);
    return { start, end };
    }

  function getShiftState(dateStr: string, key: ShiftKey): "none" | "registered" | "hasClient" | "completed" {
    const found = slots.find((s) => s.date === dateStr && s.shiftKey === key);
    if (!found) return "none";
    if (found.hasClient && found.completed) return "completed";
    if (found.hasClient) return "hasClient";
    return "registered";
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
    } else if (state === "hasClient") {
      setDialogMode("warning");
      setOpen(true);
      setSelectedDate(dateStr);
      setSelectedShift(key);
    } else {
      // completed: show info (optional), treat as warning for now
      setDialogMode("warning");
      setOpen(true);
      setSelectedDate(dateStr);
      setSelectedShift(key);
    }
  }

  function cancelSlot() {
    if (!selectedDate || !selectedShift) return;
    setSlots((prev) => prev.filter((s) => !(s.date === selectedDate && s.shiftKey === selectedShift)));
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Quick Stats */}
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
            <div className="text-2xl font-bold">{slots.length}</div>
            <p className="text-xs text-muted-foreground">
              {slots.filter((s) => s.hasClient).length} ca có lịch hẹn
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
            <div className="text-2xl font-bold">{slots.filter((s) => s.completed).length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((slots.filter((s) => s.completed).length / slots.length) * 100)}% hoàn thành
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

      <Tabs defaultValue="day">
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

        {/* <TabsContent value="month">
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
        </TabsContent> */}

        <TabsContent value="month">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="mb-3">Lịch làm việc tháng hiện tại</CardTitle>
                <CardDescription>
                  {formatDate(monthStart)} - {formatDate(monthEnd)}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Xuất lịch
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Ngày</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Sáng</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Trưa</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Chiều</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enumerateMonthDays(now.getFullYear(), now.getMonth()).map((dStr) => (
                      <tr key={dStr} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatDate(dStr)}</span>
                            <span className="text-sm text-muted-foreground">({getDayLabel(dStr)})</span>
                          </div>
                        </td>
                        {["morning", "noon", "afternoon"].map((k) => {
                          const state = getShiftState(dStr, k as ShiftKey);
                          const cls =
                            state === "completed"
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
                              : state === "hasClient"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900"
                              : state === "registered"
                              ? "bg-muted text-muted-foreground border-border"
                              : "bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground";
                          const label =
                            state === "completed"
                              ? "Có khách - Đã khám"
                              : state === "hasClient"
                              ? "Có khách"
                              : state === "registered"
                              ? "Đã đăng ký"
                              : "Chưa đăng ký";
                          return (
                            <td key={k} className="px-4 py-3">
                              <button
                                onClick={() => onClickShift(dStr, k as ShiftKey)}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${cls}`}
                              >
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
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-doctor-primary-foreground">
              {dialogMode === "register" && "Đăng ký lịch làm việc"}
              {dialogMode === "cancel" && "Hủy lịch đã đăng ký"}
              {dialogMode === "warning" && "Thông báo"}
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
                    onChange={(e) => setShift(e.target.value as any)} 
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
                  {selectedShift === "morning" ? "Buổi sáng" : selectedShift === "noon" ? "Buổi trưa" : "Buổi chiều"}
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


