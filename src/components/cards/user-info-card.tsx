"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { AccountStatusEnum } from "@/enum/account-status.enum";
import { GenderEnum } from "@/enum/gender.enum";
import { UserProfileDTO } from "@/types/userDTO/userProfile.dto";
import { JSX } from "react";
import {
  FaBirthdayCake,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaVenusMars
} from "react-icons/fa";

interface UserInfoCardProps {
  user: UserProfileDTO;
}

interface Field {
  label: string;
  value: string;
  icon: JSX.Element;
  isStatus?: boolean; // optional, chỉ dùng cho trường Status
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
  const fieldsBlock1: Field[] = [
    { label: "Name", value: user.name || "Unknown", icon: <FaUser className="w-5 h-5 text-blue-500" /> },
    { label: "Gender", value: user.gender || GenderEnum.OTHER, icon: <FaVenusMars className="w-5 h-5 text-purple-500" /> },
    { label: "Joined At", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Unknown", icon: <FaCalendarAlt className="w-5 h-5 text-indigo-500" /> },
  ];

  const fieldsBlock2: Field[] = [
    { label: "Email", value: user.email || "Unknown", icon: <FaEnvelope className="w-5 h-5 text-red-500" /> },
    { label: "Phone", value: user.phoneNumber || "Unknown", icon: <FaPhone className="w-5 h-5 text-green-500" /> },
  ];

  const fieldsBlock3: Field[] = [
    { label: "Date of Birth", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "Unknown", icon: <FaBirthdayCake className="w-5 h-5 text-pink-500" /> },
    { label: "Address", value: user.address || "Unknown", icon: <FaMapMarkerAlt className="w-5 h-5 text-yellow-500" /> },
    { label: "Status", value: user.status || AccountStatusEnum.INACTIVE, icon: <FaCheckCircle className="w-5 h-5 text-teal-500" />, isStatus: true },

  ];

  const renderFields = (fields: typeof fieldsBlock1) =>
    fields.map((field) => (
      <div key={field.label} className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {field.icon}
          <span className="text-sm text-muted-foreground">{field.label}:</span>
        </div>
        <span className={`font-semibold ${field.isStatus ? 
          (field.value === AccountStatusEnum.ACTIVE ? "text-green-600" : "text-red-600") : 
          "text-gray-900 dark:text-gray-100"}`}>
          {field.value}
        </span>
      </div>
    ));

  return (
    <div className="grid grid-cols-2 grid-rows-3 gap-6">
      {/* Góc phần tư 1: Avatar */}
      <div className="flex justify-center items-start">
        <img
          src={user.avatarUrl || "https://scontent.fsgn6-1.fna.fbcdn.net/v/t39.30808-6/481478694_2103522440111572_7456189524097186132_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEEFy3b28gzie5bP5XSM6n0aKFNoNCDDSFooU2g0IMNIZ3KESM90HdDaAg9zukZPQ5R2yLBG_4NCu8vStBAvErJ&_nc_ohc=FWYfGHWKKFAQ7kNvwHtaWTn&_nc_oc=Adlrdad5Z3xZEuH71rd3fGoFyzQwrn7QG6zAi682wO5k7l_bvjyDhHqz1061TFgczWA&_nc_zt=23&_nc_ht=scontent.fsgn6-1.fna&_nc_gid=zq4Qe_gYjl8qRZPOQYsT6w&oh=00_AfaPqpdblQQ2H_zm_n3Gx9QPr3UccsQCtCIxzr3WTdHCkA&oe=68E1A950"}
          alt={`${user.name}'s avatar`}
          className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-gray-300 object-cover object-center"
        />
      </div>

      {/* Góc phần tư 2: Block 1 */}
      <Card
        className="p-4 rounded-xl shadow-md w-full flex flex-col justify-center"
        style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }}
      >
        <CardTitle className="text-lg mb-3">Thông tin cơ bản</CardTitle>
        <div>{renderFields(fieldsBlock1)}</div>
      </Card>

      {/* Góc phần tư 3: Block 2 */}
        <Card
          className="p-4 rounded-xl shadow-md w-full flex flex-col justify-center"
          style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }}
        >
          <CardTitle className="text-lg mb-3">Liên hệ & địa chỉ</CardTitle>
          <div>{renderFields(fieldsBlock2)}</div>
        </Card>

        {/* Góc phần tư 4: Block 3 + Button */}
        <Card
          className="p-4 rounded-xl shadow-md w-full flex flex-col justify-center"
          style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }}
        >
          <CardTitle className="text-lg mb-3">Trạng thái & thông tin khác</CardTitle>
          <div>{renderFields(fieldsBlock3)}</div>
        </Card>

      {/* Btn Edit */}
      <div className="mt-6 flex justify-center col-span-2">
        <Button
          className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-md bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
          onClick={() => alert("Edit information")}
        >
          <FaEdit className="w-4 h-4" />
          Edit Information
        </Button>
      </div>


    

    </div>
  );
}
