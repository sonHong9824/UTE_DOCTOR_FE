import { getDoctorBySpecialty, getSpecialties } from '@/apis/appointment/appointment.api';
import { gettimeslot } from '@/apis/timeslot/timeslot.api';
import { DatePicker } from '@/components/ui/date-picker';
import { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";

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
  specialtyId: string;
};

type AppointmentBookingDto = {
  hospitalName: string;
  specialty: string | null;
  date: Date;
  timeSlotId: string;
  doctor: DoctorDto | null;
  serviceType: string;
  paymentMethod: string;
  amount?: number;
  patientEmail: string;
};

// Mock data từ MongoDB
// const mockTimeSlots: TimeSlot[] = [
//   { _id: "67890abc001", start: "07:30", end: "08:30", label: "Ca sáng 1" },
//   { _id: "67890abc002", start: "08:30", end: "09:30", label: "Ca sáng 2" },
//   { _id: "67890abc003", start: "09:30", end: "10:30", label: "Ca sáng 3" },
//   { _id: "67890abc004", start: "10:30", end: "11:30", label: "Ca sáng 4" },
//   { _id: "67890abc005", start: "13:30", end: "14:30", label: "Ca trưa 1" },
//   { _id: "67890abc006", start: "14:30", end: "15:30", label: "Ca trưa 2" },
//   { _id: "67890abc007", start: "18:00", end: "19:00", label: "Ca ngoài giờ 1" },
//   { _id: "67890abc008", start: "19:00", end: "20:00", label: "Ca ngoài giờ 2" },
//   { _id: "67890abc009", start: "20:00", end: "21:00", label: "Ca ngoài giờ 3" }
// ];

export default function AppointmentForm() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // Lazy search states for doctor
  const [doctorSearchTerm, setDoctorSearchTerm] = useState(""); // input text
  const [doctorSuggestions, setDoctorSuggestions] = useState<Doctor[]>([]); // suggestions list
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDto | null>(null); // doctor object đã chọn
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [hasDoctor, setHasDoctor] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Lazy search for specialties for specialty
  const [specialties, setSpecialties] = useState<{_id: string, name: string}[]>([]);
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState("");
  const [specialtySuggestions, setSpecialtySuggestions] = useState<{_id: string, name:string }[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<any | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false); // Prevent suggestion form double cliking


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

  // const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load mock data
  useEffect(() => {
  const fetchData = async () => {
    try {
      const timeSlotRes = await gettimeslot();
      if (timeSlotRes?.data) {
        setTimeSlots(timeSlotRes.data);

        // Gán mặc định slot đầu tiên
        if (timeSlotRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            timeSlotId: timeSlotRes.data[0]._id,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load timeslots:", err);
    }

    const email = localStorage.getItem("email");
    if (email) {
      const res = await getSpecialties(email);
      setSpecialties(res!.data);
    }
  };

  fetchData();
}, []);

  // Filter doctors by specialty
  useEffect(() => {
    if (formData.specialty) {
      const filtered = doctors.filter(doc => doc.specialtyId === formData.specialty);
      setFilteredDoctors(filtered);

      // Reset doctor selection when specialty changes
      // setSelectedDoctorId('');
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

  // ----- Debounce search specialties -----
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!specialtySearchTerm) {
        setSpecialtySuggestions([]);
        return;
      }

      const filtered = specialties.filter(spec =>
        spec.name.toLowerCase().includes(specialtySearchTerm.toLowerCase())
      );
      setSpecialtySuggestions(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [specialtySearchTerm]);

  // ----- Handle select -----
  const handleSelectSpecialty = (spec: any) => {
    setSelectedSpecialty(spec);
    setFormData(prev => ({ ...prev, specialty: spec._id }));
    setSpecialtySearchTerm(spec.name);
    setSpecialtySuggestions([]); // hide dropdown
    setShowSuggestions(false);
  };

  // Khi user gõ search term
  const handleDoctorSearch = (value: string) => {
    setDoctorSearchTerm(value);

    if (!value) {
      setDoctorSuggestions([]);
      return;
    }
  };

  // Debounce logic for doctor
  // useEffect(() => {
  //   if (!doctorSearchTerm) {
  //     setDoctorSuggestions([]);
  //     return;
  //   }
  //   console.log('🔍 Searching for doctors with term:', doctorSearchTerm);
  //   const timeout = setTimeout(() => {
  //     const suggestions = filteredDoctors.filter(doc =>
  //       doc.name.toLowerCase().includes(doctorSearchTerm.toLowerCase())
  //     );
  //     setDoctorSuggestions(suggestions);
  //   }, 300); // delay 300ms

  //   return () => clearTimeout(timeout);
  // }, [doctorSearchTerm, filteredDoctors]);
  // Gọi API khi search term hoặc chuyên khoa thay đổi
    useEffect(() => {
      if (!doctorSearchTerm && !selectedSpecialty) {
        setDoctorSuggestions([]);
        return;
      }

      const timeout = setTimeout(async () => {
        try {
          const res = await getDoctorBySpecialty({
            specialtyId: selectedSpecialty?._id || "",
            keyword: doctorSearchTerm || "",
          });

          setDoctorSuggestions(res?.data || []);
        } catch (err) {
          console.error("Error fetching doctors:", err);
        }
      }, 300); // debounce 300ms

      return () => clearTimeout(timeout);
    }, [doctorSearchTerm, selectedSpecialty]);

  // Khi chọn một bác sĩ từ suggestion
  const handleDoctorSelect = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setDoctorSearchTerm(doc.name);
    //setDoctorSuggestions([]);
    // setSelectedDoctorId(doc.id);

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

  function handleSpecialtySearch(value: string): void {
    console.log("Keyword: ", value)
    console.log("Suggestion: ", specialtySuggestions)
    setSpecialtySearchTerm(value || '');

    if (!value) {
      setSpecialtySuggestions([]);
      setSelectedSpecialty(null);
      return;
    }
  }

  const handleSpecialtyBlur = () => {
    if (!selectedSpecialty || selectedSpecialty.name !== specialtySearchTerm) {
      setSelectedSpecialty(null);
      setFormData(prev => ({ ...prev, specialty: null }));
    }
  };

  const handleDoctorBlur = () => {
    if (!selectedDoctor || selectedDoctor.name !== doctorSearchTerm) {
      setSelectedDoctor(null);
      setFormData(prev => ({ ...prev, doctor: null }));
    }
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
                    value={formData.hospitalName}
                    disabled={true}
                    onChange={(e) => handleChange('hospitalName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>


                  {/* Lazy search specialty dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên Khoa *</label>
                    
                    <input
                      type="text"
                      value={specialtySearchTerm}
                      onChange={(e) => {
                        handleSpecialtySearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onBlur={handleSpecialtyBlur}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Nhập để tìm chuyên khoa..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {/* Dropdown suggestion */}
                   {showSuggestions && specialtySuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full border border-gray-300 bg-white rounded-lg mt-1 max-h-60 overflow-y-auto shadow-md">
                      {specialtySuggestions.map((spec) => (
                        <li
                          key={spec._id}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                          onClick={() => handleSelectSpecialty(spec)}
                        >
                          {spec.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  </div>
                
              </div>
            </div>

            {/* Thông tin bác sĩ */}
            <div className="bg-purple-50 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">👨‍⚕️ Thông tin bác sĩ (Nếu để trống, tiếp tân sẽ chọn giúp bạn!)</h3>
              </div>

              
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm bác sĩ *</label>
                  <input
                    type="text"
                    value={doctorSearchTerm}
                    onFocus={() => setIsFocused(true)}
                      onBlur={() => { 
                        setTimeout(() => setIsFocused(false), 150);
                        handleDoctorBlur();
                      }}
                    onChange={(e) => handleDoctorSearch(e.target.value)}
                    placeholder="Gõ tên bác sĩ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  {/* Suggestion dropdown */}
                  {doctorSuggestions.length > 0 && isFocused && (
                    <ul className="border border-gray-300 mt-1 rounded-lg max-h-60 overflow-y-auto bg-white shadow-md">
                      {doctorSuggestions.map((doc) => (
                        <li
                          key={doc.id}
                          className="px-4 py-2 cursor-pointer hover:bg-purple-100"
                          onClick={() => {handleDoctorSelect(doc);
                                          setIsFocused(false); 
                                          }
                          }
                        >
                          {doc.name}
                        </li>
                      ))}
                    </ul>
                  )}

                  {doctorSuggestions.length === 0 && doctorSearchTerm && (
                    <p className="text-sm text-amber-600 mt-2">⚠️ Không tìm thấy bác sĩ phù hợp</p>
                  )}
                </div>
             
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