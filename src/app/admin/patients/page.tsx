"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Phone, Eye, Stethoscope, Edit, Users, Calendar, MapPin, AlertTriangle } from "lucide-react";
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
  const [openMedicalRecord, setOpenMedicalRecord] = useState(false);
  const [activatingIds, setActivatingIds] = useState<Set<string>>(new Set());

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (keyword && keyword.trim()) {
        const q = keyword.trim();
        // send both for compatibility
        params.keyword = q;
        params.key = q;
      }

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
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors" onClick={() => { setSelectedPatient(p); setOpenMedicalRecord(true); }}>
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
                              <Eye size={14} className="mr-1" />
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
          <DialogContent className="w-auto max-w-fit mx-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold">Chi tiết bệnh nhân</DialogTitle>
            </DialogHeader>
            {selectedPatient?.profileId ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-blue-100 dark:border-blue-900">
                    <img src={selectedPatient.profileId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedPatient.profileId?.name ?? selectedPatient._id)}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPatient.profileId?.name ?? '—'}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedPatient.profileId?.gender ?? '—'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <Phone size={18} className="text-blue-500" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Số điện thoại</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.profileId?.phone ?? '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <Eye size={18} className="text-blue-500" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.profileId?.email ?? '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <Calendar size={18} className="text-blue-500" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Ngày sinh</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.profileId?.dob ? new Date(selectedPatient.profileId.dob).toLocaleDateString('vi-VN') : '—'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <MapPin size={18} className="text-blue-500" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Địa chỉ</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{selectedPatient.profileId?.address ?? '—'}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={() => setOpenDetail(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Medical Record Dialog - Drug Allergies & Appointments */}
        <Dialog open={openMedicalRecord} onOpenChange={setOpenMedicalRecord}>
          <DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-0 !sm:max-w-none">
            <DialogHeader className="pb-3 px-6 pt-6">
              <DialogTitle className="text-xl font-semibold">
                Hồ sơ y tế - {selectedPatient?.profileId?.name ?? '—'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPatient?.medicalRecord ? (
              <div className="overflow-y-auto flex-1 px-6 pb-6">
                <div className="grid grid-cols-1 gap-4">
                  {/* Drug Allergies Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">Dị ứng thuốc</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {(selectedPatient.medicalRecord?.drugAllergies ?? []).length > 0 ? (
                        (selectedPatient.medicalRecord.drugAllergies).map((allergy: any) => (
                          <div key={allergy._id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-red-800 dark:text-red-300 text-sm">{allergy.name}</h4>
                              <span className="text-xs text-red-600 dark:text-red-400">
                                {allergy.dateRecord ? new Date(allergy.dateRecord).toLocaleDateString('vi-VN') : '—'}
                              </span>
                            </div>
                            <p className="text-xs text-red-700 dark:text-red-400">{allergy.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 dark:bg-slate-800 rounded p-3 text-center">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Không có dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Food Allergies Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-orange-600 dark:text-orange-400" />
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">Dị ứng thực phẩm</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {(selectedPatient.medicalRecord?.foodAllergies ?? []).length > 0 ? (
                        (selectedPatient.medicalRecord.foodAllergies).map((allergy: any) => (
                          <div key={allergy._id} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-orange-800 dark:text-orange-300 text-sm">{allergy.name}</h4>
                              <span className="text-xs text-orange-600 dark:text-orange-400">
                                {allergy.dateRecord ? new Date(allergy.dateRecord).toLocaleDateString('vi-VN') : '—'}
                              </span>
                            </div>
                            <p className="text-xs text-orange-700 dark:text-orange-400">{allergy.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 dark:bg-slate-800 rounded p-3 text-center">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Không có dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vital Signs Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={18} className="text-purple-600 dark:text-purple-400" />
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">Chỉ số sức khỏe</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3">
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Chiều cao / Cân nặng</div>
                        <div className="text-base font-semibold text-purple-900 dark:text-purple-100">
                          {selectedPatient.medicalRecord?.height ?? '—'} cm / {selectedPatient.medicalRecord?.weight ?? '—'} kg
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3">
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Nhóm máu</div>
                        <div className="text-base font-semibold text-purple-900 dark:text-purple-100">
                          {selectedPatient.medicalRecord?.bloodType ?? '—'}
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3">
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Huyết áp</div>
                        <div className="text-base font-semibold text-purple-900 dark:text-purple-100">
                          {(() => {
                            const bp = selectedPatient.medicalRecord?.bloodPressure?.[selectedPatient.medicalRecord.bloodPressure.length - 1];
                            return bp ? `${bp.bloodPressure?.systolic ?? '—'}/${bp.bloodPressure?.diastolic ?? '—'}` : '—';
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={18} className="text-blue-600 dark:text-blue-400" />
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                        Lịch sử khám ({selectedPatient.medicalRecord?.medicalHistory?.length ?? 0} buổi)
                      </h3>
                    </div>
                    
                    <div className="space-y-2">
                      {(selectedPatient.medicalRecord?.medicalHistory ?? []).length > 0 ? (
                        (selectedPatient.medicalRecord.medicalHistory).slice().reverse().map((record: any, idx: number) => (
                          <div key={record._id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm flex-1">{record.diagnosis}</h4>
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {record.dateRecord ? new Date(record.dateRecord).toLocaleDateString('vi-VN') : '—'}
                              </span>
                            </div>

                            {record.note && (
                              <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">{record.note}</p>
                            )}

                            {Array.isArray(record.prescriptions) && record.prescriptions.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                                <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Đơn thuốc:</p>
                                <ul className="space-y-1">
                                  {record.prescriptions.map((prescription: any, pIdx: number) => (
                                    <li key={pIdx} className="text-xs text-blue-800 dark:text-blue-300">
                                      • {prescription.name} - SL: {prescription.quantity}
                                      {prescription.note && ` (${prescription.note})`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 dark:bg-slate-800 rounded p-3 text-center">
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Không có dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Không có dữ liệu hồ sơ y tế</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}