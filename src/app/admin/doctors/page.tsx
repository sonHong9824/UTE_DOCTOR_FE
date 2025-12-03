"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Stethoscope, 
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { createDoctor } from '@/apis/admin/admin.api';
import { getSpecialties } from '@/apis/appointment/appointment.api';

// InputField component - moved outside to prevent re-creation on each render
const InputField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  icon: Icon, 
  required = false,
  error,
  helper,
  rows,
  readOnly = false,
}: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
          <Icon size={18} />
        </div>
      )}
        {rows ? (
          <Textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            className={`w-full ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
        ) : (
          <Input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            readOnly={readOnly}
            className={`w-full ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
        )}
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠️ {error}</p>}
    {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
  </div>
);

const DoctorCreateModal = ({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated?: (created?: any) => void }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    doctorName: '',
    specialty: '',
    bio: '',
    degree: [] as string[],
    academic: '',
    achievements: '',
    yearsOfExperience: '',
    profile: {
      name: '',
      address: '',
      phone: '',
      email: '',
      gender: '',
      dob: '',
      avatarUrl: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specialtiesList, setSpecialtiesList] = useState<Array<{ _id: string; name: string }>>([]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '');
      setForm((s) => {
        const nextProfile = { ...s.profile, [key]: value };
        const computed = buildDoctorName(nextProfile.name, s.academic, s.degree);
        return { ...s, profile: nextProfile, doctorName: computed };
      });
    } else if (e.target instanceof HTMLSelectElement && e.target.multiple) {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      setForm((s) => {
        const computed = buildDoctorName(s.profile?.name, s.academic, selected);
        return { ...s, [name]: selected, doctorName: computed } as any;
      });
    } else {
      // top-level change (could be academic)
      setForm((s) => {
        const nextTop: any = { ...s, [name]: value };
        const computed = buildDoctorName(nextTop.profile?.name, nextTop.academic, nextTop.degree);
        return { ...nextTop, doctorName: computed };
      });
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // fetch specialties for select
  React.useEffect(() => {
    const fetch = async () => {
      try {
        const email = typeof window !== 'undefined' ? localStorage.getItem('email') || '' : '';
        const res = await getSpecialties(email);
        if (res?.data) setSpecialtiesList(res.data as any);
      } catch (e) {
        console.error('Failed to load specialties', e);
      }
    };
    fetch();
  }, []);

  const degreeOptions = [
    { label: 'Tiến sĩ Y học', short: 'TSYH', priority: 1 },
    { label: 'Tiến sĩ', short: 'TS', priority: 2 },
    { label: 'Bác sĩ CKII', short: 'BS.CKII', priority: 3 },
    { label: 'Bác sĩ CKI', short: 'BS.CKI', priority: 4 },
    { label: 'Thạc sĩ', short: 'ThS', priority: 5 },
    { label: 'Bác sĩ', short: 'BS', priority: 6 },
    { label: 'Cử nhân', short: 'CN', priority: 7 },
    { label: 'Thầy thuốc nhân dân', short: 'TTND', priority: 8 },
    { label: 'Thầy thuốc ưu tú', short: 'TTƯT', priority: 9 },
  ];

  const academicOptions = [
    { label: 'Giáo sư', short: 'GS', priority: 1 },
    { label: 'Phó giáo sư', short: 'PGS', priority: 2 },
    { label: 'Không', short: '', priority: 999 },
  ];

  const buildDoctorName = (profileName?: string, academicLabel?: string, degreeArr?: string[]) => {
    const name = profileName?.trim() || '';
    const academicObj = academicOptions.find((a) => a.label === academicLabel);
    const academicShort = academicObj && academicObj.short ? academicObj.short.trim() : '';

    let degreeShort = '';
    if (Array.isArray(degreeArr) && degreeArr.length > 0) {
      const matched = degreeArr
        .map((label) => degreeOptions.find((d) => d.label === label))
        .filter(Boolean) as Array<{ label: string; short: string; priority: number }>;
      if (matched.length > 0) {
        matched.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        degreeShort = matched[0]?.short ?? '';
      }
    }

    const parts: string[] = [];
    if (academicShort) parts.push(`${academicShort}.`);
    if (degreeShort) parts.push(`${degreeShort} `);
    if (name) parts.push(name);

    return parts.join('').trim();
  };

  // Keep doctorName in sync whenever relevant fields change (profile.name, academic, degree)
  React.useEffect(() => {
    const computed = buildDoctorName(form.profile?.name, form.academic, form.degree);
    if (computed !== form.doctorName) setForm((s) => ({ ...s, doctorName: computed }));
  }, [form.profile?.name, form.academic, form.degree]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.profile.name.trim()) newErrors['profile.name'] = 'Vui lòng nhập tên';
    if (!form.profile.email.trim()) newErrors['profile.email'] = 'Vui lòng nhập email';

    if (activeTab === 'professional') {
      if (!form.doctorName?.trim()) newErrors.doctorName = 'Vui lòng nhập tên bác sĩ';
      if (!form.specialty?.trim()) newErrors.specialty = 'Vui lòng nhập chuyên khoa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ensure degree is an array and academic is a string to match API expectations
      const degreeArray = Array.isArray(form.degree)
        ? form.degree
        : form.degree
        ? [String(form.degree)]
        : [];

      const academicStr = typeof form.academic === 'string' ? form.academic : String(form.academic ?? '');

      const payload = {
        ...form,
        degree: degreeArray,
        academic: academicStr,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
      };

      const res = await createDoctor(payload);
      const message = (res as any)?.message ?? 'Tạo bác sĩ thành công';
      const code = (res as any)?.code ?? undefined;

      if ((typeof code === 'string' && code.toUpperCase() === 'SUCCESS') || code === 'SUCCESS' || code === 200) {
        toast.success(String(message));
        const created = (res as any)?.data ?? null;
        onOpenChange(false);
        onCreated?.(created ?? undefined);
      } else {
        toast.error(String(message));
      }
    } catch (err) {
      console.error('createDoctor error', err);
      toast.error('Có lỗi khi tạo bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'professional', label: 'Chuyên môn', icon: Stethoscope },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[1600px] sm:max-w-[700px] max-h-[90vh] p-0 overflow-auto mx-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User size={20} />
            </div>
            Tạo hồ sơ bác sĩ mới
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Điền đầy đủ thông tin để tạo hồ sơ bác sĩ trong hệ thống
          </p>
        </DialogHeader>

        <div className="px-6 pt-4 border-b bg-white dark:bg-slate-900">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-t-2 border-blue-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-auto px-6 py-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Tên"
                    name="profile.name"
                    value={form.profile.name}
                    onChange={handleChange}
                    placeholder="Họ và tên"
                    icon={User}
                    required
                    error={errors['profile.name']}
                  />
                  <InputField
                    label="Email"
                    name="profile.email"
                    value={form.profile.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    type="email"
                    icon={Mail}
                    required
                    error={errors['profile.email']}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Số điện thoại"
                    name="profile.phone"
                    value={form.profile.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    icon={Phone}
                  />
                  <InputField
                    label="Địa chỉ"
                    name="profile.address"
                    value={form.profile.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành"
                    icon={MapPin}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Giới tính</label>
                    <select
                      name="profile.gender"
                      value={form.profile.gender}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <InputField
                    label="Ngày sinh"
                    name="profile.dob"
                    value={form.profile.dob}
                    onChange={handleChange}
                    type="date"
                    icon={Calendar}
                  />
                  <InputField
                    label="Avatar URL"
                    name="profile.avatarUrl"
                    value={form.profile.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    icon={Camera}
                  />
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Tên bác sĩ"
                    name="doctorName"
                    value={form.doctorName}
                    onChange={handleChange}
                    readOnly={true}
                    placeholder="Ví dụ: BS. Nguyễn Văn A"
                    icon={User}
                    required
                    error={errors.doctorName}
                    helper="(không thể chỉnh sửa)"
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chuyên khoa <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                        <Stethoscope size={18} />
                      </div>
                      <select
                        name="specialty"
                        value={form.specialty}
                        onChange={handleChange}
                        className={`w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.specialty ? 'border-red-500' : ''}`}
                      >
                        <option value="">Chọn chuyên khoa</option>
                        {specialtiesList.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    {errors.specialty && <p className="text-xs text-red-500 flex items-center gap-1">⚠️ {errors.specialty}</p>}
                    <p className="text-xs text-gray-500">Chuyên khoa chính của bác sĩ</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Học vị</label>
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {degreeOptions.map((d) => (
                          <label key={d.label} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              value={d.label}
                              checked={Array.isArray(form.degree) && form.degree.includes(d.label)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setForm((s) => {
                                  const next = Array.isArray(s.degree) ? [...s.degree] : [];
                                  if (checked) {
                                    if (!next.includes(d.label)) next.push(d.label);
                                  } else {
                                    const idx = next.indexOf(d.label);
                                    if (idx >= 0) next.splice(idx, 1);
                                  }
                                  const computed = buildDoctorName(s.profile?.name, s.academic, next);
                                  return { ...s, degree: next, doctorName: computed };
                                });
                              }}
                              className="w-4 h-4"
                            />
                            <span>{d.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Chọn học vị chính của bác sĩ</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Học hàm</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                        <Award size={18} />
                      </div>
                      <select
                        name="academic"
                        value={form.academic}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn học hàm (không bắt buộc)</option>
                        {academicOptions.map((a) => (
                          <option key={a.label} value={a.label}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">Chọn học hàm nếu có</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Số năm kinh nghiệm"
                    name="yearsOfExperience"
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                    type="number"
                    icon={Calendar}
                    placeholder="Ví dụ: 5"
                    helper="Nhập số năm kinh nghiệm của bác sĩ"
                  />
                </div>

                <InputField
                  label="Thành tựu & Giải thưởng"
                  name="achievements"
                  value={form.achievements}
                  onChange={handleChange}
                  placeholder="Các giải thưởng, chứng chỉ đặc biệt..."
                  rows={6}
                  helper="Liệt kê các thành tựu nổi bật của bác sĩ"
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                        Mẹo nhập thông tin chuyên môn
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        Hãy liệt kê đầy đủ các chứng chỉ, bằng cấp và thành tựu để tăng độ tin cậy của hồ sơ bác sĩ.
                      </p>
                    </div>
                  </div>
                </div>
                <InputField
                  label="Tiểu sử / Giới thiệu"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn về bác sĩ, kinh nghiệm làm việc..."
                  icon={FileText}
                  rows={4}
                  helper="Thông tin tóm tắt về bác sĩ"
                />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'profile' && 'Bước 1/2: Điền profile'}
              {activeTab === 'professional' && 'Bước 2/2: Thông tin chuyên môn'}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              {activeTab === 'profile' && (
                <Button
                  type="button"
                  onClick={() => {
                    if (validateForm()) setActiveTab('professional');
                  }}
                >
                  Tiếp theo →
                </Button>
              )}
              {activeTab === 'professional' && (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang tạo...
                    </span>
                  ) : (
                    '✓ Tạo bác sĩ'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Mock data
const mockDoctors = [
  {
    id: 1,
    doctorName: 'BS. Nguyễn Văn Anh',
    specialty: 'Tim mạch',
    degree: 'Bác sĩ CKI',
    yearsOfExperience: 15,
    profile: {
      name: 'Nguyễn Văn Anh',
      email: 'nva@hospital.com',
      phone: '0901234567',
      address: 'Hà Nội',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
    },
    status: 'active',
    joinDate: '2020-01-15'
  },
  {
    id: 2,
    doctorName: 'BS. Trần Thị Bình',
    specialty: 'Nội khoa',
    degree: 'Thạc sĩ',
    yearsOfExperience: 12,
    profile: {
      name: 'Trần Thị Bình',
      email: 'ttb@hospital.com',
      phone: '0907654321',
      address: 'TP. Hồ Chí Minh',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
    },
    status: 'active',
    joinDate: '2021-03-20'
  },
  {
    id: 3,
    doctorName: 'BS. Lê Minh Chiến',
    specialty: 'Ngoại khoa',
    degree: 'Tiến sĩ',
    yearsOfExperience: 20,
    profile: {
      name: 'Lê Minh Chiến',
      email: 'lmc@hospital.com',
      phone: '0903456789',
      address: 'Đà Nẵng',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
    },
    status: 'active',
    joinDate: '2018-06-10'
  },
  {
    id: 4,
    doctorName: 'BS. Phạm Thu Dung',
    specialty: 'Nhi khoa',
    degree: 'Bác sĩ CKI',
    yearsOfExperience: 8,
    profile: {
      name: 'Phạm Thu Dung',
      email: 'ptd@hospital.com',
      phone: '0908765432',
      address: 'Hải Phòng',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
    },
    status: 'active',
    joinDate: '2022-09-05'
  }
];

export default function AdminDoctorsPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [doctors, setDoctors] = useState(mockDoctors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique specialties
  const specialties = ['all', ...new Set(doctors.map(d => d.specialty))];

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const stats = [
    {
      label: 'Tổng số bác sĩ',
      value: doctors.length,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      label: 'Chuyên khoa',
      value: new Set(doctors.map(d => d.specialty)).size,
      icon: Stethoscope,
      color: 'bg-green-500',
      trend: '+3'
    },
    {
      label: 'Bác sĩ mới tháng này',
      value: 4,
      icon: Calendar,
      color: 'bg-purple-500',
      trend: '+33%'
    },
    {
      label: 'Trung bình kinh nghiệm',
      value: Math.round(doctors.reduce((acc, d) => acc + d.yearsOfExperience, 0) / doctors.length) + ' năm',
      icon: Award,
      color: 'bg-orange-500',
      trend: '15.2 năm'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Stethoscope size={24} />
              </div>
              Quản lý Bác sĩ
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Quản lý hồ sơ và thông tin bác sĩ trong hệ thống
            </p>
          </div>
          <Button 
            onClick={() => setOpenCreate(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Thêm bác sĩ mới
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {stat.trend}
                      </p>
                    </div>
                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Tìm kiếm theo tên bác sĩ, chuyên khoa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Specialty Filter */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'Tất cả chuyên khoa' : specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                    <div className="bg-gray-600 rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
                >
                  <div className="w-4 h-4 flex flex-col gap-1">
                    <div className="h-0.5 bg-gray-600 rounded"></div>
                    <div className="h-0.5 bg-gray-600 rounded"></div>
                    <div className="h-0.5 bg-gray-600 rounded"></div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Hiển thị {filteredDoctors.length} / {doctors.length} bác sĩ
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Doctors Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={
                        doctor.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          doctor.doctorName ?? ''
                        )}`
                      }
                      alt={doctor.doctorName}
                      className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-900"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {doctor.doctorName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doctor.degree}
                      </p>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        <Stethoscope size={12} />
                        {doctor.specialty}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail size={14} />
                      <span className="truncate">{doctor.profile?.email ?? ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone size={14} />
                      <span>{doctor.profile?.phone ?? ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={14} />
                      <span>{doctor.profile?.address ?? ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Award size={14} />
                      <span>{doctor.yearsOfExperience ?? 0} năm kinh nghiệm</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye size={14} className="mr-1" />
                      Chi tiết
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit size={14} className="mr-1" />
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Bác sĩ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Chuyên khoa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kinh nghiệm
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDoctors.map(doctor => (
                      <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                doctor.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                  doctor.doctorName ?? ''
                                )}`
                              }
                              alt={doctor.doctorName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {doctor.doctorName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {doctor.degree}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            <Stethoscope size={12} />
                            {doctor.specialty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {doctor.profile?.email ?? ''}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {doctor.profile?.phone ?? ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {doctor.yearsOfExperience} năm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredDoctors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Không tìm thấy bác sĩ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('all');
              }}>
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Modal */}
      <DoctorCreateModal 
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={(created) => {
          setOpenCreate(false);
          if (!created) {
            console.log('Doctor created, but no payload returned');
            return;
          }

          // Normalize created doctor to always include a `profile` object
          const createdProfile = created.profile
            ? created.profile
            : {
                name: created.doctorName ?? '',
                email: created.email ?? '',
                phone: created.phone ?? '',
                address: created.address ?? '',
                avatarUrl: created.avatarUrl ?? '',
              };

          const normalized = { ...created, profile: createdProfile };

          setDoctors((prev) => [normalized, ...prev]);
          console.log('Doctor created successfully', normalized);
        }}
      />
    </div>
  );
}