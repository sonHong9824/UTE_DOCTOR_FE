
import WalletSection from "@/components/wallet/wallet-section";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import UserInfoCard from "../cards/user-info-card";
import ChangePasswordForm from "../forms/account/change-password-form";
import AppointmentForm from "../forms/appointments/appointment-form.draft";
import MedicalRecordDetail from "../medical-record/medical-record-detail";
import MedicalRecordDisplay from "../medical-record/medical-record-display";
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
    <div className="flex-1 p-4">
      {!hasData && (
        <Card className="w-full mb-4 px-4 py-3 border">
          <CardTitle className="text-base">Chưa có hồ sơ y tế</CardTitle>
          <p className="text-sm text-gray-600">Bạn có thể cập nhật thông tin y tế trong mục "Chi tiết y tế".</p>
        </Card>
      )}
      {activeTab === "general-health" && <MedicalRecordDisplay user={user} />}
      
      {activeTab === "personal-info" && (
          <UserInfoCard user={user.accountProfileDto}/>
      )}

      {activeTab === "password" && (
        <Card className="w-full md:w-3/4 px-6 py-4 border border-gray-300 shadow-md">
          <CardTitle className="text-2xl mb-4">Đổi mật khẩu</CardTitle>
          <ChangePasswordForm />
        </Card>
      )}

      {activeTab === "medical-detail" && <MedicalRecordDetail user={user} />}
      {activeTab === "appointments" && <AppointmentForm />}
      {activeTab === "wallet" && (
        // <div className="w-full space-y-6">
        //   {/* Wallet Header */}
        //   <div className="flex justify-between items-center">
        //     <div>
        //       <h2 className="text-3xl font-bold">Ví Điện Tử</h2>
        //       <p className="text-gray-600 mt-1">Quản lý Coin và lịch sử giao dịch</p>
        //     </div>
        //     <WalletBalance />
        //   </div>

        //   {/* Wallet Tabs */}
        //   <div className="space-y-4">
        //     {/* Balance Details */}
        //     <div>
        //       <h3 className="text-xl font-semibold mb-3">Chi tiết số dư</h3>
        //       <WalletDetailsCard/>
        //     </div>
        //   </div>

        //   {/* Info Cards */}
        //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        //     {/* Coin Rules */}
        //     <Card className="border border-gray-300">
        //       <div className="px-6 py-4">
        //         <CardTitle className="text-lg mb-4">Cách kiếm Coin</CardTitle>
        //         <div className="space-y-3">
        //           <div className="flex gap-3">
        //             <div className="text-2xl">1️⃣</div>
        //             <div>
        //               <p className="font-medium text-sm">Hoãn lịch hẹn</p>
        //               <p className="text-xs text-gray-600">Nhận 80% phí tư vấn dưới dạng Coin</p>
        //             </div>
        //           </div>
        //           <div className="flex gap-3">
        //             <div className="text-2xl">2️⃣</div>
        //             <div>
        //               <p className="font-medium text-sm">Hủy lịch hẹn</p>
        //               <p className="text-xs text-gray-600">Nhận 100% phí tư vấn dưới dạng Coin</p>
        //             </div>
        //           </div>
        //           <div className="flex gap-3">
        //             <div className="text-2xl">3️⃣</div>
        //             <div>
        //               <p className="font-medium text-sm">Ưu đãi khách hàng</p>
        //               <p className="text-xs text-gray-600">Nhận Coin từ các chương trình khuyến mãi</p>
        //             </div>
        //           </div>
        //         </div>
        //       </div>
        //     </Card>

        //     {/* Coin Usage */}
        //     <Card className="border border-gray-300">
        //       <div className="px-6 py-4">
        //         <CardTitle className="text-lg mb-4">Cách dùng Coin</CardTitle>
        //         <div className="space-y-3">
        //           <div className="flex gap-3">
        //             <div className="text-2xl">💳</div>
        //             <div>
        //               <p className="font-medium text-sm">Thanh toán lịch hẹn</p>
        //               <p className="text-xs text-gray-600">Dùng Coin để thanh toán phí khám bệnh</p>
        //             </div>
        //           </div>
        //           <div className="flex gap-3">
        //             <div className="text-2xl">🎁</div>
        //             <div>
        //               <p className="font-medium text-sm">Nhận quà tặng</p>
        //               <p className="text-xs text-gray-600">Đổi Coin để nhận các quà tặng đặc biệt</p>
        //             </div>
        //           </div>
        //           <div className="flex gap-3">
        //             <div className="text-2xl">⭐</div>
        //             <div>
        //               <p className="font-medium text-sm">Nâng cấp VIP</p>
        //               <p className="text-xs text-gray-600">Dùng Coin để nâng cấp thành viên VIP</p>
        //             </div>
        //           </div>
        //         </div>
        //       </div>
        //     </Card>
        //   </div>
        // </div>
        <WalletSection patientId={localStorage.getItem("patientId")!} email={localStorage.getItem("email")!} />
      )}
    </div>
  );
}
