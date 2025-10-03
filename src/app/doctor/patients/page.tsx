"use client";
import { useMemo, useState } from "react";
import { Search, ChevronDown, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "Nam" | "Nữ";
  lastVisit: string;
  condition: string;
  status: "pending" | "done";
};

const INITIAL_PATIENTS: Patient[] = [
  { id: "P001", name: "Nguyễn Văn A", age: 45, gender: "Nam", lastVisit: "2025-09-30", condition: "Tăng huyết áp", status: "pending" },
  { id: "P002", name: "Trần Thị B", age: 32, gender: "Nữ", lastVisit: "2025-09-28", condition: "Thiếu máu", status: "done" },
  { id: "P003", name: "Lê Văn C", age: 60, gender: "Nam", lastVisit: "2025-09-27", condition: "Đái tháo đường", status: "pending" },
  { id: "P004", name: "Phạm Thu D", age: 25, gender: "Nữ", lastVisit: "2025-09-25", condition: "Viêm dạ dày", status: "done" },
  { id: "P005", name: "Đỗ Minh E", age: 51, gender: "Nam", lastVisit: "2025-09-22", condition: "Rối loạn mỡ máu", status: "pending" },
];

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof Patient>("lastVisit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"pending" | "done">("pending");
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [medications, setMedications] = useState("");

  const filtered = useMemo(() => {
    const base = patients
      .filter((p) => p.status === activeTab)
      .filter((p) =>
      [p.id, p.name, p.condition].some((v) => v.toLowerCase().includes(query.toLowerCase()))
    );
    const sorted = [...base].sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [patients, activeTab, query, sortBy, sortDir]);

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

  const submitCompletion = () => {
    if (!selectedId) return;
    setPatients((prev) => prev.map((p) => (p.id === selectedId ? { ...p, status: "done", lastVisit: new Date().toISOString().slice(0, 10) } : p)));
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary">Bệnh nhân</h2>
          <p className="text-muted-foreground">Quản lý danh sách bệnh nhân của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="h-9 w-64 rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tìm theo tên, mã, chẩn đoán..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            Lọc
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button size="sm">Thêm bệnh nhân</Button>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-2">
          <TabsTrigger value="pending" className="mr-1" onClick={() => setActiveTab("pending")}>Chưa khám</TabsTrigger>
          <TabsTrigger value="done" onClick={() => setActiveTab("done")}>Đã khám</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="cursor-default">
            <CardHeader>
              <CardTitle>Danh sách (Chưa khám)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4">Mã</th>
                      <th className="text-left py-2 pr-4 cursor-pointer" onClick={() => toggleSort("name")}>Họ tên</th>
                      <th className="text-left py-2 pr-4 cursor-pointer" onClick={() => toggleSort("age")}>Tuổi</th>
                      <th className="text-left py-2 pr-4">Giới tính</th>
                      <th className="text-left py-2 pr-4 cursor-pointer" onClick={() => toggleSort("lastVisit")}>Lần khám gần nhất</th>
                      <th className="text-left py-2 pr-4">Chẩn đoán</th>
                      <th className="text-left py-2 pr-4">Trạng thái</th>
                      <th className="text-right py-2 pl-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/40">
                        <td className="py-2 pr-4 font-medium">{p.id}</td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4">{p.age}</td>
                        <td className="py-2 pr-4">{p.gender}</td>
                        <td className="py-2 pr-4">{p.lastVisit}</td>
                        <td className="py-2 pr-4">{p.condition}</td>
                        <td className="py-2 pr-4">
                          {p.status === "pending" ? (
                            <Badge variant="orange">Chưa khám</Badge>
                          ) : (
                            <Badge variant="green">Đã khám</Badge>
                          )}
                        </td>
                        <td className="py-2 pl-4 text-right">
                          <Button variant="ghost" size="sm" className="px-2" onClick={() => openCompleteForm(p.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1 text-primary" /> Hoàn thành
                          </Button>
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
          <Card className="cursor-default">
            <CardHeader>
              <CardTitle>Danh sách (Đã khám)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4">Mã</th>
                      <th className="text-left py-2 pr-4">Họ tên</th>
                      <th className="text-left py-2 pr-4">Tuổi</th>
                      <th className="text-left py-2 pr-4">Giới tính</th>
                      <th className="text-left py-2 pr-4">Lần khám gần nhất</th>
                      <th className="text-left py-2 pr-4">Chẩn đoán</th>
                      <th className="text-left py-2 pr-4">Trạng thái</th>
                      <th className="text-right py-2 pl-4">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/40">
                        <td className="py-2 pr-4 font-medium">{p.id}</td>
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4">{p.age}</td>
                        <td className="py-2 pr-4">{p.gender}</td>
                        <td className="py-2 pr-4">{p.lastVisit}</td>
                        <td className="py-2 pr-4">{p.condition}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="green">Đã khám</Badge>
                        </td>
                        <td className="py-2 pl-4 text-right">
                          <Button variant="ghost" size="sm" className="px-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hoàn thành khám bệnh</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chẩn đoán</label>
              <Textarea placeholder="Nhập chẩn đoán" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phác đồ điều trị</label>
              <Textarea placeholder="Mô tả phác đồ điều trị" value={treatment} onChange={(e) => setTreatment(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thuốc</label>
              <Textarea placeholder="Danh sách thuốc và liều lượng" value={medications} onChange={(e) => setMedications(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <Textarea placeholder="Ghi chú thêm" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={submitCompletion}>Lưu và hoàn thành</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
