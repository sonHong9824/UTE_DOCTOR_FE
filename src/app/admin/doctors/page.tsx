"use client";

import React, { useState, useEffect } from 'react';
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
  Camera,
  Pencil,
  Star,
  Briefcase,
  GraduationCap,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { createDoctor, getDoctorsAdmin, updateAccountStatus, updateDoctor } from '@/apis/admin/admin.api';
import { getDoctorById } from '@/apis/doctor/profile.api';
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        setForm((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatarUrl: dataUrl,
          },
        }));
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };
  

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

const DoctorEditModal = ({ open, onOpenChange, initialData, onUpdated }: { open: boolean; onOpenChange: (v: boolean) => void; initialData?: any; onUpdated?: (updated?: any) => void }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState<any>({
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specialtiesList, setSpecialtiesList] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    if (!initialData) return;
    // Normalize incoming initialData shape used elsewhere in the page
    const d = initialData;
    setForm({
      doctorName: d.doctorName ?? '',
      // support response shape where specialty is returned as `chuyenKhoaId` object
      specialty: d.chuyenKhoaId?._id ?? d.specialtyId ?? d.specialty ?? '',
      bio: d.bio ?? '',
      degree: Array.isArray(d.degreeArray) ? d.degreeArray : Array.isArray(d.degree) ? d.degree : d.degree ? [d.degree] : [],
      academic: d.academic ?? '',
      achievements: Array.isArray(d.achievements) ? d.achievements.join('\n') : (d.achievements ? String(d.achievements) : ''),
      yearsOfExperience: String(d.yearsOfExperience ?? ''),
      profile: {
        // support `profile` or `profileId` (object) shapes
        name: (d.profile?.name ?? d.profileId?.name) ?? '',
        address: (d.profile?.address ?? d.profileId?.address) ?? '',
        phone: (d.profile?.phone ?? d.profileId?.phone) ?? '',
        email: (d.profile?.email ?? d.profileId?.email) ?? '',
        gender: (d.profile?.gender ?? d.profileId?.gender) ?? '',
        dob: (d.profile?.dob ?? d.profileId?.dob) ? new Date(d.profile?.dob ?? d.profileId?.dob).toISOString().slice(0,10) : '',
        avatarUrl: (d.profile?.avatarUrl ?? d.profileId?.avatarUrl) ?? '',
      }
    });
  }, [initialData]);

  // keep doctorName in sync with profile.name, academic, degree
  useEffect(() => {
    const computed = buildDoctorName(form.profile?.name, form.academic, form.degree);
    if (computed !== form.doctorName) setForm((s: any) => ({ ...s, doctorName: computed }));
  }, [form.profile?.name, form.academic, form.degree]);

  useEffect(() => {
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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '');
      setForm((s: any) => ({ ...s, profile: { ...s.profile, [key]: value } }));
    } else {
      setForm((s: any) => ({ ...s, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string,string> = {};
    if (!form.profile?.name?.trim()) newErrors['profile.name'] = 'Vui lòng nhập tên';
    if (!form.profile?.email?.trim()) newErrors['profile.email'] = 'Vui lòng nhập email';
    if (!form.specialty) newErrors['specialty'] = 'Chọn chuyên khoa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Vui lòng hoàn thành thông tin bắt buộc trước khi lưu');
      return;
    }

    if (!initialData) {
      toast.error('Dữ liệu bác sĩ không hợp lệ - không thể cập nhật');
      return;
    }

    setLoading(true);
    try {
      const degreeArray = Array.isArray(form.degree) ? form.degree : form.degree ? [String(form.degree)] : [];
      // Payload shape expected by backend for update (as requested):
      // achievements as a single string, specialty field (id), degree as array
      const payload = {
        doctorName: form.doctorName,
        specialty: form.specialty,
        bio: form.bio,
        degree: degreeArray,
        academic: String(form.academic ?? ''),
        achievements: form.achievements ? String(form.achievements) : '',
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        profile: {
          ...form.profile,
        },
      };

      const id = initialData.id || initialData._id;
      console.log('Edit doctor payload ->', payload);
      const res = await updateDoctor(id, payload);
      console.log('Update doctor raw response ->', res);
      let updated = res?.data ?? res ?? null;
      console.log('Normalized updated ->', updated);

      // If server returned no updated object, attempt to re-fetch the doctor
      if (!updated) {
        try {
          const ref = await getDoctorById(id);
          updated = ref?.data ?? ref ?? null;
          console.log('Refetched updated ->', updated);
        } catch (e) {
          console.error('Refetch after update failed', e);
        }
      }

      if (!updated) {
        toast.error('Không nhận được dữ liệu trả về từ server');
      } else {
        toast.success('Cập nhật hồ sơ bác sĩ thành công');
      }

      onOpenChange(false);
      onUpdated?.(updated ?? null);
    } catch (err) {
      console.error('updateDoctor error', err);
      toast.error('Có lỗi khi cập nhật bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[1600px] sm:max-w-[700px] max-h-[90vh] p-0 overflow-auto mx-auto">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-slate-800 dark:to-slate-900">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
              <User size={20} />
            </div>
            Cập nhật hồ sơ bác sĩ
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Chỉnh sửa thông tin bác sĩ và lưu thay đổi</p>
        </DialogHeader>

        <div className="px-6 pt-4 border-b bg-white dark:bg-slate-900">
          <div className="flex gap-1">
            {['profile','professional'].map((t) => (
              <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm ${activeTab===t? 'bg-white dark:bg-slate-800 text-amber-600 border-t-2 border-amber-500':'text-gray-600 dark:text-gray-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-auto px-6 py-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Tên" name="profile.name" value={form.profile.name} onChange={handleChange} icon={User} required error={errors['profile.name']} />
                  <InputField label="Email" name="profile.email" value={form.profile.email} onChange={handleChange} type="email" icon={Mail} required error={errors['profile.email']} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Số điện thoại" name="profile.phone" value={form.profile.phone} onChange={handleChange} icon={Phone} />
                  <InputField label="Địa chỉ" name="profile.address" value={form.profile.address} onChange={handleChange} icon={MapPin} />
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Tên bác sĩ" name="doctorName" value={form.doctorName} onChange={handleChange} readOnly placeholder="Không thể chỉnh" icon={User} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chuyên khoa</label>
                    <select name="specialty" value={form.specialty} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                      <option value="">Chọn chuyên khoa</option>
                      {specialtiesList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    {errors['specialty'] && <p className="text-xs text-red-500">{errors['specialty']}</p>}
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
                                setForm((s: any) => {
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

                <InputField label="Tiểu sử / Giới thiệu" name="bio" value={form.bio} onChange={handleChange} rows={4} icon={FileText} />
                <InputField label="Thành tựu" name="achievements" value={form.achievements} onChange={handleChange} rows={4} />
                <InputField label="Số năm kinh nghiệm" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} type="number" icon={Calendar} />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 dark:bg-slate-900 flex items-center justify-between">
            <div className="text-sm text-gray-600">{activeTab === 'profile' ? 'Bước 1/2' : 'Bước 2/2'}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Hủy</Button>
              {activeTab === 'profile' ? (
                <Button onClick={() => { if (validate()) setActiveTab('professional'); }}>Tiếp theo →</Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-amber-500 text-white" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function AdminDoctorsPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editInitial, setEditInitial] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [specialtiesFromApi, setSpecialtiesFromApi] = useState<Array<{ _id: string; name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openView, setOpenView] = useState(false);
  const [viewDoctor, setViewDoctor] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [activatingIds, setActivatingIds] = useState<Set<string>>(new Set());

  // Normalize a server doctor object to the UI shape used in this page
  const normalizeDoctor = (d: any) => {
    if (!d) return null;
    return {
      id: d._id ?? d.id ?? '',
      doctorName: d.doctorName ?? '',
      specialty: d.chuyenKhoaId?.name ?? (d.chuyenKhoaId === null ? '' : ''),
      specialtyId: d.chuyenKhoaId?._id ?? '',
      degree: Array.isArray(d.degree) ? d.degree.join(', ') : d.degree ?? '',
      degreeArray: Array.isArray(d.degree) ? d.degree : d.degree ? [d.degree] : [],
      academic: d.academic ?? '',
      bio: d.bio ?? '',
      achievements: Array.isArray(d.achievements) ? d.achievements : d.achievements ? [d.achievements] : [],
      yearsOfExperience: Number(d.yearsOfExperience) || 0,
      profile: d.profileId ?? d.profile ?? {},
      account: d.accountId ?? null,
      accountStatus: d.accountId?.status ?? d.status ?? 'UNKNOWN',
      raw: d,
    };
  };

  const handleToggleAccount = async (doctor: any) => {
    if (!doctor?.account?._id) {
      toast.error('Tài khoản chưa được tạo cho bác sĩ này');
      return;
    }

    const targetStatus = doctor.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = targetStatus === 'ACTIVE' ? 'Xác nhận kích hoạt tài khoản?' : 'Xác nhận huỷ kích hoạt tài khoản?';
    if (!window.confirm(confirmMsg)) return;

    // mark loading
    setActivatingIds((s) => new Set(s).add(doctor.id));
    try {
      const res = await updateAccountStatus(doctor.account._id, targetStatus);
      const updated = res?.data ?? null;
      // Update UI based on result (fall back to targetStatus)
      setDoctors((prev) => prev.map((d) => (d.id === doctor.id ? { ...d, accountStatus: updated?.status ?? targetStatus, account: { ...d.account, status: updated?.status ?? targetStatus } } : d)));
      toast.success(`Cập nhật trạng thái tài khoản: ${(updated?.status ?? targetStatus)}`);
      // Refresh list to ensure latest server state
      try {
        await fetchDoctors();
      } catch (e) {
        console.error('Failed to refresh doctors after account toggle', e);
      }
    } catch (err) {
      console.error('Failed to update account status', err);
      toast.error('Không thể cập nhật trạng thái tài khoản');
    } finally {
      setActivatingIds((s) => {
        const next = new Set(s);
        next.delete(doctor.id);
        return next;
      });
    }
  };

  // Open edit modal for a doctor. Fetch full doctor via API for most up-to-date data.
  const handleEdit = async (doctor: any) => {
    if (!doctor) return;
    setViewLoading(true);
    try {
      const res = await getDoctorById(doctor.id || doctor._id);
      const data = res?.data ?? doctor.raw ?? doctor;
      setEditInitial(data);
      setOpenEdit(true);
    } catch (err) {
      console.error('Failed to load doctor for edit', err);
      toast.error('Không thể tải dữ liệu bác sĩ để chỉnh sửa');
    } finally {
      setViewLoading(false);
    }
  };

  // Fetch doctors from admin API and map to UI shape (exposed for reuse)
  const fetchDoctors = async () => {
    setLoadingList(true);
    try {
      const params: any = { page, limit };
      if (selectedSpecialty && selectedSpecialty !== 'all') params.specialtyId = selectedSpecialty;
      if (searchQuery && searchQuery.trim()) params.name = searchQuery.trim();

      const res = await getDoctorsAdmin(params);
      const docs = res?.data?.doctors ?? [];
      const pagination = res?.data?.pagination ?? {};
      const mapped = (docs as any[]).map((d) => ({
        id: d._id,
        doctorName: d.doctorName ?? '',
        specialty: d.chuyenKhoaId?.name ?? (d.chuyenKhoaId === null ? '' : ''),
        specialtyId: d.chuyenKhoaId?._id ?? '',
        degree: Array.isArray(d.degree) ? d.degree.join(', ') : d.degree ?? '',
        degreeArray: Array.isArray(d.degree) ? d.degree : d.degree ? [d.degree] : [],
        academic: d.academic ?? '',
        bio: d.bio ?? '',
        achievements: Array.isArray(d.achievements) ? d.achievements : d.achievements ? [d.achievements] : [],
        yearsOfExperience: Number(d.yearsOfExperience) || 0,
        profile: d.profileId ?? {},
        account: d.accountId ?? null,
        accountStatus: d.accountId?.status ?? d.status ?? 'UNKNOWN',
        raw: d,
      }));
      setDoctors(mapped);
      setTotal(Number(pagination.total) || 0);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (err) {
      console.error('Failed to fetch doctors admin', err);
      try {
        const e: any = err;
        const serverMsg = e?.response?.data?.message ?? e?.message ?? 'Lỗi khi tải danh sách bác sĩ';
        toast.error(String(serverMsg));
      } catch (e) {
        // ignore
      }
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, limit, selectedSpecialty, searchQuery]);

  // Load specialties from API for the filter (merge with any specialties present in fetched doctors)
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const email = typeof window !== 'undefined' ? localStorage.getItem('email') || '' : '';
        const res = await getSpecialties(email);
        const items = res?.data ?? [];
        setSpecialtiesFromApi(items);
      } catch (err) {
        console.error('Failed to fetch specialties for filter', err);
      }
    };
    fetchSpecialties();
  }, []);

  // When filter inputs change, reset to first page so server returns correct page 1 results
  useEffect(() => {
    setPage(1);
  }, [selectedSpecialty, searchQuery]);
  // Use API-provided specialties for the filter (value = _id). Keep 'all' as default.

  // We fetch filtered data from the server when `searchQuery` or `selectedSpecialty` change,
  // so `filteredDoctors` is just the fetched `doctors` list.
  const filteredDoctors = doctors;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {/* <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Stethoscope size={24} />
              </div>
              Quản lý Bác sĩ
            </h1> */}
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

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Tìm kiếm theo tên bác sĩ"
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
                  <option key="all" value="all">Tất cả chuyên khoa</option>
                  {specialtiesFromApi.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
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
                    <div>
                      <img
                        src={
                          doctor.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            doctor.doctorName ?? ''
                          )}`
                        }
                        alt={doctor.doctorName}
                        className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-blue-900"
                      />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${doctor.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : doctor.accountStatus === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                        {doctor.accountStatus ?? 'UNKNOWN'}
                      </span>
                    </div>
                    
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(doctor)}>
                          <Edit size={14} className="mr-1" />
                          Sửa
                        </Button>
                    {(() => {
                      const isActive = doctor.accountStatus === 'ACTIVE';
                      const btnClass = isActive ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-green-600 hover:bg-green-700 text-white';
                      return (
                        <Button variant="default" size="sm" className={`${btnClass}`} onClick={() => handleToggleAccount(doctor)} disabled={activatingIds.has(doctor.id)}>
                          {activatingIds.has(doctor.id) ? (
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Đang cập nhật...
                            </span>
                          ) : (
                            <>
                              <Users size={14} className="mr-1" />
                              {isActive ? 'Inactive' : 'Active'}
                            </>
                          )}
                        </Button>
                      );
                    })()}
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
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${doctor.accountStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : doctor.accountStatus === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                                  {doctor.accountStatus ?? 'UNKNOWN'}
                                </span>
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
                            {/* <Button variant="ghost" size="sm">
                              <Eye size={14} />
                            </Button> */}
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(doctor)}>
                              <Edit size={14} className="mr-1" />
                            </Button>
                            {(() => {
                              const isActive = doctor.accountStatus === 'ACTIVE';
                              return (
                                <Button variant="ghost" size="sm" className={`flex items-center gap-2 ${isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`} onClick={() => handleToggleAccount(doctor)} disabled={activatingIds.has(doctor.id)}>
                                  {activatingIds.has(doctor.id) ? (
                                    <span className="flex items-center gap-2">
                                      <span className="w-3 h-3 border-2 border-current rounded-full animate-spin" />
                                      Đang...
                                    </span>
                                  ) : (
                                    <>
                                      <Users size={14} />
                                      {isActive ? 'Inactive' : 'Active'}
                                    </>
                                  )}
                                </Button>
                              );
                            })()}
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

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {loadingList ? 'Đang tải danh sách...' : `Hiển thị trang ${page} / ${totalPages}`}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ‹ Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau ›
            </Button>
          </div>
        </div>

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
        onCreated={async (created) => {
            setOpenCreate(false);
            // After creating, refresh the server-backed list so it's authoritative
            try {
              setPage(1);
              await fetchDoctors();
            } catch (e) {
              console.error('Failed to refresh doctors after create', e);
            }
          }}
      />
        {/* Edit Modal */}
        <DoctorEditModal
          open={openEdit}
          onOpenChange={setOpenEdit}
          initialData={editInitial ?? undefined}
          onUpdated={async (updated) => {
            // After update, refresh server-backed list to ensure canonical state
            try {
              await fetchDoctors();
            } catch (e) {
              console.error('Failed to refresh doctors after update', e);
            }
            setOpenEdit(false);
          }}
        />
    </div>
  );
}