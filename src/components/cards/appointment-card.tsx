export * from "@/features/appointment/components/AppointmentCard";
export { default } from "@/features/appointment/components/AppointmentCard";

interface AppointmentCardProps {
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    appointmentStatus: AppointmentStatus;
    consultationFee: number;
    doctorName: string;
    specialization: string;
    doctorId: string;
  };
  availableTimeSlots?: TimeSlotDto[];
  onRescheduleSuccess?: () => void;
  onCancelSuccess?: () => void;
}

const getStatusBadgeColor = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case AppointmentStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800';
    case AppointmentStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case AppointmentStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    case AppointmentStatus.RESCHEDULED:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'Chờ xác nhận';
    case AppointmentStatus.CONFIRMED:
      return 'Đã xác nhận';
    case AppointmentStatus.COMPLETED:
      return 'Đã hoàn thành';
    case AppointmentStatus.CANCELLED:
      return 'Đã hủy';
    case AppointmentStatus.RESCHEDULED:
      return 'Đã hoãn';
    default:
      return status;
  }
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  availableTimeSlots = [],
  onRescheduleSuccess,
  onCancelSuccess,
}) => {
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canReschedule =
    appointment.appointmentStatus === AppointmentStatus.PENDING ||
    appointment.appointmentStatus === AppointmentStatus.CONFIRMED;

  const canCancel =
    appointment.appointmentStatus === AppointmentStatus.PENDING ||
    appointment.appointmentStatus === AppointmentStatus.CONFIRMED;

   console.log("Appointment status in AppointmentCard:", appointment.appointmentStatus);    

  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();

  const handleReschedule = async (
    appointmentId: string,
    newDate: string,
    newTimeSlotId: string,
    reason?: string
  ) => {
    setIsRescheduling(true);
    try {
      await rescheduleAppointment({
        appointmentId,
        newDate,
        newTimeSlotId,
        reason,
      });

      setIsRescheduleModalOpen(false);
      toast.success('Hoãn lịch hẹn thành công');
      onRescheduleSuccess?.();
    } catch (error) {
      console.error('Failed to reschedule:', error);
      toast.error('Lỗi khi hoãn lịch hẹn');
      throw error;
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy buổi khám này?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const patientId = localStorage.getItem("patientId") || undefined;
      await cancelAppointment(appointment.id, patientId);
      toast.success('Hủy buổi khám thành công');
      onCancelSuccess?.();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Lỗi khi hủy buổi khám');
    } finally {
      setIsCancelling(false);
    }
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
            <Badge className={getStatusBadgeColor(appointment.appointmentStatus)}>
              {getStatusLabel(appointment.appointmentStatus)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>
                {appointmentDate.toLocaleDateString('vi-VN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
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

          {/* Consultation Fee */}
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm text-gray-600">Phí tư vấn</p>
            <p className="text-lg font-semibold text-gray-900">
              {appointment.consultationFee.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          {/* Upcoming Warning */}
          {!isUpcoming && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              Lịch hẹn này đã qua
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {canReschedule && isUpcoming ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  disabled={isRescheduling || isCancelling || availableTimeSlots.length === 0}
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
                    disabled={isCancelling || isRescheduling}
                  >
                    Hủy buổi khám
                  </Button>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">
                Không thể hoãn lịch ở trạng thái {getStatusLabel(appointment.appointmentStatus).toLowerCase()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Modal */}
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
