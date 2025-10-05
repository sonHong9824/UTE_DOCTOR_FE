"use client";
import { useMemo, useState } from "react";
import { Search, ChevronDown, MoreHorizontal, CheckCircle2, Plus, Users, ArrowUpDown, Filter, FileText, UserRound, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

const INITIAL_PATIENTS: Patient[] = [
  { id: "P001", name: "Nguyễn Văn A", age: 45, gender: "Nam", lastVisit: "2025-09-30", condition: "Tăng huyết áp", status: "pending", avatar: "/assets/bs/bs-Minh.jpg" },
  { id: "P002", name: "Trần Thị B", age: 32, gender: "Nữ", lastVisit: "2025-09-28", condition: "Thiếu máu", status: "done", avatar: "/assets/bs/bs-Minh.jpg" },
  { id: "P003", name: "Lê Văn C", age: 60, gender: "Nam", lastVisit: "2025-09-27", condition: "Đái tháo đường", status: "pending", avatar: "/assets/bs/bs-Minh.jpg" },
  { id: "P004", name: "Phạm Thu D", age: 25, gender: "Nữ", lastVisit: "2025-09-25", condition: "Viêm dạ dày", status: "done", avatar: "/assets/bs/bs-Minh.jpg" },
  { id: "P005", name: "Đỗ Minh E", age: 51, gender: "Nam", lastVisit: "2025-09-22", condition: "Rối loạn mỡ máu", status: "pending", avatar: "/assets/bs/bs-Minh.jpg" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Quản lý bệnh nhân</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi và quản lý thông tin bệnh nhân</p>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            className="pl-10 pr-4"
            placeholder="Tìm theo tên, mã, chẩn đoán..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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
            Chưa khám ({patients.filter(p => p.status === "pending").length})
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Mã BN</th>
                      <th 
                        className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1" 
                        onClick={() => toggleSort("name")}
                      >
                        Họ tên
                        <ArrowUpDown className="h-3 w-3" />
                      </th>
                      <th 
                        className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1" 
                        onClick={() => toggleSort("age")}
                      >
                        Tuổi
                        <ArrowUpDown className="h-3 w-3" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</th>
                      <th 
                        className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1" 
                        onClick={() => toggleSort("lastVisit")}
                      >
                        Lần khám gần nhất
                        <ArrowUpDown className="h-3 w-3" />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Chẩn đoán</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            {p.id}
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
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                            {p.condition}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => openCompleteForm(p.id)}
                          >
                            <Activity className="h-3.5 w-3.5 mr-1.5" /> 
                            Bắt đầu khám
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Lần khám gần nhất</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Chẩn đoán</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            {p.id}
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
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <FileText className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Hoàn thành khám bệnh</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Chẩn đoán chính</label>
                <Textarea 
                  placeholder="Nhập chẩn đoán chính..." 
                  value={diagnosis} 
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Phác đồ điều trị</label>
                <Textarea 
                  placeholder="Mô tả phác đồ điều trị chi tiết..." 
                  value={treatment} 
                  onChange={(e) => setTreatment(e.target.value)}
                  className="min-h-32"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Đơn thuốc</label>
                <Textarea 
                  placeholder="Danh sách thuốc và liều lượng..." 
                  value={medications} 
                  onChange={(e) => setMedications(e.target.value)}
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Ghi chú bổ sung</label>
                <Textarea 
                  placeholder="Ghi chú thêm về tình trạng bệnh nhân..." 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-32"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={submitCompletion} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Lưu và hoàn thành
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
