"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMedicines, Medicine, createMedicine, deleteMedicine, updateMedicine } from "@/apis/medicine/medicine.api";
import { Search, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminMedicinesPage() {
  const [items, setItems] = React.useState<Medicine[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [query, setQuery] = React.useState<string>("");
  const [sort, setSort] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);
  const [createForm, setCreateForm] = React.useState({ name: "", packaging: "" });
  const [isCreating, setIsCreating] = React.useState<boolean>(false);
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false);
  const [editForm, setEditForm] = React.useState({ id: "", name: "", packaging: "" });
  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMedicines({ page, limit, keyword: query || undefined, sort });
      setItems(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.total ?? 0);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Không thể tải danh sách thuốc");
    } finally {
      setLoading(false);
    }
  }, [limit, page, query, sort]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) =>
      [m.name, m.packaging].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const totalPages = React.useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total, limit]);

  const handleCreateMedicine = async () => {
    if (!createForm.name.trim() || !createForm.packaging.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsCreating(true);
    try {
      await createMedicine({
        name: createForm.name.trim(),
        packaging: createForm.packaging.trim(),
      });
      toast.success("Thêm thuốc thành công", { id: "create-medicine-success" });
      setShowCreateModal(false);
      setCreateForm({ name: "", packaging: "" });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Không thể thêm thuốc");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditMedicine = async () => {
    if (!editForm.name.trim() || !editForm.packaging.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsEditing(true);
    try {
      await updateMedicine(editForm.id, {
        name: editForm.name.trim(),
        packaging: editForm.packaging.trim(),
      });
      toast.success("Sửa thuốc thành công", { id: "update-medicine-success" });
      setShowEditModal(false);
      setEditForm({ id: "", name: "", packaging: "" });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Không thể sửa thuốc");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý danh mục thuốc</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative grow">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên thuốc"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "asc" | "desc");
                  setPage(1);
                }}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
              >
                <option value="asc">A - Z</option>
                <option value="desc">Z - A</option>
              </select>
              <Button
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Thêm mới
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">{String(error)}</div>
            )}

            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Tên thuốc</th>
                    <th className="px-4 py-2 text-left font-medium">Quy cách / Đóng gói</th>
                    <th className="px-4 py-2 text-right font-medium w-54">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-3" colSpan={2}>Đang tải danh sách...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={2}>
                        Không có thuốc phù hợp
                      </td>
                    </tr>
                  ) : (
                    filtered.map((m) => (
                      <tr
                        key={m._id}
                        className="border-t odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="px-4 py-2">{m.name}</td>
                        <td className="px-4 py-2">{m.packaging}</td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                              onClick={() => {
                                setEditForm({ id: m._id, name: m.name, packaging: m.packaging });
                                setShowEditModal(true);
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              onClick={async () => {
                                const ok = window.confirm(`Xóa thuốc "${m.name}"?`);
                                if (!ok) return;
                                try {
                                  await deleteMedicine(m._id);
                                  toast.success("Xóa thuốc thành công", { id: `delete-${m._id}` });
                                  load();
                                } catch (e: any) {
                                  toast.error(e?.response?.data?.message ?? "Không thể xóa thuốc");
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <div>
                {loading
                  ? "Đang tải..."
                  : `Hiển thị trang ${page} / ${totalPages} (${total} thuốc)`}
              </div>
              <div className="flex items-center gap-2">
                <select
                value={limit}
                onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
                >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                ‹ Trước
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Sau ›
                </Button>
            </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-6 !sm:max-w-none">
            <DialogHeader>
              <DialogTitle>Thêm thuốc mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin thuốc để thêm vào danh sách
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên thuốc *</label>
                <Input
                  placeholder="Nhập tên thuốc"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quy cách / Đóng gói *</label>
                <Input
                  placeholder="Ví dụ: Hộp 10 vỉ x 10 viên"
                  value={createForm.packaging}
                  onChange={(e) => setCreateForm({ ...createForm, packaging: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ name: "", packaging: "" });
                }}
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateMedicine}
                disabled={isCreating || !createForm.name.trim() || !createForm.packaging.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isCreating ? "Đang thêm..." : "Thêm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-6 !sm:max-w-none">
            <DialogHeader>
              <DialogTitle>Sửa thuốc</DialogTitle>
              <DialogDescription>
                Chỉnh sửa thông tin thuốc
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên thuốc *</label>
                <Input
                  placeholder="Nhập tên thuốc"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quy cách / Đóng gói *</label>
                <Input
                  placeholder="Ví dụ: Hộp 10 vỉ x 10 viên"
                  value={editForm.packaging}
                  onChange={(e) => setEditForm({ ...editForm, packaging: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm({ id: "", name: "", packaging: "" });
                }}
                disabled={isEditing}
              >
                Hủy
              </Button>
              <Button
                onClick={handleEditMedicine}
                disabled={isEditing || !editForm.name.trim() || !editForm.packaging.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isEditing ? "Đang sửa..." : "Lưu"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
