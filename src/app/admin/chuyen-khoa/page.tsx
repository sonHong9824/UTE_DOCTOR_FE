"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getChuyenKhoaList, createChuyenKhoa, updateChuyenKhoa, deleteChuyenKhoa } from "@/apis/chuyen-khoa/chuyen-khoa.api";

interface ChuyenKhoa {
  _id: string;
  name: string;
}

export default function ChuyenKhoaPage() {
  const [specialties, setSpecialties] = useState<ChuyenKhoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Fetch specialties on mount and when pagination/search changes
  useEffect(() => {
    fetchSpecialties();
  }, [page, limit, keyword]);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await getChuyenKhoaList({ page, limit, key: keyword.trim() || undefined });
      const data = res?.data;
      const items = Array.isArray(data?.items) ? data.items : [];
      setSpecialties(items);
      setTotal(Number(data?.total) || 0);
      setTotalPages(Math.ceil((Number(data?.total) || 0) / limit));
    } catch (err) {
      console.error("Failed to fetch specialties", err);
      toast.error("Không thể tải danh sách chuyên khoa");
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtering via `key`; no local filter needed

  const handleOpenDialog = (specialty?: ChuyenKhoa) => {
    if (specialty) {
      setEditingId(specialty._id);
      setFormName(specialty.name);
    } else {
      setEditingId(null);
      setFormName("");
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    const trimmedName = formName.trim();
    if (!trimmedName) {
      toast.error("Vui lòng nhập tên chuyên khoa");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update
        await updateChuyenKhoa(editingId, { name: trimmedName });
        toast.success("Cập nhật chuyên khoa thành công");
      } else {
        // Create
        await createChuyenKhoa({ name: trimmedName } as ChuyenKhoa);
        toast.success("Thêm chuyên khoa thành công");
      }
      setOpenDialog(false);
      setFormName("");
      setPage(1);
      await fetchSpecialties();
    } catch (err) {
      console.error("Submit failed", err);
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Thao tác thất bại";
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setProcessingIds((s) => new Set(s).add(deleteTargetId));
    try {
      const result: any = await deleteChuyenKhoa(deleteTargetId);
      const isSuccess = result?.code ? result.code === "SUCCESS" : (result?.success !== false);

      if (!isSuccess) {
        toast.error(result?.message || "Không thể xoá chuyên khoa");
      } else {
        toast.success(result?.message || "Xóa chuyên khoa thành công");
        setDeleteConfirmOpen(false);
        setDeleteTargetId(null);
        setPage(1);
        await fetchSpecialties();
      }
    } catch (err) {
      console.error("Delete failed", err);
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || "Xóa thất bại";
      toast.error(String(msg));
    } finally {
      setProcessingIds((s) => {
        const next = new Set(s);
        next.delete(deleteTargetId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Thêm, sửa, xóa chuyên khoa trong hệ thống</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm chuyên khoa
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Tìm chuyên khoa..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách chuyên khoa</CardTitle>
            {/* <CardDescription>
              {loading ? "Đang tải..." : `Trang ${page} / ${totalPages} (${total} chuyên khoa)`}
            </CardDescription> */}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên chuyên khoa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {specialties.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        {keyword ? "Không tìm thấy chuyên khoa phù hợp" : "Chưa có chuyên khoa"}
                      </td>
                    </tr>
                  ) : (
                    specialties.map((specialty) => (
                      <tr key={specialty._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{specialty.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-500 font-mono">{specialty._id}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(specialty)}
                              disabled={processingIds.has(specialty._id)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDelete(specialty._id)}
                              disabled={processingIds.has(specialty._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Trang <span className="font-semibold text-gray-900 dark:text-white">{page}</span> / <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ‹ Trước
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau ›
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-6 !sm:max-w-none">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Sửa chuyên khoa" : "Thêm chuyên khoa"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Tên chuyên khoa
              </label>
              <Input
                placeholder="Nhập tên chuyên khoa..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting) handleSubmit();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-6 !sm:max-w-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Xác nhận xóa
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bạn có chắc chắn muốn xóa chuyên khoa này? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={processingIds.has(deleteTargetId || "")}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={processingIds.has(deleteTargetId || "")}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
