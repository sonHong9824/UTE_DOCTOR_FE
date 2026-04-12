"use client";

import EditUserInfoModal from "@/components/cards/edit-user-info-modal";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { AccountStatusEnum } from "@/enum/account-status.enum";
import { GenderEnum } from "@/enum/gender.enum";
import { useUserInfoCard } from "@/features/user-profile/hooks/useUserInfoCard";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import { Coins } from "lucide-react";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { Skeleton } from "../ui";
interface UserInfoCardProps {
  user: AccountProfileDTO;
  onUserUpdated?: (updatedUser: AccountProfileDTO) => void;
}

interface Field {
  label: string;
  value: string;
  isStatus?: boolean; // optional, chỉ dùng cho trường Status
}

export default function UserInfoCard({ user, onUserUpdated }: UserInfoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { coinBalance, loadingCoin, handleSaveUserInfo } = useUserInfoCard(onUserUpdated);
  const fieldsBlock1: Field[] = [
    { label: "Tên", value: user.name || "Unknown" },
    { label: "Giới tính", value: user.gender || GenderEnum.OTHER },
    { label: "Ngày tham gia", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Unknown" },
  ];

  const fieldsBlock2: Field[] = [
    { label: "Email", value: user.email || "Unknown" },
    { label: "Điện thoại", value: user.phoneNumber || "Unknown" },
  ];

  const fieldsBlock3: Field[] = [
    { label: "Ngày sinh", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "Unknown" },
    { label: "Địa chỉ", value: user.address || "Unknown" },
    { label: "Trạng thái", value: user.status || AccountStatusEnum.ACTIVE, isStatus: true },
  ];

  const renderFields = (fields: typeof fieldsBlock1) =>
    fields.map((field) => (
      <div key={field.label} className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
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
    <>
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

        {/* Góc phần tư 4: Block 3 + Coin Widget */}
        <div className="flex flex-col gap-4">
          <Card
            className="p-4 rounded-xl shadow-md w-full flex flex-col justify-center"
            style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }}
          >
            <CardTitle className="text-lg mb-3">Trạng thái & thông tin khác</CardTitle>
            <div>{renderFields(fieldsBlock3)}</div>
          </Card>

          {/* Coin Balance Card */}
          <Card className="p-4 rounded-xl shadow-md w-full bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="bg-amber-200 p-3 rounded-lg">
                <Coins className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Số Coin hiện có</p>
                {loadingCoin ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {coinBalance?.toLocaleString('vi-VN') || '0'}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

      {/* Btn Edit */}
      <div className="mt-6 flex justify-center col-span-2">
        <Button
          className="flex items-center gap-2 px-6 py-2 rounded-lg shadow-md bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
          onClick={() => setIsEditModalOpen(true)}
        >
          <FaEdit className="w-4 h-4" />
          Chỉnh sửa thông tin
        </Button>
      </div>

    

      </div>

      <EditUserInfoModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleSaveUserInfo}
      />
    </>
  );
}



