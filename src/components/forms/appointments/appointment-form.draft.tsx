import { bookAppointment } from '@/apis/appointment/appointment.api';
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { createAppointmentSocket } from '@/services/socket/socket-client';
import { useState } from 'react';

type BacSiDto = {
  id: string;
  name: string;
  email: string;
};

type AppointmentBookingDto = {
  tenBenhvien: string;
  chuyenkhoa?: string;
  khungGio: string;
  bacSi: BacSiDto;
  dichVuKham: string;
  hinhThucThanhToan: 'ONLINE' | 'OFFLINE';
  amount?: string;
  patientEmail: string;
};

export default function AppointmentForm() {
  const [formData, setFormData] = useState<AppointmentBookingDto>({
    tenBenhvien: 'Bệnh viện Đa khoa Tâm Đức',
    chuyenkhoa: 'Tim mạch',
    khungGio: 'KHUNG_GIO_1',
    bacSi: {
      id: 'BS123',
      name: 'BS. Nguyễn Văn An',
      email: 'bacsi@gmail.com'
    },
    dichVuKham: 'KHAM_DICH_DU',
    hinhThucThanhToan: 'ONLINE',
    amount: '100000',
    patientEmail: 'td13052004@gmail.com'
  });

  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    if (name.startsWith('bacSi.')) {
      setFormData(prev => ({
        ...prev,
        bacSi: { ...prev.bacSi, [name.split('.')[1]]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);

    console.log('📤 Submitting appointment:', formData);

    try {
      // Init websocket for response
      const appointmentSocket = createAppointmentSocket();

      appointmentSocket.once(SocketEventsEnum.APPOINTMENT_COMPLETED, (data: any) => {
        console.log("Appointment completed received:", data);
        setResponse({ success: data.code, data: data });
      });

      appointmentSocket.on(SocketEventsEnum.ROOM_JOINED, (data: any) => {
        console.log("Room joined:", data);
        bookAppointment(formData);
      });
      
      appointmentSocket.emitSafe(SocketEventsEnum.JOIN_ROOM, { email: formData.patientEmail });
      // setResponse({ success: res?.code, data: res?.data });
      // console.log('✅ Response:', res);
    } catch (error: any) {
      setResponse({ success: false, error: error.message });
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    alert('✅ JSON copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">🏥 Đặt Lịch Khám Bệnh</h2>
            <button
              onClick={copyJSON}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
            >
              📋 Copy JSON
            </button>
          </div>

          <div className="space-y-6">
            {/* Thông tin bệnh viện */}
            <div className="bg-blue-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🏥 Thông tin bệnh viện</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên Bệnh viện *</label>
                  <input
                    value={formData.tenBenhvien}
                    onChange={(e) => handleChange('tenBenhvien', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên Khoa</label>
                  <input
                    value={formData.chuyenkhoa}
                    onChange={(e) => handleChange('chuyenkhoa', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin lịch hẹn */}
            <div className="bg-green-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📅 Thông tin lịch hẹn</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khung Giờ *</label>
                  <select
                    value={formData.khungGio}
                    onChange={(e) => handleChange('khungGio', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="KHUNG_GIO_1">Khung giờ 1 (7:00 - 9:00)</option>
                    <option value="KHUNG_GIO_2">Khung giờ 2 (9:00 - 11:00)</option>
                    <option value="KHUNG_GIO_3">Khung giờ 3 (13:00 - 15:00)</option>
                    <option value="KHUNG_GIO_4">Khung giờ 4 (15:00 - 17:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dịch Vụ Khám *</label>
                  <select
                    value={formData.dichVuKham}
                    onChange={(e) => handleChange('dichVuKham', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="KHAM_DICH_DU">Khám dịch vụ</option>
                    <option value="KHAM_BHYT">Khám BHYT</option>
                    <option value="KHAM_TONG_QUAT">Khám tổng quát</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thông tin bác sĩ */}
            <div className="bg-purple-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">👨‍⚕️ Thông tin bác sĩ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Bác Sĩ *</label>
                  <input
                    value={formData.bacSi.id}
                    onChange={(e) => handleChange('bacSi.id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên Bác Sĩ *</label>
                  <input
                    value={formData.bacSi.name}
                    onChange={(e) => handleChange('bacSi.name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Bác Sĩ *</label>
                  <input
                    type="email"
                    value={formData.bacSi.email}
                    onChange={(e) => handleChange('bacSi.email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div className="bg-orange-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">💳 Thông tin thanh toán</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình Thức *</label>
                  <select
                    value={formData.hinhThucThanhToan}
                    onChange={(e) => handleChange('hinhThucThanhToan', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="ONLINE">💳 Thanh toán online</option>
                    <option value="OFFLINE">💵 Thanh toán tại bệnh viện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Bệnh Nhân *</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => handleChange('patientEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Đang xử lý...' : '✅ Đặt Lịch Khám'}
            </button>
          </div>

          {/* Response Display */}
          {response && (
            <div className={`mt-6 p-4 rounded-xl ${response.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <h3 className="font-semibold mb-2">{response.success ? '✅ Success' : '❌ Error'}</h3>
              <pre className="text-sm overflow-auto">{JSON.stringify(response.data || response.error, null, 2)}</pre>
            </div>
          )}

          {/* JSON Preview */}
          <details className="mt-6">
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
              📄 Preview JSON Payload
            </summary>
            <pre className="mt-3 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}