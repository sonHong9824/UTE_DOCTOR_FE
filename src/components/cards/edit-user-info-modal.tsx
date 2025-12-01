"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import { GenderEnum } from "@/enum/gender.enum";
import { useState } from "react";
import { FaCamera, FaSpinner } from "react-icons/fa";

interface EditUserInfoModalProps {
  open: boolean;
  onClose: () => void;
  user: AccountProfileDTO;
  onSave: (updatedUser: Partial<AccountProfileDTO>) => Promise<void>;
}

export default function EditUserInfoModal({ open, onClose, user, onSave }: EditUserInfoModalProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    address: user.address || "",
    gender: user.gender || GenderEnum.OTHER,
    avatarUrl: user.avatarUrl || "",
  });

  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Read file as data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        setFormData((prev) => ({
          ...prev,
          avatarUrl: dataUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const dataToSave: Partial<AccountProfileDTO> = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Failed to update user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 dark:bg-slate-950">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thông tin</h2>

        {/* Avatar Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={avatarPreview || "https://scontent.fsgn6-1.fna.fbcdn.net/v/t39.30808-6/481478694_2103522440111572_7456189524097186132_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEEFy3b28gzie5bP5XSM6n0aKFNoNCDDSFooU2g0IMNIZ3KESM90HdDaAg9zukZPQ5R2yLBG_4NCu8vStBAvErJ&_nc_ohc=FWYfGHWKKFAQ7kNvwHtaWTn&_nc_oc=Adlrdad5Z3xZEuH71rd3fGoFyzQwrn7QG6zAi682wO5k7l_bvjyDhHqz1061TFgczWA&_nc_zt=23&_nc_ht=scontent.fsgn6-1.fna&_nc_gid=zq4Qe_gYjl8qRZPOQYsT6w&oh=00_AfaPqpdblQQ2H_zm_n3Gx9QPr3UccsQCtCIxzr3WTdHCkA&oe=68E1A950"} 
              alt="Avatar Preview"
              className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover object-center"
            />
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
              <FaCamera className="w-4 h-4" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên"
              className="mt-1"
            />
          </div>

          {/* Gender */}
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="gender">Giới tính</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700"
            >
              <option value={GenderEnum.MALE}>Nam</option>
              <option value={GenderEnum.FEMALE}>Nữ</option>
              <option value={GenderEnum.OTHER}>Khác</option>
            </select>
          </div>

          {/* Email */}
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              className="mt-1"
              disabled
            />
          </div>

          {/* Phone */}
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className="mt-1"
            />
          </div>

          {/* Date of Birth */}
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          {/* Address */}
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ"
              className="mt-1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <Button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            {isLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
