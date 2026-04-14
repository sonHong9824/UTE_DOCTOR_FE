import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompletedAppointment } from "@/types/medicalRecordDTO";
import { Calendar, Clock, FileText, Droplet, Stethoscope, Star } from "lucide-react";

interface PatientRecordCardProps {
  appointment: CompletedAppointment;
  onViewDetails: (appointment: CompletedAppointment) => void;
}

export function PatientRecordCard({ appointment, onViewDetails }: PatientRecordCardProps) {
  const { date, timeSlot, reasonForAppointment } = appointment;
  const patient = appointment.patient;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

  const getLatestDiagnosis = () => {
    if (appointment.appointmentMedicalRecord?.diagnosis) {
      return appointment.appointmentMedicalRecord.diagnosis;
    }
    if (patient.medicalRecord?.medicalHistory?.length > 0) {
      const latest = patient.medicalRecord.medicalHistory[patient.medicalRecord.medicalHistory.length - 1];
      return latest.diagnosis;
    }
    return "Chưa có chẩn đoán";
  };

  const diagnosis = getLatestDiagnosis();

  return (
    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-blue-100 dark:border-blue-900">
            <AvatarImage src={patient.profile?.avatarUrl} alt={patient.profile?.name} />
            <AvatarFallback className="text-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {getInitials(patient.profile?.name || "")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {patient.profile?.name || "Bệnh nhân"}
              </h3>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 shrink-0">
                Hoàn thành
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {patient.profile?.gender}
              </span>
              <span className="flex items-center gap-1">
                <Droplet className="h-3 w-3" />
                {patient.bloodType}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">{timeSlot.start} - {timeSlot.end}</span>
          </div>
        </div>

        {/* Diagnosis - Highlighted */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Chẩn đoán</p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                {diagnosis}
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Lý do khám:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {reasonForAppointment}
          </p>
        </div>

        {/* Review */}
        {appointment.review && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-current" />
              <span className="font-semibold text-amber-900 dark:text-amber-100">
                {appointment.review.rating}/10
              </span>
            </div>
            {appointment.review.comment && (
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                {appointment.review.comment}
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="default"
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          onClick={() => onViewDetails(appointment)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Xem hồ sơ chi tiết
        </Button>
      </CardContent>
    </Card>
  );
}
