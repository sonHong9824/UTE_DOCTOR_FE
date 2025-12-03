"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, Briefcase, Phone, Mail, MapPin, Award, Calendar, Camera, FileText, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { createDoctor } from '@/apis/admin/admin.api';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (created?: any) => void;
}

export default function DoctorCreateModal({ open, onOpenChange, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    doctorName: '',
    specialty: '',
    bio: '',
    degree: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.debug('[DoctorCreateModal] handleChange', { name, value });
    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '');
      setForm((s) => {
        const newForm = { ...s, profile: { ...s.profile, [key]: value } };
        console.debug('[DoctorCreateModal] newForm (profile)', newForm);
        return newForm;
      });
    } else {
      setForm((s) => {
        const newForm = { ...s, [name]: value };
        console.debug('[DoctorCreateModal] newForm (top)', newForm);
        return newForm;
      });
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Log the actual updated form whenever it changes (avoids stale-closure confusion)
  useEffect(() => {
    console.debug('[DoctorCreateModal] form updated', form);
  }, [form]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // validate profile first
    if (!form.profile.name.trim()) newErrors['profile.name'] = 'Vui lòng nhập tên profile';
    if (!form.profile.email.trim()) newErrors['profile.email'] = 'Vui lòng nhập email profile';

    // if validating professional step, validate those fields too
    if (activeTab === 'professional') {
      if (!form.doctorName?.trim()) newErrors.doctorName = 'Vui lòng nhập tên bác sĩ';
      if (!form.specialty?.trim()) newErrors.specialty = 'Vui lòng nhập chuyên khoa';
    }
    if (!form.profile.name.trim()) newErrors['profile.name'] = 'Vui lòng nhập tên profile';
    if (!form.profile.email.trim()) newErrors['profile.email'] = 'Vui lòng nhập email profile';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // prepare payload: convert yearsOfExperience to number if possible
      const payload = {
        ...form,
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
    rows
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
            className={`w-full ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
        ) : (
          <Input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            className={`w-full ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠️ {error}</p>}
      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[98vw] !max-w-[1600px] sm:!max-w-[700px] max-h-[90vh] p-0 overflow-auto mx-auto">
        {/* Header */}
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

        {/* Tabs */}
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

        {/* Content */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-auto px-6 py-6">
            {/* Profile Tab */}
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
                    placeholder="https://example.com/profile-avatar.jpg"
                    icon={Camera}
                  />
                </div>
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Tên bác sĩ"
                    name="doctorName"
                    value={form.doctorName}
                    onChange={handleChange}
                    placeholder="Ví dụ: BS. Nguyễn Văn A"
                    icon={User}
                    required
                    error={errors.doctorName}
                    helper="Tên hiển thị cho hồ sơ bác sĩ"
                  />

                  <InputField
                    label="Chuyên khoa"
                    name="specialty"
                    value={form.specialty}
                    onChange={handleChange}
                    placeholder="Ví dụ: Tim mạch, Nội khoa..."
                    icon={Stethoscope}
                    required
                    error={errors.specialty}
                    helper="Chuyên khoa chính của bác sĩ"
                  />
                </div>
                <InputField
                  label="Học vị"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="Bác sĩ CKI, Thạc sĩ"
                  icon={Award}
                  helper="Nhập nhiều học vị cách nhau bằng dấu phẩy"
                />

                <InputField
                  label="Học hàm"
                  name="academic"
                  value={form.academic}
                  onChange={handleChange}
                  placeholder="Tiến sĩ, Phó giáo sư..."
                  icon={Award}
                />

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
                <div>
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
              </div>
            )}
            {/* contact removed: profile covers contact fields */}
          </div>

          {/* Footer */}
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
                    // validate profile step before moving to professional
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
}