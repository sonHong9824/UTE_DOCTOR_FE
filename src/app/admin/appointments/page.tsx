"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Calendar, Clock, User, Stethoscope, Eye, X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getAppointmentsAdmin, cancelAppointment, confirmAppointment } from "@/apis/admin/appointments.api";
import { getPatientsAdmin } from "@/apis/admin/patients.api";
import { getActiveDoctors } from "@/apis/admin/admin.api";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [patientFilter, setPatientFilter] = useState<string>("ALL");
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const fetchPatients = async () => {
    try {
      const res = await getPatientsAdmin({ page: 1, limit: 1000 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      setPatients(list);
    } catch (err) {
      console.error("Failed to fetch patients for filter", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await getActiveDoctors({ page: 1, limit: 1000 });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.items)
            ? res.data.items
            : [];
      setDoctors(list);
    } catch (err) {
      console.error("Failed to fetch doctors for filter", err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (keyword && keyword.trim()) {
        const q = keyword.trim();
        params.keyword = q;
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.appointmentStatus = statusFilter;
      }
      if (patientFilter && patientFilter !== "ALL") {
        params.patientId = patientFilter;
      }
      if (doctorFilter && doctorFilter !== "ALL") {
        params.doctorId = doctorFilter;
      }

      const res = await getAppointmentsAdmin(params);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
      const pagination = (res as any)?.pagination ?? (res as any)?.data?.pagination ?? {};

      setAppointments(list);
      setTotal(Number(pagination.total) || list.length || 0);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      try {
        const e: any = err;
        const serverMsg = e?.response?.data?.message ?? e?.message ?? "Lỗi khi tải danh sách cuộc hẹn";
        toast.error(String(serverMsg));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, patientFilter, doctorFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchAppointments();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleConfirmAppointment = async (id: string) => {
    if (!window.confirm("Xác nhận cuộc hẹn này?")) return;
    setProcessingIds((s) => new Set(s).add(id));
    try {
      await confirmAppointment(id);
      toast.success("Đã xác nhận cuộc hẹn");
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to confirm appointment", err);
      toast.error("Không thể xác nhận cuộc hẹn");
    } finally {
      setProcessingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setProcessingIds((s) => new Set(s).add(selectedAppointment._id));
    try {
      await cancelAppointment(selectedAppointment._id, cancelReason);
      toast.success("Hủy cuộc hẹn thành công");
      setOpenCancel(false);
      setCancelReason("");
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      toast.error("Không thể hủy cuộc hẹn");
    } finally {
      setProcessingIds((s) => {
        const next = new Set(s);
        next.delete(selectedAppointment._id);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      PENDING: { label: "Chờ xác nhận", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
      CONFIRMED: { label: "Đã xác nhận", class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      COMPLETED: { label: "Hoàn thành", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      CANCELLED: { label: "Đã hủy", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
      NO_SHOW: { label: "Không đến", class: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
    };
    const badge = statusMap[status] || { label: status, class: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Danh sách cuộc hẹn và trạng thái</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Tìm bệnh nhân, bác sĩ..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={patientFilter}
                onChange={(e) => { setPage(1); setPatientFilter(e.target.value); }}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm min-w-[200px]"
              >
                <option value="ALL">Tất cả bệnh nhân</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.profileId?.name ?? p._id}
                  </option>
                ))}
              </select>
              <select
                value={doctorFilter}
                onChange={(e) => { setPage(1); setDoctorFilter(e.target.value); }}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm min-w-[200px]"
              >
                <option value="ALL">Tất cả bác sĩ</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.profile?.name ?? d.profileId?.name ?? d.doctorName ?? d._id}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="NO_SHOW">Không đến</option>
              </select>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bác sĩ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày & Giờ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.map((apt) => {
                    const patient = apt.patientId ?? {};
                    const doctor = apt.doctorId ?? {};
                    const patientProfile = patient.profileId ?? patient.profile ?? {};
                    const doctorProfile = doctor.profileId ?? doctor.profile ?? {};
                    const status = apt.appointmentStatus || apt.status;
                    const date = apt.date ? new Date(apt.date).toLocaleDateString('vi-VN') : '—';
                    const time = apt.timeSlot?.start || apt.timeSlot?.startTime || '—';
                    const timeEnd = apt.timeSlot?.end || apt.timeSlot?.endTime;
                    const doctorDept = doctor.specialty?.name
                      ?? doctor.chuyenKhoa?.name
                      ?? (typeof doctor.chuyenKhoaId === 'object' ? doctor.chuyenKhoaId?.name : doctor.chuyenKhoaId)
                      ?? '—';

                    return (
                      <tr key={apt._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={patientProfile.avatarUrl} alt={patientProfile.name} />
                              <AvatarFallback>{(patientProfile.name || "? ").slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{patientProfile.name ?? '—'}</div>
                              <div className="text-sm text-gray-500">{patientProfile.phone ?? '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={doctorProfile.avatarUrl} alt={doctorProfile.name} />
                              <AvatarFallback>{(doctorProfile.name || doctor.doctorName || "? ").slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{doctorProfile.name ?? doctor.doctorName ?? '—'}</div>
                              <div className="text-sm text-gray-500">{doctorDept}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-gray-400" />
                              {date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock size={14} className="text-gray-400" />
                              {time}{timeEnd ? ` - ${timeEnd}` : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setSelectedAppointment(apt); setSelectedDoctorId(""); setOpenDetail(true); }}
                            >
                              <Eye size={14} className="mr-1" />
                              Xem
                            </Button>
                            {(status === "PENDING") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleConfirmAppointment(apt._id)}
                                disabled={processingIds.has(apt._id)}
                              >
                                <CheckCircle2 size={14} className="mr-1" />
                                Xác nhận
                              </Button>
                            )}
                            {/* {(status === "PENDING" || status === "CONFIRMED") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => { setSelectedAppointment(apt); setOpenCancel(true); }}
                                disabled={processingIds.has(apt._id)}
                              >
                                <XCircle size={14} className="mr-1" />
                                Hủy
                              </Button>
                            )} */}
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

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? 'Đang tải...' : `Hiển thị trang ${page} / ${totalPages} (${total} cuộc hẹn)`}
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

        {/* Detail Dialog */}
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-0 !sm:max-w-none">
            <DialogHeader className="pb-3 px-6 pt-6">
              <DialogTitle className="text-xl font-bold">Chi tiết cuộc hẹn</DialogTitle>
            </DialogHeader>
            {selectedAppointment ? (
              <div className="overflow-y-auto flex-1 px-6 pb-6">
                <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Thông tin bệnh nhân</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedAppointment.patientId?.profile?.avatarUrl ?? selectedAppointment.patientId?.profileId?.avatarUrl}
                              alt={selectedAppointment.patientId?.profile?.name ?? selectedAppointment.patientId?.profileId?.name} />
                            <AvatarFallback>
                              {(selectedAppointment.patientId?.profile?.name ?? selectedAppointment.patientId?.profileId?.name ?? "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{selectedAppointment.patientId?.profile?.name ?? selectedAppointment.patientId?.profileId?.name ?? '—'}</div>
                            <div className="text-sm text-gray-500">{selectedAppointment.patientId?.profile?.email ?? selectedAppointment.patientId?.profileId?.email ?? '—'}</div>
                          </div>
                        </div>
                        <div><span className="font-medium">Tên:</span> {selectedAppointment.patientId?.profile?.name ?? selectedAppointment.patientId?.profileId?.name ?? '—'}</div>
                        <div><span className="font-medium">SĐT:</span> {selectedAppointment.patientId?.profile?.phone ?? selectedAppointment.patientId?.profileId?.phone ?? '—'}</div>
                        <div><span className="font-medium">Email:</span> {selectedAppointment.patientId?.profile?.email ?? selectedAppointment.patientId?.profileId?.email ?? '—'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Thông tin bác sĩ</h3>
                      {selectedAppointment.doctorId ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedAppointment.doctorId?.profile?.avatarUrl ?? selectedAppointment.doctorId?.profileId?.avatarUrl}
                                alt={selectedAppointment.doctorId?.profile?.name ?? selectedAppointment.doctorId?.profileId?.name ?? selectedAppointment.doctorId?.doctorName} />
                              <AvatarFallback>
                                {(selectedAppointment.doctorId?.profile?.name ?? selectedAppointment.doctorId?.profileId?.name ?? selectedAppointment.doctorId?.doctorName ?? "?").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{selectedAppointment.doctorId?.profile?.name ?? selectedAppointment.doctorId?.profileId?.name ?? selectedAppointment.doctorId?.doctorName ?? '—'}</div>
                              <div className="text-sm text-gray-500">{selectedAppointment.doctorId?.profile?.email ?? selectedAppointment.doctorId?.profileId?.email ?? '—'}</div>
                            </div>
                          </div>
                          <div><span className="font-medium">Tên:</span> {selectedAppointment.doctorId?.profile?.name ?? selectedAppointment.doctorId?.profileId?.name ?? selectedAppointment.doctorId?.doctorName ?? '—'}</div>
                          <div><span className="font-medium">Chuyên khoa:</span> {selectedAppointment.doctorId?.specialty?.name ?? selectedAppointment.doctorId?.chuyenKhoa?.name ?? (typeof selectedAppointment.doctorId?.chuyenKhoaId === 'object' ? selectedAppointment.doctorId?.chuyenKhoaId?.name : selectedAppointment.doctorId?.chuyenKhoaId) ?? '—'}</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">Chưa gán bác sĩ cho buổi hẹn này.</p>
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedDoctorId}
                              onChange={(e) => setSelectedDoctorId(e.target.value)}
                              className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                            >
                              <option value="">Chọn bác sĩ</option>
                              {doctors.map((d) => (
                                <option key={d._id} value={d._id}>
                                  {d.doctorName ?? d.profile?.name ?? d.profileId?.name ?? d._id}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!selectedDoctorId) {
                                  toast.error("Vui lòng chọn bác sĩ");
                                  return;
                                }
                                const chosen = doctors.find((d) => d._id === selectedDoctorId);
                                if (!chosen) {
                                  toast.error("Không tìm thấy bác sĩ đã chọn");
                                  return;
                                }
                                setSelectedAppointment((prev: any) => (prev ? { ...prev, doctorId: chosen } : prev));
                                toast.success("Đã chọn bác sĩ (chỉ lưu tạm trong phiên)");
                              }}
                            >
                              Chọn
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Lưu ý: hiện chỉ lưu trong phiên xem; cần API gán bác sĩ để lưu vào hệ thống.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Thời gian</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Ngày:</span> {selectedAppointment.date ? new Date(selectedAppointment.date).toLocaleDateString('vi-VN') : '—'}</div>
                    <div><span className="font-medium">Giờ:</span> {selectedAppointment.timeSlot?.start || selectedAppointment.timeSlot?.startTime || '—'} - {selectedAppointment.timeSlot?.end || selectedAppointment.timeSlot?.endTime || '—'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Trạng thái</h3>
                  {getStatusBadge(selectedAppointment.appointmentStatus || selectedAppointment.status)}
                </div>

                {selectedAppointment.reasonForAppointment && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Lý do khám</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedAppointment.reasonForAppointment}</p>
                  </div>
                )}

                {selectedAppointment.cancelReason && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Lý do hủy</h3>
                    <p className="text-sm text-red-600">{selectedAppointment.cancelReason}</p>
                  </div>
                )}
              </div>
            </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={openCancel} onOpenChange={setOpenCancel}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <AlertCircle className="text-red-500" size={24} />
                Hủy cuộc hẹn
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Bạn có chắc muốn hủy cuộc hẹn này?</p>
              <div>
                <label className="block text-sm font-medium mb-2">Lý do hủy</label>
                <Input
                  placeholder="Nhập lý do hủy (tùy chọn)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setOpenCancel(false); setCancelReason(""); }}>
                  Đóng
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelAppointment}
                  disabled={processingIds.has(selectedAppointment?._id ?? '')}
                >
                  Xác nhận hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
