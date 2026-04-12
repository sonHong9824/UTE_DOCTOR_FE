"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentStatus } from "@/enum/appointment-status.enum";
import { RescheduleAppointmentModal } from "@/features/appointment/components/RescheduleAppointmentModal";
import { useAppointmentActions } from "@/features/appointment/hooks/useAppointmentActions";
import { AppointmentCardModel } from "@/features/appointment/types/appointment.types";
import { getAppointmentStatusClass, getAppointmentStatusLabel } from "@/features/appointment/utils/appointment-status";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { AlertCircle, Calendar, Clock, Stethoscope, User } from "lucide-react";
import React, { useState } from "react";

interface AppointmentCardProps {
  appointment: AppointmentCardModel;
  availableTimeSlots?: TimeSlotDto[];
  onRescheduleSuccess?: () => void;
  onCancelSuccess?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  availableTimeSlots = [],
  onRescheduleSuccess,
  onCancelSuccess,
}) => {
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const { cancelLoading, rescheduleLoading, cancelAppointmentById, rescheduleByPayload } = useAppointmentActions();

  const canReschedule =
    appointment.appointmentStatus === AppointmentStatus.PENDING ||
    appointment.appointmentStatus === AppointmentStatus.CONFIRMED;

  const canCancel =
    appointment.appointmentStatus === AppointmentStatus.PENDING ||
    appointment.appointmentStatus === AppointmentStatus.CONFIRMED;

  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();

  const handleReschedule = async (
    appointmentId: string,
    newDate: string,
    newTimeSlotId: string,
    reason?: string
  ) => {
    await rescheduleByPayload(
      {
        appointmentId,
        newDate,
        newTimeSlotId,
        reason,
      },
      () => {
        setIsRescheduleModalOpen(false);
        onRescheduleSuccess?.();
      }
    );
  };

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy buổi khám này?")) {
      return;
    }

    await cancelAppointmentById(appointment.id, onCancelSuccess);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                {appointment.doctorName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Stethoscope className="h-4 w-4" />
                {appointment.specialization}
              </CardDescription>
            </div>
            <Badge className={getAppointmentStatusClass(appointment.appointmentStatus)}>
              {getAppointmentStatusLabel(appointment.appointmentStatus)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>
                {appointmentDate.toLocaleDateString("vi-VN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm text-gray-600">Phí tư vấn</p>
            <p className="text-lg font-semibold text-gray-900">
              {appointment.consultationFee.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          {!isUpcoming && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              Lịch hẹn này đã qua
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {canReschedule && isUpcoming ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  disabled={rescheduleLoading || cancelLoading || availableTimeSlots.length === 0}
                  className="flex-1"
                >
                  Hoãn lịch
                </Button>
                {canCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-red-500 text-white hover:bg-red-600 flex-1"
                    onClick={handleCancel}
                    disabled={cancelLoading || rescheduleLoading}
                  >
                    Hủy buổi khám
                  </Button>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">
                Không thể hoãn lịch ở trạng thái {getAppointmentStatusLabel(appointment.appointmentStatus).toLowerCase()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        appointment={{
          id: appointment.id,
          date: appointment.date,
          startTime: appointment.startTime,
          consultationFee: appointment.consultationFee,
          doctorName: appointment.doctorName,
          specialization: appointment.specialization,
        }}
        availableTimeSlots={availableTimeSlots}
        onSubmit={handleReschedule}
      />
    </>
  );
};

export default AppointmentCard;
