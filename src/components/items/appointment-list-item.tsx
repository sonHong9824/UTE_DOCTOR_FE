export * from "@/features/appointment/components/AppointmentListItem";
export { default } from "@/features/appointment/components/AppointmentListItem";

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
  };
  onView?: (appointmentId: string) => void;
  onReschedule?: (appointmentId: string) => void;
  compact?: boolean;
}

const getStatusColor = (status: AppointmentStatus) => {
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

export const AppointmentListItem: React.FC<AppointmentListItemProps> = ({
  appointment,
  onView,
  onReschedule,
  compact = false,
}) => {
  const appointmentDate = new Date(appointment.date);
  const isUpcoming = appointmentDate > new Date();
  const canReschedule =
    isUpcoming &&
    (appointment.appointmentStatus === AppointmentStatus.PENDING ||
      appointment.appointmentStatus === AppointmentStatus.CONFIRMED);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{appointment.doctorName}</span>
            <Badge variant="outline" className={getStatusColor(appointment.appointmentStatus)}>
              {getStatusLabel(appointment.appointmentStatus)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {appointmentDate.toLocaleDateString('vi-VN')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {appointment.startTime}
            </span>
          </div>
        </div>
        {onView && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(appointment.id)}
            className="ml-2"
          >
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
          {/* Doctor Info */}
          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <User className="h-3 w-3" />
              Bác sĩ
            </p>
            <p className="font-medium text-sm">{appointment.doctorName}</p>
            <p className="text-xs text-gray-600">{appointment.specialization}</p>
          </div>

          {/* Date & Time */}
          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Ngày khám
            </p>
            <p className="font-medium text-sm">
              {appointmentDate.toLocaleDateString('vi-VN')}
            </p>
            <p className="text-xs text-gray-600">
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>

          {/* Fee & Coins */}
          <div>
            <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Coins className="h-3 w-3" />
              Phí / Coin
            </p>
            <p className="font-medium text-sm">
              {appointment.consultationFee.toLocaleString('vi-VN')} VNĐ
            </p>
            {appointment.appointmentStatus === AppointmentStatus.RESCHEDULED && (
              <p className="text-xs text-green-600">
                Nhận {Math.ceil(appointment.consultationFee * 0.8).toLocaleString('vi-VN')} coin
              </p>
            )}
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-end justify-between">
            <Badge className={getStatusColor(appointment.appointmentStatus)}>
              {getStatusLabel(appointment.appointmentStatus)}
            </Badge>
            <div className="flex gap-2 mt-2">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(appointment.id)}
                >
                  Chi tiết
                </Button>
              )}
              {canReschedule && onReschedule && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReschedule(appointment.id)}
                >
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
