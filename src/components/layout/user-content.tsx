
import AppointmentForm from "@/features/appointment/components/AppointmentForm";
import MedicalRecordDetailScreen from "@/features/medical-record/screens/MedicalRecordDetailScreen";
import NotificationCenterScreen from "@/features/notification/screens/NotificationCenterScreen";
import PatientHealthDashboardScreen from "@/features/patient-health/screens/PatientHealthDashboardScreen";
import WalletScreen from "@/features/wallet/screens/WalletScreen";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import UserInfoCard from "../cards/user-info-card";
import ChangePasswordForm from "../forms/account/change-password-form";
import { Card, CardTitle } from "../ui/card";


interface UserContentProps {
  user: PatientProfileDto;
  activeTab: string;
}

export default function UserContent({ user, activeTab }: UserContentProps) {
  // Check new collections first, fallback to legacy
  const hasData =
    user.medicalProfile ||
    (user.encounters && user.encounters.length > 0) ||
    (user.allergies && user.allergies.length > 0) ||
    (user.medicalHistory && user.medicalHistory.length > 0) ||
    user.medicalRecord;
  // Do not block the page for empty profiles; show tabs with components.
  // Individual components handle empty states internally.
  
  return (
    <div className="w-full min-w-0 flex-1">
      {!hasData && activeTab === "medical-detail" && (
        <Card className="w-full mb-4 px-4 py-3 border">
          <CardTitle className="text-base">Chưa có hồ sơ y tế</CardTitle>
          <p className="text-sm text-gray-600">
            Bạn có thể cập nhật thông tin y tế trong mục &quot;Chi tiết bệnh lý&quot;.
          </p>
        </Card>
      )}
      {activeTab === "general-health" && <PatientHealthDashboardScreen />}
      
      {activeTab === "personal-info" && (
          <UserInfoCard user={user.accountProfileDto}/>
      )}

      {activeTab === "password" && (
        <Card className="w-full md:w-3/4 px-6 py-4 border border-gray-300 shadow-md">
          <CardTitle className="text-2xl mb-4">Đổi mật khẩu</CardTitle>
          <ChangePasswordForm />
        </Card>
      )}

      {activeTab === "medical-detail" && <MedicalRecordDetailScreen user={user} />}
      {activeTab === "appointments" && <AppointmentForm />}
      {activeTab === "notifications" && <NotificationCenterScreen />}
      {activeTab === "wallet" && (
        <WalletScreen />
      )}
    </div>
  );
}

