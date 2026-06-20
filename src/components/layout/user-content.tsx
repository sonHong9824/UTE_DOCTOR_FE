
import AppointmentForm from "@/features/appointment/components/AppointmentForm";
import AppointmentHistoryScreen from "@/features/appointment-history/screens/AppointmentHistoryScreen";
import MedicalRecordDetailScreen from "@/features/medical-record/screens/MedicalRecordDetailScreen";
import NotificationCenterScreen from "@/features/notification/screens/NotificationCenterScreen";
import PatientHealthDashboardScreen from "@/features/patient-health/screens/PatientHealthDashboardScreen";
import ProfileTabShell from "@/features/user-profile/components/ProfileTabShell";
import WalletScreen from "@/features/wallet/screens/WalletScreen";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import UserInfoCard from "../cards/user-info-card";
import ChangePasswordForm from "../forms/account/change-password-form";
import { Card, CardTitle } from "../ui/card";


interface UserContentProps {
  user: PatientProfileDto;
  activeTab: string;
  // UI-only tab navigation, used by in-tab shortcuts (e.g. Account security).
  setActiveTab?: (tab: string) => void;
}

export default function UserContent({ user, activeTab, setActiveTab }: UserContentProps) {
  // Check new collections first, fallback to legacy
  const hasData =
    user.medicalProfile ||
    (user.encounters && user.encounters.length > 0) ||
    (user.allergies && user.allergies.length > 0) ||
    (user.medicalHistory && user.medicalHistory.length > 0) ||
    user.medicalRecord;
  // Do not block the page for empty profiles; show tabs with components.
  // Individual components handle empty states internally.

  const renderTabContent = () => {
    switch (activeTab) {
      case "general-health":
        return <PatientHealthDashboardScreen />;
      case "personal-info":
        return <UserInfoCard user={user.accountProfileDto} onNavigateToTab={setActiveTab} />;
      case "password":
        return <ChangePasswordForm />;
      case "medical-detail":
        return (
          <div className="space-y-4">
            {!hasData && (
              <Card className="w-full mb-4 px-4 py-3 border">
                <CardTitle className="text-base">Chưa có hồ sơ y tế</CardTitle>
                <p className="text-sm text-gray-600">
                  Bạn có thể cập nhật thông tin y tế trong mục &quot;Chi tiết bệnh lý&quot;.
                </p>
              </Card>
            )}
            <MedicalRecordDetailScreen user={user} onNavigateToTab={setActiveTab} />
          </div>
        );
      case "appointment-history":
        return <AppointmentHistoryScreen />;
      case "appointments":
        return <AppointmentForm />;
      case "notifications":
        return <NotificationCenterScreen />;
      case "wallet":
        return <WalletScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-w-0 flex-1">
      <ProfileTabShell tabKey={activeTab}>{renderTabContent()}</ProfileTabShell>
    </div>
  );
}
