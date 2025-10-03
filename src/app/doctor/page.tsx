import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClipboardList, HeartPulse, Users } from "lucide-react";

const kpis = [
  { label: "Bệnh nhân hôm nay", value: 12, icon: Users, color: "text-blue-600" },
  { label: "Lịch hẹn sắp tới", value: 5, icon: Calendar, color: "text-emerald-600" },
  { label: "Kết quả cần duyệt", value: 3, icon: ClipboardList, color: "text-amber-600" },
  { label: "Cảnh báo sức khỏe", value: 2, icon: HeartPulse, color: "text-rose-600" },
];

const upcomingAppointments = [
  { time: "08:30", name: "Trần Thị B", reason: "Khám tổng quát" },
  { time: "09:15", name: "Nguyễn Văn C", reason: "Tái khám tim mạch" },
  { time: "10:00", name: "Lê Minh D", reason: "Xét nghiệm máu" },
  { time: "10:45", name: "Phạm Thu E", reason: "Tư vấn từ xa" },
];

export default function DoctorOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tổng quan</h2>
        <p className="text-muted-foreground">Bảng điều khiển nhanh cho bác sĩ</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-md cursor-default">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="cursor-default">
          <CardHeader>
            <CardTitle>Lịch hẹn sắp tới</CardTitle>
            <CardDescription>Trong buổi sáng hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {upcomingAppointments.map((a, idx) => (
                <li key={idx} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-14">{a.time}</span>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-sm text-muted-foreground">{a.reason}</p>
                    </div>
                  </div>
                  <button className="text-primary text-sm hover:underline">Xem</button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-default">
          <CardHeader>
            <CardTitle>Ghi chú nhanh</CardTitle>
            <CardDescription>Những việc cần làm trong ngày</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Gọi tư vấn cho bệnh nhân hậu phẫu</li>
              <li>Kiểm tra kết quả xét nghiệm của phòng 302</li>
              <li>Chuẩn bị báo cáo tuần</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
