export * from "@/features/appointment/components/AppointmentDetailModal";
export { default } from "@/features/appointment/components/AppointmentDetailModal";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    appointmentStatus: AppointmentStatus;
    consultationFee: number;
    doctorName: string;
    specialization: string;
    diagnosis?: string;
    note?: string;
    prescriptions?: Array<{
      medicineId: string;
      name: string;
      quantity: number;
      note?: string;
    }>;
  } | null;
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

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  if (!appointment) return null;

  const refundAmount = Math.ceil(appointment.consultationFee * 0.8);
  const isRescheduled = appointment.appointmentStatus === AppointmentStatus.RESCHEDULED;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết lịch hẹn</span>
            <Badge className={getStatusBadgeColor(appointment.appointmentStatus)}>
              {getStatusLabel(appointment.appointmentStatus)}
            </Badge>
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về lịch hẹn khám bệnh</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Thông tin</TabsTrigger>
            <TabsTrigger value="payment">Thanh toán</TabsTrigger>
            {appointment.diagnosis && <TabsTrigger value="result">Kết quả</TabsTrigger>}
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            {/* Doctor Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Thông tin bác sĩ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Bác sĩ</p>
                  <p className="font-medium">{appointment.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Chuyên khoa</p>
                  <p className="font-medium">{appointment.specialization}</p>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Thời gian khám
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Ngày</p>
                    <p className="font-medium">
                      {new Date(appointment.date).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Giờ
                    </p>
                    <p className="font-medium">
                      {appointment.startTime} - {appointment.endTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appointment Note */}
            {appointment.note && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{appointment.note}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payment Information */}
          <TabsContent value="payment" className="space-y-4">
            {/* Fee Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Phí tư vấn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center py-2 border-b mb-3">
                  <span className="text-gray-700">Phí khám</span>
                  <span className="font-medium">{appointment.consultationFee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Tổng cộng</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {appointment.consultationFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Refund Alert */}
            {isRescheduled && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <p className="font-medium mb-1">Hoàn tiền Coin</p>
                  <p>Bạn đã nhận được {refundAmount.toLocaleString('vi-VN')} Coin (80% phí tư vấn)</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hình thức thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-600" />
                <span className="font-medium">
                  {appointment.appointmentStatus === AppointmentStatus.COMPLETED
                    ? 'Đã thanh toán'
                    : 'Chờ thanh toán'}
                </span>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          {appointment.diagnosis && (
            <TabsContent value="result" className="space-y-4">
              {/* Diagnosis */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Chẩn đoán</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{appointment.diagnosis}</p>
                </CardContent>
              </Card>

              {/* Additional Note */}
              {appointment.note && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Lưu ý thêm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{appointment.note}</p>
                  </CardContent>
                </Card>
              )}

              {/* Prescriptions */}
              {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Đơn thuốc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {appointment.prescriptions.map((medicine, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="font-medium text-sm">{medicine.name}</p>
                            <p className="text-xs text-gray-600">SL: {medicine.quantity}</p>
                            {medicine.note && (
                              <p className="text-xs text-gray-600 mt-1">Ghi chú: {medicine.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Close Button */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailModal;
