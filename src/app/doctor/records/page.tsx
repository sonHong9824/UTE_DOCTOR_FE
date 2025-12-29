"use client";

import { useState, useEffect } from "react";
import { getCompletedAppointmentsByDoctor } from "@/apis/appointment/appointment.api";
import { getPatientsAdmin } from "@/apis/patient/patient.api";
import { CompletedAppointment } from "@/types/medicalRecordDTO";
import { PatientRecordCard } from "@/components/doctor/patient-record-card";
import { MedicalRecordDetailModal } from "@/components/doctor/medical-record-detail-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Loader2, 
  FileX,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function RecordsPage() {
  const [appointments, setAppointments] = useState<CompletedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<CompletedAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(9);

  useEffect(() => {
    fetchAppointments();
    fetchAllPatients();
  }, [currentPage, searchQuery, selectedPatientId, pageSize]);

  const fetchAllPatients = async () => {
    try {
      const response = await getPatientsAdmin({
        page: 1,
        limit: 1000,
        keyword: "",
      });

      if (response?.data) {
        setAllPatients(response.data.items || response.data);
      }
    } catch (error) {
      console.error("Error fetching all patients:", error);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) {
        console.error("Doctor ID not found");
        return;
      }

      const response = await getCompletedAppointmentsByDoctor({
        doctorId,
        page: currentPage,
        limit: pageSize,
        keyword: searchQuery || undefined,
        patientId: selectedPatientId || undefined,
      });

      if (response?.data) {
        setAppointments(response.data.items || []);
        setTotalPages(response.data.pagination?.totalPages ?? 1);
        setTotalRecords(response.data.pagination?.total ?? (response.data.items?.length ?? 0));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment: CompletedAppointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleResetFilter = () => {
    setSearchQuery("");
    setSelectedPatientId("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Xem lại hồ sơ bệnh án của các bệnh nhân đã khám
        </p>
      </div>

      {/* Search Bar & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại, chẩn đoán..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>

            <div className="w-full md:w-64">
              <select
                value={selectedPatientId}
                onChange={(e) => { setSelectedPatientId(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Tất cả bệnh nhân</option>
                {allPatients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.profile?.name || patient.profileId?.name || "Bệnh nhân"}
                  </option>
                ))}
              </select>
            </div>

              <div className="w-full md:w-40">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value={9}>9 mỗi trang</option>
                  <option value={12}>12 mỗi trang</option>
                  <option value={24}>24 mỗi trang</option>
                </select>
              </div>

              {(searchQuery || selectedPatientId) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetFilter}
                  className="md:ml-2"
                >
                  Xóa bộ lọc
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalRecords}</p>
              <p className="text-sm text-muted-foreground">Tổng số hồ sơ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{filteredAppointments.length}</p>
              <p className="text-sm text-muted-foreground">Kết quả tìm kiếm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold">{currentPage}/{totalPages}</p>
              {(searchQuery || selectedPatientId) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetFilter}
                  className="ml-2"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">Trang hiện tại</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Records List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : appointments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appointment) => (
              <PatientRecordCard
                key={appointment._id}
                appointment={appointment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Bottom Pagination Bar */}
          <div className="flex items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? 'Đang tải...' : `Hiển thị trang ${currentPage} / ${totalPages} (${totalRecords} cuộc hẹn)`}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => { setCurrentPage(1); setPageSize(Number(e.target.value)); }}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                ‹ Trước
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                Sau ›
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center text-center">
              <FileX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy hồ sơ</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedPatientId
                  ? "Không có hồ sơ nào phù hợp với bộ lọc hiện tại"
                  : "Chưa có hồ sơ bệnh án nào được hoàn thành"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <MedicalRecordDetailModal
        appointment={selectedAppointment}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}


