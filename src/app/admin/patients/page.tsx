"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Phone, Eye, Stethoscope, Edit, Users } from "lucide-react";
import { toast } from "sonner";
import { getPatientsAdmin } from "@/apis/admin/patients.api";
import { updateAccountStatus } from "@/apis/admin/admin.api";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [activatingIds, setActivatingIds] = useState<Set<string>>(new Set());

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (keyword && keyword.trim()) params.keyword = keyword.trim();

      const res = await getPatientsAdmin(params);
      // API returns { code, message, data: [...], pagination }
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      const pagination = (res as any)?.data?.pagination ?? (res as any)?.pagination ?? {};

      setPatients(list);
      setTotal(Number(pagination.total) || list.length || 0);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (err) {
      console.error("Failed to fetch patients", err);
      try {
        const e: any = err;
        const serverMsg = e?.response?.data?.message ?? e?.message ?? "Lỗi khi tải danh sách bệnh nhân";
        toast.error(String(serverMsg));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchPatients();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleToggleAccount = async (patient: any) => {
    if (!patient?.accountId?._id) {
      toast.error("Tài khoản chưa được tạo cho bệnh nhân này");
      return;
    }
    const target = patient.accountId.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`Xác nhận đổi trạng thái thành ${target}?`)) return;
    setActivatingIds((s) => new Set(s).add(patient._id));
    try {
      await updateAccountStatus(patient.accountId._id, target);
      toast.success("Cập nhật trạng thái tài khoản thành công");
      await fetchPatients();
    } catch (err) {
      console.error("Failed to update patient account status", err);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setActivatingIds((s) => {
        const next = new Set(s);
        next.delete(patient._id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý Bệnh nhân</h1>
            <p className="text-sm text-gray-600">Danh sách bệnh nhân và hồ sơ y tế</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Tìm tên, email, số điện thoại..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bệnh nhân</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hồ sơ y tế</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Liên hệ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thông tin</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {patients.map((p) => {
                    const profile = p.profileId ?? {};
                    const avatar = profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name ?? p._id)}`;
                    const accountStatus = p.accountId?.status ?? "UNKNOWN";
                    const age = profile.dob ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null;
                    return (
                      <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img src={avatar} alt={profile.name} className="w-10 h-10 rounded-full" />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {profile.name ?? '—'}
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : accountStatus === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                                  {accountStatus}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{profile.gender ?? ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            <Stethoscope size={12} />
                            {p.medicalRecord?._id ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">{profile.email ?? ''}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{profile.phone ?? ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {age ? `${age} tuổi` : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedPatient(p); setOpenDetail(true); }}>
                              <Edit size={14} className="mr-1" />
                            </Button>
                            {(() => {
                              const isActive = accountStatus === 'ACTIVE';
                              return (
                                <Button variant="ghost" size="sm" className={`flex items-center gap-2 ${isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`} onClick={() => handleToggleAccount(p)} disabled={activatingIds.has(p._id)}>
                                  {activatingIds.has(p._id) ? (
                                    <span className="flex items-center gap-2">
                                      <span className="w-3 h-3 border-2 border-current rounded-full animate-spin" />
                                      Đang...
                                    </span>
                                  ) : (
                                    <>
                                      <Users size={14} />
                                      {isActive ? 'Inactive' : 'Active'}
                                    </>
                                  )}
                                </Button>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination controls */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Đang tải danh sách...' : `Hiển thị trang ${page} / ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
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

        {/* Detail dialog */}
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="max-w-2xl mx-auto p-0">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-lg font-bold">Chi tiết bệnh nhân</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              {selectedPatient ? (
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <img src={selectedPatient.profileId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedPatient.profileId?.name ?? selectedPatient._id)}`} alt="avatar" className="w-20 h-20 rounded-full" />
                    <div>
                      <div className="text-xl font-semibold">{selectedPatient.profileId?.name}</div>
                      <div className="text-sm text-gray-600">{selectedPatient.profileId?.email}</div>
                      <div className="text-sm text-gray-600">{selectedPatient.profileId?.phone}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Chiều cao</div>
                      <div className="font-medium">{selectedPatient.height ?? selectedPatient.medicalRecord?.height ?? '—'} cm</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cân nặng</div>
                      <div className="font-medium">{selectedPatient.weight ?? selectedPatient.medicalRecord?.weight ?? '—'} kg</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Nhóm máu</div>
                      <div className="font-medium">{selectedPatient.bloodType ?? selectedPatient.medicalRecord?.bloodType ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Số hồ sơ y tế</div>
                      <div className="font-medium">{selectedPatient.medicalRecord?._id ?? '—'}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold">Lịch sử y tế (một vài mục gần nhất)</h4>
                    <ul className="mt-2 space-y-2">
                      {(selectedPatient.medicalRecord?.medicalHistory ?? []).slice(0,3).map((h: any) => (
                        <li key={h._id} className="text-sm text-gray-700">{new Date(h.dateRecord).toLocaleDateString()} — {h.diagnosis} — {h.note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div>Không có dữ liệu</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
