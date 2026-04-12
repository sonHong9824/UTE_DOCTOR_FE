import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimeSlotDto } from '@/types/timeslot.dto';
import { AlertCircle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';

interface RescheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: {
        id: string;
        date: string;
        startTime: string;
        consultationFee: number;
        doctorName: string;
        specialization: string;
    };
    availableTimeSlots: TimeSlotDto[];
    onSubmit: (appointmentId: string, newDate: string, newTimeSlotId: string, reason?: string) => Promise<void>;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
    isOpen,
    onClose,
    appointment,
    availableTimeSlots,
    onSubmit,
}) => {
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const refundAmount = Math.ceil(appointment.consultationFee * 0.8);

    const handleSubmit = async () => {
        if (!selectedTimeSlot) {
            setError('Vui lòng chọn khung giờ mới');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const selectedSlot = availableTimeSlots.find((slot) => slot.id === selectedTimeSlot);
            if (!selectedSlot) {
                throw new Error('Khung giờ không hợp lệ');
            }

            // Use appointment's current date as the new date (typically time slots are for the same date)
            await onSubmit(appointment.id, appointment.date, selectedTimeSlot, reason);
            setSuccess(true);

            // Reset form
            setTimeout(() => {
                setSelectedTimeSlot('');
                setReason('');
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Lỗi khi hoãn lịch hẹn');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Hoãn lịch hẹn</DialogTitle>
                    <DialogDescription>
                        Chọn khung giờ mới cho lịch hẹn với {appointment.doctorName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Appointment Info */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Lịch hẹn hiện tại</p>
                        <p className="text-sm text-gray-600">
                            {new Date(appointment.date).toLocaleDateString('vi-VN')} -{' '}
                            {appointment.startTime}
                        </p>
                        <p className="text-sm text-gray-600">
                            {appointment.doctorName} • {appointment.specialization}
                        </p>
                    </div>

                    {/* Refund Info */}
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Hoàn tiền</p>
                        <p className="text-sm text-blue-700">
                            Bạn sẽ nhận được{' '}
                            <span className="font-semibold">{refundAmount} coins</span> (80% của phí tư vấn)
                        </p>
                    </div>

                    {/* New Time Slot Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="time-slot" className="font-medium">
                            Chọn khung giờ mới *
                        </Label>
                        <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                            <SelectTrigger id="time-slot">
                                <SelectValue placeholder="Chọn khung giờ..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTimeSlots.map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id}>
                                        {slot.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="font-medium">
                            Lý do hoãn (tùy chọn)
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Nhập lý do hoãn lịch..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Hoãn lịch thành công! Coins đã được cộng vào tài khoản.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading || !selectedTimeSlot}>
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận hoãn'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RescheduleAppointmentModal;
