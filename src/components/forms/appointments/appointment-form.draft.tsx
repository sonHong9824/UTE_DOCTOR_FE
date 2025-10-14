
import { getAppointmentFieldsData } from '@/apis/appointment/appointment.api';
import { DatePicker } from '@/components/ui/date-picker';
import { SocketEventsEnum } from '@/enum/socket-events.enum';
import { createAppointmentSocket, createFetchDataFieldsAppointmentSocket } from '@/services/socket/socket-client';
import { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { email } from 'zod';

type DoctorDto = {
  id: string;
  name: string;
  email: string;
};

type TimeSlot = {
  _id: string;
  start: string;
  end: string;
  label: string;
};

type Doctor = {
  id: string;
  name: string;
  email: string;
  specialty: string;
};

type AppointmentBookingDto = {
  hospitalName: string;
  specialty?: string;
  date: Date;
  timeSlotId: string;
  doctor: DoctorDto | null;
  serviceType: string;
  paymentMethod: string;
  amount?: number;
  patientEmail: string;
};

// Mock data từ MongoDB
const mockTimeSlots: TimeSlot[] = [
  { _id: "67890abc001", start: "07:30", end: "08:30", label: "Ca sáng 1" },
  { _id: "67890abc002", start: "08:30", end: "09:30", label: "Ca sáng 2" },
  { _id: "67890abc003", start: "09:30", end: "10:30", label: "Ca sáng 3" },
  { _id: "67890abc004", start: "10:30", end: "11:30", label: "Ca sáng 4" },
  { _id: "67890abc005", start: "13:30", end: "14:30", label: "Ca trưa 1" },
  { _id: "67890abc006", start: "14:30", end: "15:30", label: "Ca trưa 2" },
  { _id: "67890abc007", start: "18:00", end: "19:00", label: "Ca ngoài giờ 1" },
  { _id: "67890abc008", start: "19:00", end: "20:00", label: "Ca ngoài giờ 2" },
  { _id: "67890abc009", start: "20:00", end: "21:00", label: "Ca ngoài giờ 3" }
];

const mockSpecialties = [
  "Tim mạch",
  "Thần kinh",
  "Nội tiết",
  "Tiêu hóa",
  "Hô hấp",
  "Thận - Tiết niệu",
  "Da liễu",
  "Mắt",
  "Tai Mũi Họng",
  "Răng Hàm Mặt",
  "Sản phụ khoa",
  "Nhi khoa",
  "Chấn thương chỉnh hình",
  "Phẫu thuật tổng hợp"
];

const mockDoctors: Doctor[] = [
  { id: "DOC001", name: "BS. Nguyễn Văn An", email: "nvan@hospital.com", specialty: "Tim mạch" },
  { id: "DOC002", name: "BS. Trần Thị Bình", email: "ttbinh@hospital.com", specialty: "Tim mạch" },
  { id: "DOC003", name: "BS. Lê Minh Cường", email: "lmcuong@hospital.com", specialty: "Thần kinh" },
  { id: "DOC004", name: "BS. Phạm Thu Dung", email: "ptdung@hospital.com", specialty: "Thần kinh" },
  { id: "DOC005", name: "BS. Hoàng Văn Em", email: "hvem@hospital.com", specialty: "Nội tiết" },
  { id: "DOC006", name: "BS. Võ Thị Phượng", email: "vtphuong@hospital.com", specialty: "Nội tiết" },
  { id: "DOC007", name: "BS. Đặng Quốc Gia", email: "dqgia@hospital.com", specialty: "Tiêu hóa" },
  { id: "DOC008", name: "BS. Ngô Thị Hằng", email: "nthang@hospital.com", specialty: "Tiêu hóa" },
  { id: "DOC009", name: "BS. Bùi Văn Hùng", email: "bvhung@hospital.com", specialty: "Hô hấp" },
  { id: "DOC010", name: "BS. Lý Thị Kim", email: "ltkim@hospital.com", specialty: "Hô hấp" },
  { id: "DOC011", name: "BS. Trương Văn Long", email: "tvlong@hospital.com", specialty: "Thận - Tiết niệu" },
  { id: "DOC012", name: "BS. Đinh Thị Mai", email: "dtmai@hospital.com", specialty: "Da liễu" },
  { id: "DOC013", name: "BS. Dương Văn Nam", email: "dvnam@hospital.com", specialty: "Mắt" },
  { id: "DOC014", name: "BS. Phan Thị Oanh", email: "ptoanh@hospital.com", specialty: "Tai Mũi Họng" },
  { id: "DOC015", name: "BS. Huỳnh Văn Phúc", email: "hvphuc@hospital.com", specialty: "Răng Hàm Mặt" },
  { id: "DOC016", name: "BS. Mai Thị Quỳnh", email: "mtquynh@hospital.com", specialty: "Sản phụ khoa" },
  { id: "DOC017", name: "BS. Lưu Văn Sơn", email: "lvson@hospital.com", specialty: "Nhi khoa" },
  { id: "DOC018", name: "BS. Tô Thị Tâm", email: "tttam@hospital.com", specialty: "Nhi khoa" },
  { id: "DOC019", name: "BS. Cao Văn Tùng", email: "cvtung@hospital.com", specialty: "Chấn thương chỉnh hình" },
  { id: "DOC020", name: "BS. Đỗ Thị Uyên", email: "dtuyen@hospital.com", specialty: "Phẫu thuật tổng hợp" }
];

export default function AppointmentForm() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [specialties, setSpecialties] = useState<{_id: string, name: string, descripton: string}[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [hasDoctor, setHasDoctor] = useState(false);

  // Lazy search states
  const [doctorSearchTerm, setDoctorSearchTerm] = useState(""); // input text
  const [doctorSuggestions, setDoctorSuggestions] = useState<Doctor[]>([]); // suggestions list
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | null>(null); // doctor object đã chọn

  const [formData, setFormData] = useState<AppointmentBookingDto>({
    date: new Date(),
    hospitalName: 'Bệnh viện Đa khoa Tâm Đức',
    specialty: '',
    timeSlotId: '',
    doctor: null,
    serviceType: 'KHAM_DICH_VU',
    paymentMethod: 'ONLINE',
    amount: 100000,
    patientEmail: 'td13052004@gmail.com'
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load mock data
  useEffect(() => {
    setTimeSlots(mockTimeSlots);
    // setSpecialties(mockSpecialties);
    setDoctors(mockDoctors);

    const appointmentFieldsDataSocket = createFetchDataFieldsAppointmentSocket();
    appointmentFieldsDataSocket.on(
      SocketEventsEnum.HOSPITAL_SPECIALTIES_FETCHED,
      (data: any) => {
        console.log("🏥 Received specialties from server:", data);
        // Cập nhật state cho form
          if (data.specialties && data.specialties.length > 0) {
            setSpecialties(data.specialties);
            setFormData(prev => ({ ...prev, specialty: data.specialties[0] }));
      }
      }
    );
    appointmentFieldsDataSocket.once(SocketEventsEnum.ROOM_JOINED, (data: any) => {
      console.log("✅ Joined room successfully:", data);
      getAppointmentFieldsData(localStorage.getItem('email')!.toString()); // Call HTTP to init connection
    });

    appointmentFieldsDataSocket.emit(SocketEventsEnum.JOIN_ROOM, { email: localStorage.getItem('email') || 'guest' });


    if (mockTimeSlots.length > 0) {
      setFormData(prev => ({ ...prev, timeSlotId: mockTimeSlots[0]._id }));
    }
    // if (mockSpecialties.length > 0) {
    //   setFormData(prev => ({ ...prev, specialty: mockSpecialties[0] }));
    // }

    return () => {
      appointmentFieldsDataSocket.off(SocketEventsEnum.HOSPITAL_SPECIALTIES_FETCHED);
      appointmentFieldsDataSocket.off(SocketEventsEnum.ROOM_JOINED);
    };
  }, []);

  // Filter doctors by specialty
  useEffect(() => {
    if (formData.specialty) {
      const filtered = doctors.filter(doc => doc.specialty === formData.specialty);
      setFilteredDoctors(filtered);

      // Reset doctor selection when specialty changes
      setSelectedDoctorId('');
      setDoctorSearchTerm('');
      setDoctorSuggestions([]);
      setSelectedDoctor(null);
      setFormData(prev => ({ ...prev, doctor: null }));
      setHasDoctor(false);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [formData.specialty, doctors]);

  const handleChange = (name: string, value: string | number | Date | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle chọn bác sĩ
  const toggleDoctor = () => {
    const newHasDoctor = !hasDoctor;
    setHasDoctor(newHasDoctor);

    if (!newHasDoctor) {
      // reset doctor selection
      setSelectedDoctor(null);
      setDoctorSearchTerm('');
      setDoctorSuggestions([]);
      setSelectedDoctorId('');
      setFormData(prev => ({ ...prev, doctor: null }));
    }
  };

  // Khi user gõ search term
  const handleDoctorSearch = (value: string) => {
    setDoctorSearchTerm(value);

    if (!value) {
      setDoctorSuggestions([]);
      return;
    }

    // // Filter từ doctors dựa trên search term
    // const suggestions = filteredDoctors.filter(doc =>
    //   doc.name.toLowerCase().includes(value.toLowerCase())
    // );
    // setDoctorSuggestions(suggestions);
  };

  // Debounce logic
  useEffect(() => {
    if (!doctorSearchTerm) {
      setDoctorSuggestions([]);
      return;
    }
    console.log('🔍 Searching for doctors with term:', doctorSearchTerm);
    const timeout = setTimeout(() => {
      const suggestions = filteredDoctors.filter(doc =>
        doc.name.toLowerCase().includes(doctorSearchTerm.toLowerCase())
      );
      setDoctorSuggestions(suggestions);
    }, 300); // delay 300ms

    return () => clearTimeout(timeout);
  }, [doctorSearchTerm, filteredDoctors]);

  // Khi chọn một bác sĩ từ suggestion
  const handleDoctorSelect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setDoctorSearchTerm(doc.name);
    setDoctorSuggestions([]);
    setSelectedDoctorId(doc.id);

    // Update formData
    setFormData(prev => ({
      ...prev,
      doctor: {
        id: doc.id,
        name: doc.name,
        email: doc.email
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);

    console.log('📤 Submitting appointment:', formData);

    try {
      const res = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setResponse({ success: res.ok, data });
      console.log('✅ Response:', data);
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

  const getTimeSlotDisplay = (slot: TimeSlot) => `${slot.label} (${slot.start} - ${slot.end})`;

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
                    value={formData.hospitalName}
                    disabled={true}
                    onChange={(e) => handleChange('hospitalName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên Khoa *</label>
                  <select
                    value={formData.specialty || ''}
                    onChange={(e) => handleChange('specialty', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn chuyên khoa --</option>
                    {specialties.map(spec => (
                      <option key={spec._id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Thông tin bác sĩ */}
            <div className="bg-purple-50 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">👨‍⚕️ Thông tin bác sĩ</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDoctor}
                    onChange={toggleDoctor}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Chọn bác sĩ cụ thể</span>
                </label>
              </div>

              {hasDoctor ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm bác sĩ *</label>
                  <input
                    type="text"
                    value={doctorSearchTerm}
                    onChange={(e) => handleDoctorSearch(e.target.value)}
                    placeholder="Gõ tên bác sĩ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  {/* Suggestion dropdown */}
                  {doctorSuggestions.length > 0 && (
                    <ul className="border border-gray-300 mt-1 rounded-lg max-h-60 overflow-y-auto bg-white shadow-md">
                      {doctorSuggestions.map((doc) => (
                        <li
                          key={doc.id}
                          className="px-4 py-2 cursor-pointer hover:bg-purple-100"
                          onClick={() => handleDoctorSelect(doc)}
                        >
                          {doc.name} - {doc.specialty}
                        </li>
                      ))}
                    </ul>
                  )}

                  {doctorSuggestions.length === 0 && doctorSearchTerm && (
                    <p className="text-sm text-amber-600 mt-2">⚠️ Không tìm thấy bác sĩ phù hợp</p>
                  )}

                  {/* Selected doctor info */}
                  {selectedDoctor && (
                    <div className="mt-3 p-3 bg-purple-100 rounded-lg text-sm space-y-1">
                      <p className="text-gray-700"><strong>ID:</strong> {selectedDoctor.id}</p>
                      <p className="text-gray-700"><strong>Họ tên:</strong> {selectedDoctor.name}</p>
                      <p className="text-gray-700"><strong>Email:</strong> {selectedDoctor.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">👤 Không chọn bác sĩ cụ thể (doctor = null)</p>
                  <p className="text-xs mt-1">Hệ thống sẽ tự động phân bổ bác sĩ</p>
                </div>
              )}
            </div>

            {/* Thông tin lịch hẹn */}
            <div className="bg-green-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-4">📅 Thông tin lịch hẹn</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chọn ngày và giờ cụ thể */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày và giờ hẹn *</label>
                  <DatePicker
                    value={formData.date ?? undefined}
                    onChange={(date) =>
                    setFormData((prev) => {
                      if (!date) {
                        alert("Vui lòng chọn ngày hợp lệ!");
                        return prev;
                      }
                      return { ...prev, date };
                    })
                  }
                    limitDays={30}
                  />
                  
                </div>

                {/* Chọn khung giờ khám */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khung Giờ Khám *</label>
                  <select
                    value={formData.timeSlotId}
                    onChange={(e) => handleChange('timeSlotId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn khung giờ --</option>
                    {timeSlots.map(slot => (
                      <option key={slot._id} value={slot._id}>
                        {getTimeSlotDisplay(slot)}
                      </option>
                    ))}
                  </select>
                  {formData.timeSlotId && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">ID: {formData.timeSlotId}</p>
                  )}
                </div>

                {/* Chọn loại dịch vụ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại Dịch Vụ (ServiceType) *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => handleChange('serviceType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="KHAM_DICH_VU">Khám dịch vụ</option>
                    <option value="KHAM_BHYT">Khám BHYT</option>
                    <option value="KHAM_TONG_QUAT">Khám tổng quát</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div className="bg-orange-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">💳 Thông tin thanh toán</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương Thức Thanh Toán *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
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
                    value={formData.amount || ''}
                    onChange={(e) => handleChange('amount', e.target.value ? Number(e.target.value) : 0)}
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
              disabled={loading || !formData.timeSlotId}
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