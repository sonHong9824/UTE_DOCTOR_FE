
import UserInfoCard from "../cards/user-info-card";
import AppointmentForm from "../forms/appointments/appointment-form.draft";
import MedicalRecordDetail from "../medical-record/medical-record-detail";
import MedicalRecordDisplay from "../medical-record/medical-record-display";
import { Card, CardTitle } from "../ui/card";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";

interface UserContentProps {
  user: PatientProfileDto;
  activeTab: string;
}

export default function UserContent({ user, activeTab }: UserContentProps) {
  if (!user.medicalRecord) {
    return <p>Chưa có hồ sơ y tế</p>;
  }
  return (
    <div className="flex-1 p-4">
      {activeTab === "general-health" && <MedicalRecordDisplay medicalRecord={user.medicalRecord} />}
      
      {activeTab === "personal-info" && (
          <UserInfoCard user={user.accountProfileDto}/>
      )}

      {activeTab === "password" && (
        <Card className="w-full md:w-3/4 px-6 py-4 border border-gray-300 shadow-md">
          <CardTitle className="text-2xl mb-4">Đổi mật khẩu</CardTitle>
          {/* Form đổi mật khẩu */}
        </Card>
      )}

      {activeTab === "medical-detail" && <MedicalRecordDetail medicalRecord={user.medicalRecord} />}
      {activeTab === "appointments" && <AppointmentForm />}
    </div>
  );
}
