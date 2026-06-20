"use client";

import EditUserInfoModal from "@/components/cards/edit-user-info-modal";
import AccountSecurityCard from "@/features/user-profile/components/AccountSecurityCard";
import ProfileHeroCard from "@/features/user-profile/components/ProfileHeroCard";
import ProfileInfoCard, {
  type ProfileInfoItem,
} from "@/features/user-profile/components/ProfileInfoCard";
import { useUserInfoCard } from "@/features/user-profile/hooks/useUserInfoCard";
import {
  formatDateVN,
  displayOrEmpty,
  getGenderLabel,
  getStatusMeta,
} from "@/features/user-profile/utils/profile-format";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import {
  Cake,
  CalendarDays,
  Clock,
  Contact,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";

interface UserInfoCardProps {
  user: AccountProfileDTO;
  onUserUpdated?: (updatedUser: AccountProfileDTO) => void;
  // UI-only navigation to another profile tab (e.g. the password tab).
  onNavigateToTab?: (tab: string) => void;
}

export default function UserInfoCard({ user, onUserUpdated, onNavigateToTab }: UserInfoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { coinBalance, loadingCoin, handleSaveUserInfo } = useUserInfoCard(onUserUpdated);

  const status = getStatusMeta(user.status);

  const basicInfo: ProfileInfoItem[] = [
    { label: "Họ và tên", value: user.name || "Chưa cập nhật", icon: User },
    { label: "Giới tính", value: getGenderLabel(user.gender), icon: Users },
    { label: "Ngày sinh", value: formatDateVN(user.dateOfBirth), icon: Cake },
  ];

  const contactInfo: ProfileInfoItem[] = [
    { label: "Email", value: displayOrEmpty(user.email), icon: Mail },
    { label: "Điện thoại", value: displayOrEmpty(user.phoneNumber), icon: Phone },
    { label: "Địa chỉ", value: displayOrEmpty(user.address), icon: MapPin },
  ];

  const accountInfo: ProfileInfoItem[] = [
    {
      label: "Trạng thái",
      icon: ShieldCheck,
      value: (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      ),
    },
    { label: "Ngày tham gia", value: formatDateVN(user.createdAt), icon: CalendarDays },
    { label: "Cập nhật lần cuối", value: formatDateVN(user.updatedAt), icon: Clock },
  ];

  return (
    <>
      <div className="space-y-5">
        <ProfileHeroCard
          user={user}
          coinBalance={coinBalance}
          loadingCoin={loadingCoin}
          onEdit={() => setIsEditModalOpen(true)}
        />

        <div className="grid items-start gap-5 lg:grid-cols-2">
          <ProfileInfoCard
            title="Thông tin cơ bản"
            titleIcon={IdCard}
            accentClass="from-sky-500 to-blue-600"
            items={basicInfo}
          />
          <ProfileInfoCard
            title="Liên hệ & địa chỉ"
            titleIcon={Contact}
            accentClass="from-cyan-500 to-sky-600"
            items={contactInfo}
          />
          <ProfileInfoCard
            title="Trạng thái & thông tin khác"
            titleIcon={ShieldCheck}
            accentClass="from-blue-500 to-indigo-600"
            items={accountInfo}
          />
          {onNavigateToTab ? (
            <AccountSecurityCard onNavigate={() => onNavigateToTab("password")} />
          ) : null}
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
