"use client";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Clock, Plus } from "lucide-react";

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
    // group by day label of current week range
    const map: Record<string, Slot[]> = {};
    viDays.forEach((d) => (map[d] = []));
    for (const s of slots) {
      const label = getDayLabel(s.date);
      if (!map[label]) map[label] = [];
      map[label].push(s);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [slots]);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Lịch làm việc</h2>
          <p className="text-muted-foreground">Đăng ký và xem lịch làm của bạn</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Đăng ký lịch
        </Button>
      </div>

      <Tabs defaultValue="day">
        <TabsList className="mb-2">
          <TabsTrigger value="day" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Theo ngày
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Theo tuần
          </TabsTrigger>
          <TabsTrigger value="month" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Theo tháng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <Card className="cursor-default">
            <CardHeader>
              <CardTitle>Hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              {todayList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có lịch nào hôm nay</p>
              ) : (
                <ul className="divide-y">
                  {todayList.map((a, idx) => (
                    <li key={idx} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-20">{a.start} - {a.end}</span>
                        <div>
                          <p className="font-medium">{a.location || "Phòng khám"}</p>
                          <p className="text-sm text-muted-foreground">{a.notes || ""}</p>
                        </div>
                      </div>
                      <button className="text-primary text-sm hover:underline">Chi tiết</button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {viDays.map((label) => (
              <Card key={label} className="cursor-default">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {(weekGroups[label] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có lịch</p>
                  ) : (
                    <ul className="space-y-3">
                      {(weekGroups[label] || []).map((i, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-20">{i.start} - {i.end}</span>
                          <span className="font-medium">{i.location || "Phòng khám"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="month">
            <Card className="cursor-default">
                <CardHeader>
                <CardTitle>Tháng hiện tại</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                    <thead>
                        <tr className="bg-muted/40">
                        <th className="text-left px-3 py-2">Ngày</th>
                        <th className="text-left px-3 py-2">Sáng</th>
                        <th className="text-left px-3 py-2">Trưa</th>
                        <th className="text-left px-3 py-2">Chiều</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enumerateMonthDays(now.getFullYear(), now.getMonth()).map((dStr) => (
                        <tr key={dStr} className="border-t">
                            <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{dStr}</span>
                                <span className="text-muted-foreground">({getDayLabel(dStr)})</span>
                            </div>
                            </td>
                            {["morning", "noon", "afternoon"].map((k) => {
                            const state = getShiftState(dStr, k as ShiftKey);
                            const cls =
                                state === "completed"
                                ? "bg-green-100 text-green-800"
                                : state === "hasClient"
                                ? "bg-yellow-100 text-yellow-800"
                                : state === "registered"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-white text-foreground";
                            const label =
                                state === "completed"
                                ? "Có khách - Đã khám"
                                : state === "hasClient"
                                ? "Có khách"
                                : state === "registered"
                                ? "Đã đăng ký"
                                : "Chưa đăng ký";
                            return (
                                <td key={k} className="px-3 py-2">
                                <button
                                    onClick={() => onClickShift(dStr, k as ShiftKey)}
                                    className={`w-full rounded-md border px-3 py-2 text-left ${cls}`}
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "register" && "Đăng ký lịch làm"}
              {dialogMode === "cancel" && "Hủy lịch đã đăng ký"}
              {dialogMode === "warning" && "Thông báo"}
            </DialogTitle>
          </DialogHeader>
          {dialogMode === "register" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày</label>
                  <input type="date" min={monthStart} max={monthEnd} value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium mb-1">Ca làm</label>
                  <select value={shift} onChange={(e) => setShift(e.target.value as any)} className="w-full h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {SHIFTS.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bắt đầu</label>
                    <input value={SHIFTS.find((x) => x.key === shift)?.start} readOnly className="w-full h-9 rounded-md border bg-background px-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kết thúc</label>
                    <input value={SHIFTS.find((x) => x.key === shift)?.end} readOnly className="w-full h-9 rounded-md border bg-background px-3 text-sm outline-none" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Địa điểm</label>
                  <input placeholder="Phòng khám / Khoa / Phòng" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea placeholder="Mô tả nội dung công việc" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-24 rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
                <Button onClick={addSlot}>Lưu lịch</Button>
              </DialogFooter>
            </>
          )}

          {dialogMode === "cancel" && (
            <>
              <p className="text-sm text-muted-foreground">Bạn có chắc muốn hủy lịch đã đăng ký cho {selectedDate} ({
                selectedShift === "morning" ? "Buổi sáng" : selectedShift === "noon" ? "Buổi trưa" : "Buổi chiều"
              })?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Đóng</Button>
                <Button variant="destructive" onClick={cancelSlot}>Hủy lịch</Button>
              </DialogFooter>
            </>
          )}

          {dialogMode === "warning" && (
            <>
              <p className="text-sm text-amber-700">Ca này đã có khách đặt hoặc đã hoàn thành. Vui lòng thao tác tại hệ thống quản lý lịch hẹn để thay đổi.</p>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Đã hiểu</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

