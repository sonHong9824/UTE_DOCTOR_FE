/**
 * Enum cho trạng thái ca làm việc
 */
export enum ShiftStatus {
  AVAILABLE = 'available',
  HAS_CLIENT = 'hasClient',
  COMPLETED = 'completed'
}

/**
 * Enum cho ca làm việc
 */
export enum ShiftPeriod {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening'
}

/**
 * DTO cho thông tin ca làm việc
 */
export interface ShiftDto {
  _id: string;
  doctorId: string;
  patientId: string | null;
  date: string; // Format: YYYY-MM-DD
  shift: ShiftPeriod;
  status: ShiftStatus;
  __v: number;
}

/**
 * DTO cho thống kê ca làm việc
 */
export interface ShiftStatisticsDto {
  totalShifts: number;
  available: number;
  hasClient: number;
  completed: number;
}

/**
 * DTO cho dữ liệu ca làm việc theo tháng
 */
export interface ShiftMonthDataDto {
  month: number;
  year: number;
  statistics: ShiftStatisticsDto;
  shifts: ShiftDto[];
  groupedByDate: Record<string, ShiftDto[]>;
}

/**
 * DTO cho response API
 */
export interface ShiftResponseDto {
  code: string;
  message: string;
  data: ShiftMonthDataDto;
}

/**
 * Type guard để kiểm tra ShiftStatus
 */
export function isValidShiftStatus(status: string): status is ShiftStatus {
  return Object.values(ShiftStatus).includes(status as ShiftStatus);
}

/**
 * Type guard để kiểm tra ShiftPeriod
 */
export function isValidShiftPeriod(period: string): period is ShiftPeriod {
  return Object.values(ShiftPeriod).includes(period as ShiftPeriod);
}

/**
 * Helper function để format date
 */
export function formatShiftDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Helper function để lấy label ca làm việc
 */
export function getShiftLabel(shift: ShiftPeriod): string {
  const labels: Record<ShiftPeriod, string> = {
    [ShiftPeriod.MORNING]: 'Buổi sáng',
    [ShiftPeriod.AFTERNOON]: 'Buổi chiều',
    [ShiftPeriod.EVENING]: 'Buổi tối'
  };
  return labels[shift];
}

/**
 * Helper function để lấy label trạng thái
 */
export function getStatusLabel(status: ShiftStatus): string {
  const labels: Record<ShiftStatus, string> = {
    [ShiftStatus.AVAILABLE]: 'Còn trống',
    [ShiftStatus.HAS_CLIENT]: 'Đã có khách',
    [ShiftStatus.COMPLETED]: 'Đã hoàn thành'
  };
  return labels[status];
}

/**
 * Helper function để lấy màu trạng thái
 */
export function getStatusColor(status: ShiftStatus): string {
  const colors: Record<ShiftStatus, string> = {
    [ShiftStatus.AVAILABLE]: 'bg-green-100 text-green-800',
    [ShiftStatus.HAS_CLIENT]: 'bg-blue-100 text-blue-800',
    [ShiftStatus.COMPLETED]: 'bg-gray-100 text-gray-800'
  };
  return colors[status];
}