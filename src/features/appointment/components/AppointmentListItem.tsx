import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentStatus } from "@/enum/appointment-status.enum";
import {
  getAppointmentStatusClass,
  getAppointmentStatusLabel,
  isAppointmentActionable,
} from "@/features/appointment/utils/appointment-status";
import { Calendar, Clock, Coins, Eye, User } from "lucide-react";
import React from "react";

interface AppointmentListItemProps {
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    appointmentStatus: AppointmentStatus;
    consultationFee: number;
    doctorName: string;
    specialization: string;
    actionable?: boolean;
  };
  onView?: (appointmentId: string) => void;
  onReschedule?: (appointmentId: string) => void;
  compact?: boolean;
}

export const AppointmentListItem: React.FC<AppointmentListItemProps> = ({
  appointment,
  onView,
  onReschedule,
  compact = false,
}) => {
  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();
  const canReschedule =
    isAppointmentActionable(appointment) &&
    isUpcoming &&
    (appointment.appointmentStatus === AppointmentStatus.PENDING ||
      appointment.appointmentStatus === AppointmentStatus.CONFIRMED);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{appointment.doctorName}</span>
            <Badge variant="outline" className={getAppointmentStatusClass(appointment.appointmentStatus)}>
              {getAppointmentStatusLabel(appointment.appointmentStatus)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {appointmentDate.toLocaleDateString("vi-VN")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {appointment.startTime}
            </span>
          </div>
        </div>
        {onView && (
          <Button size="sm" variant="ghost" onClick={() => onView(appointment.id)} className="ml-2">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <User className="h-3 w-3" />
              Bác sĩ
            </p>
            <p className="font-medium text-sm">{appointment.doctorName}</p>
            <p className="text-xs text-gray-600">{appointment.specialization}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Ngày khám
            </p>
            <p className="font-medium text-sm">{appointmentDate.toLocaleDateString("vi-VN")}</p>
            <p className="text-xs text-gray-600">
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Coins className="h-3 w-3" />
              Phí / Coin
            </p>
            <p className="font-medium text-sm">{appointment.consultationFee.toLocaleString("vi-VN")} VNĐ</p>
            {appointment.appointmentStatus === AppointmentStatus.RESCHEDULED && (
              <p className="text-xs text-green-600">
                Nhận {Math.ceil(appointment.consultationFee * 0.8).toLocaleString("vi-VN")} coin
              </p>
            )}
          </div>

          <div className="flex flex-col items-end justify-between">
            <Badge className={getAppointmentStatusClass(appointment.appointmentStatus)}>
              {getAppointmentStatusLabel(appointment.appointmentStatus)}
            </Badge>
            <div className="flex gap-2 mt-2">
              {onView && (
                <Button size="sm" variant="outline" onClick={() => onView(appointment.id)}>
                  Chi tiết
                </Button>
              )}
              {canReschedule && onReschedule && (
                <Button size="sm" variant="outline" onClick={() => onReschedule(appointment.id)}>
                  Hoãn
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentListItem;
