"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllReviews, deleteReview } from "@/apis/review/review.api";
import { Search, Trash2 } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { toast } from "sonner";

interface ReviewItem {
  _id: string;
  doctorId?: { _id: string; doctorName?: string } | string;
  patientId?: { _id: string; profileId?: { _id: string; name?: string } } | string;
  appointmentId?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export default function AdminReviewsPage() {
  const [items, setItems] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [query, setQuery] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllReviews();
      const data = (res as any)?.data ?? (Array.isArray(res) ? res : []);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const doctorName = typeof r.doctorId === "string" ? r.doctorId : r.doctorId?.doctorName;
      const patientName = typeof r.patientId === "string" ? r.patientId : r.patientId?.profileId?.name;
      return [doctorName, patientName, r.comment]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, query]);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý đánh giá</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative grow">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm theo bác sĩ, bệnh nhân hoặc bình luận"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">{String(error)}</div>
            )}

            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Bác sĩ</th>
                    <th className="px-4 py-2 text-left font-medium">Bệnh nhân</th>
                    <th className="px-4 py-2 text-left font-medium">Đánh giá</th>
                    <th className="px-4 py-2 text-left font-medium">Bình luận</th>
                    <th className="px-4 py-2 text-left font-medium">Thời gian</th>
                    <th className="px-4 py-2 text-right font-medium w-54">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-3" colSpan={5}>Đang tải...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                        Không có đánh giá phù hợp
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const doctorName = typeof r.doctorId === "string" ? r.doctorId : r.doctorId?.doctorName;
                      const patientName = typeof r.patientId === "string" ? r.patientId : r.patientId?.profileId?.name;
                      return (
                        <tr key={r._id} className="border-t odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800">
                          <td className="px-4 py-2">{doctorName}</td>
                          <td className="px-4 py-2">{patientName}</td>
                          <td className="px-4 py-2">{r.rating}/10</td>
                          <td className="px-4 py-2">{r.comment}</td>
                          <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
                          <td className="px-4 py-2 text-right">
                            <UIButton
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              onClick={async () => {
                                const ok = window.confirm("Xóa đánh giá này?");
                                if (!ok) return;
                                try {
                                  await deleteReview(r._id);
                                  toast.success("Xóa đánh giá thành công", { id: `delete-${r._id}` });
                                  load();
                                } catch (e: any) {
                                  toast.error(e?.response?.data?.message ?? "Không thể xóa đánh giá");
                                }
                              }}
                            >
                              <Trash2 size={16} />
                            </UIButton>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
