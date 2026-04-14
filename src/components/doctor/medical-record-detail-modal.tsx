"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CompletedAppointment, MedicalHistoryRecord } from "@/types/medicalRecordDTO";
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  Droplet, 
  FileText, 
  Heart, 
  Pill, 
  Ruler, 
  User,
  Weight,
  AlertTriangle,
  Star
} from "lucide-react";

interface MedicalRecordDetailModalProps {
  appointment: CompletedAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicalRecordDetailModal({
  appointment,
  open,
  onOpenChange,
}: MedicalRecordDetailModalProps) {
  if (!appointment) return null;

  const { date, timeSlot, reasonForAppointment } = appointment;
  const patient = appointment.patient;
  const medicalRecord = patient.medicalRecord;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Hồ sơ bệnh án chi tiết</DialogTitle>
        </DialogHeader>

        {/* Patient Info Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={patient.profile?.avatarUrl} alt={patient.profile?.name} />
                <AvatarFallback className="text-lg">{getInitials(patient.profile?.name || "")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{patient.profile?.name}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.profile?.gender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{calculateAge(patient.profile?.dob || "")} tuổi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-muted-foreground" />
                    <span>Nhóm máu: {patient.bloodType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📧 {patient.profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📞 {patient.profile?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍 {patient.profile?.address}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">ID: {patient._id.slice(-8)}</Badge>
                <div className="text-sm text-muted-foreground">
                  <p>Ngày khám: {formatDate(date)}</p>
                  <p>{timeSlot.start} - {timeSlot.end}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Chiều cao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{patient.height} cm</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Cân nặng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{patient.weight} kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                BMI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {(patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="history">Lịch sử khám</TabsTrigger>
            <TabsTrigger value="allergies">Dị ứng</TabsTrigger>
            <TabsTrigger value="vitals">Chỉ số sức khỏe</TabsTrigger>
            <TabsTrigger value="current">Lần khám này</TabsTrigger>
          </TabsList>

          {/* Medical History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lịch sử khám bệnh ({medicalRecord?.medicalHistory?.length || 0} lần)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicalRecord?.medicalHistory && medicalRecord.medicalHistory.length > 0 ? (
                  [...medicalRecord.medicalHistory]
                    .reverse()
                    .map((record: MedicalHistoryRecord, index: number) => (
                      <div key={record._id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              Lần {medicalRecord.medicalHistory.length - index}
                            </Badge>
                            <p className="font-semibold text-lg">{record.diagnosis}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(record.dateRecord)}
                          </span>
                        </div>
                        
                        {record.note && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground">Ghi chú:</p>
                            <p className="text-sm">{record.note}</p>
                          </div>
                        )}

                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Pill className="h-4 w-4" />
                              Đơn thuốc:
                            </p>
                            <div className="space-y-2">
                              {record.prescriptions.map((prescription, idx) => (
                                <div
                                  key={idx}
                                  className="bg-muted/50 rounded p-2 text-sm"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium">{prescription.name}</span>
                                    <span className="text-muted-foreground">
                                      SL: {prescription.quantity}
                                    </span>
                                  </div>
                                  {prescription.note && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {prescription.note}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có lịch sử khám bệnh
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allergies */}
          <TabsContent value="allergies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Dị ứng thuốc
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecord?.drugAllergies && medicalRecord.drugAllergies.length > 0 ? (
                  <div className="space-y-3">
                    {medicalRecord.drugAllergies.map((allergy) => (
                      <div key={allergy._id} className="border-l-4 border-orange-500 pl-4 py-2">
                        <p className="font-semibold">{allergy.name}</p>
                        <p className="text-sm text-muted-foreground">{allergy.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ghi nhận: {formatDate(allergy.dateRecord)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Không có dị ứng thuốc
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Dị ứng thực phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecord?.foodAllergies && medicalRecord.foodAllergies.length > 0 ? (
                  <div className="space-y-3">
                    {medicalRecord.foodAllergies.map((allergy) => (
                      <div key={allergy._id} className="border-l-4 border-red-500 pl-4 py-2">
                        <p className="font-semibold">{allergy.name}</p>
                        <p className="text-sm text-muted-foreground">{allergy.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ghi nhận: {formatDate(allergy.dateRecord)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Không có dị ứng thực phẩm
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vital Signs */}
          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Huyết áp
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecord?.bloodPressure && medicalRecord.bloodPressure.length > 0 ? (
                  <div className="space-y-2">
                    {[...medicalRecord.bloodPressure].reverse().slice(0, 10).map((record) => (
                      <div
                        key={record._id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <span className="font-medium">
                          {record.bloodPressure.systolic}/{record.bloodPressure.diastolic} mmHg
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(record.dateRecord)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Chưa có dữ liệu huyết áp
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Nhịp tim
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecord?.heartRate && medicalRecord.heartRate.length > 0 ? (
                  <div className="space-y-2">
                    {[...medicalRecord.heartRate].reverse().slice(0, 10).map((record) => (
                      <div
                        key={record._id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <span className="font-medium">{record.value} bpm</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(record.dateRecord)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Chưa có dữ liệu nhịp tim
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Current Appointment */}
          <TabsContent value="current">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin buổi khám</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày khám</p>
                    <p className="font-medium">{formatDate(date)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">{timeSlot.start} - {timeSlot.end}</p>
                    <Badge variant="secondary" className="mt-1">{timeSlot.label}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Lý do khám</p>
                    <p className="font-medium">{reasonForAppointment}</p>
                  </div>
                  {/* <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Chuyên khoa</p>
                    <p className="font-medium">{typeof appointment.specialtyId === 'string' ? appointment.specialtyId : appointment.specialtyId.name}</p>
                  </div> */}
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Phí khám</p>
                    <p className="font-medium text-lg">
                      {appointment.consultationFee.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                    <Badge>{appointment.paymentMethod}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Review from patient */}
              {appointment.review && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      Đánh giá từ bệnh nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < appointment.review!.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {appointment.review.rating}/10
                      </span>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Nhận xét</p>
                      <p className="text-sm bg-amber-50 dark:bg-amber-950/30 rounded p-3 border border-amber-200 dark:border-amber-800">
                        {appointment.review.comment || "Không có nhận xét"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Đánh giá vào: {formatDateTime(appointment.review.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Record from this appointment */}
              {appointment.appointmentMedicalRecord && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Chẩn đoán và xử lý
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Chẩn đoán</p>
                      <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                        {appointment.appointmentMedicalRecord.diagnosis}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Ghi chú của bác sĩ</p>
                      <p className="text-sm bg-muted/50 rounded p-3">
                        {appointment.appointmentMedicalRecord.note || "Không có ghi chú"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Đơn thuốc</p>
                      {appointment.appointmentMedicalRecord.prescriptions && 
                       appointment.appointmentMedicalRecord.prescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {appointment.appointmentMedicalRecord.prescriptions.map((med, idx) => (
                            <div
                              key={idx}
                              className="border rounded p-3 bg-white dark:bg-gray-900"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">{med.name}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Số lượng: {med.quantity}
                                  </p>
                                </div>
                              </div>
                              {med.note && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                  📝 {med.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Không có đơn thuốc</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
