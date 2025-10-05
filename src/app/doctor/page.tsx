import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, HeartPulse, Users, TrendingUp, Clock, AlertTriangle, CheckCircle2, Plus, ArrowRight, MoreVertical, ChevronRight, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const kpis = [
  { 
    label: "Bệnh nhân hôm nay", 
    value: 12, 
    change: "+2", 
    icon: Users, 
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  { 
    label: "Lịch hẹn sắp tới", 
    value: 5, 
    change: "-1", 
    icon: Calendar, 
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  },
  { 
    label: "Kết quả cần duyệt", 
    value: 3, 
    change: "+1", 
    icon: ClipboardList, 
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  { 
    label: "Cảnh báo sức khỏe", 
    value: 2, 
    change: "0", 
    icon: HeartPulse, 
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30"
  },
];

const upcomingAppointments = [
  { 
    time: "08:30", 
    name: "Trần Thị B", 
    avatar: "/assets/bs/bs-Minh.jpg", 
    reason: "Khám tổng quát", 
    status: "pending", 
    priority: "normal" 
  },
  { 
    time: "09:15", 
    name: "Nguyễn Văn C", 
    avatar: "/assets/bs/bs-Minh.jpg", 
    reason: "Tái khám tim mạch", 
    status: "pending", 
    priority: "high" 
  },
  { 
    time: "10:00", 
    name: "Lê Minh D", 
    avatar: "/assets/bs/bs-Minh.jpg", 
    reason: "Xét nghiệm máu", 
    status: "pending", 
    priority: "normal" 
  },
  { 
    time: "10:45", 
    name: "Phạm Thu E", 
    avatar: "/assets/bs/bs-Minh.jpg", 
    reason: "Tư vấn từ xa", 
    status: "pending", 
    priority: "low" 
  },
];

const quickTasks = [
  { id: 1, task: "Gọi tư vấn cho bệnh nhân hậu phẫu", completed: false, urgent: true },
  { id: 2, task: "Kiểm tra kết quả xét nghiệm của phòng 302", completed: false, urgent: false },
  { id: 3, task: "Chuẩn bị báo cáo tuần", completed: true, urgent: false },
  { id: 4, task: "Cập nhật hồ sơ bệnh nhân mới", completed: false, urgent: false },
];

const recentPatients = [
  { 
    name: "Nguyễn Thị Hoa", 
    age: 45, 
    gender: "Nữ", 
    condition: "Tăng huyết áp", 
    lastVisit: "Hôm nay", 
    status: "stable",
    avatar: "/assets/bs/bs-Minh.jpg"
  },
  { 
    name: "Trần Văn Bình", 
    age: 62, 
    gender: "Nam", 
    condition: "Đau thắt ngực", 
    lastVisit: "Hôm qua", 
    status: "warning",
    avatar: "/assets/bs/bs-Minh.jpg"
  },
  { 
    name: "Lê Thị Mai", 
    age: 35, 
    gender: "Nữ", 
    condition: "Theo dõi thai kỳ", 
    lastVisit: "3 ngày trước", 
    status: "stable",
    avatar: "/assets/bs/bs-Minh.jpg"
  },
];

const healthMetrics = [
  { label: "Huyết áp", value: 75, target: 100, unit: "mmHg", trend: "stable" },
  { label: "Đường huyết", value: 60, target: 100, unit: "mg/dL", trend: "improving" },
  { label: "Cholesterol", value: 85, target: 100, unit: "mg/dL", trend: "worsening" },
];

export default function DoctorOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Tổng quan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Chào mừng trở lại, Dr. Nguyễn Văn Minh</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-9 px-3 text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm lịch hẹn
          </Button>
          <Button className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Calendar className="w-4 h-4 mr-2" />
            Xem lịch
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{kpi.change}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Lịch hẹn hôm nay</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Quản lý lịch hẹn của bạn</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0">
                <Link href="/doctor/schedule" className="flex items-center">
                  Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex-shrink-0 w-16 text-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{appointment.time}</span>
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={appointment.avatar} alt={appointment.name} />
                      <AvatarFallback>{appointment.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{appointment.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.reason}</p>
                    </div>
                    
                    <Badge variant={appointment.priority === 'high' ? 'destructive' : appointment.priority === 'normal' ? 'default' : 'outline'} className="ml-auto">
                      {appointment.priority === 'high' ? 'Ưu tiên' : appointment.priority === 'normal' ? 'Thường' : 'Thấp'}
                    </Badge>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Bệnh nhân gần đây</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">Theo dõi tình trạng bệnh nhân</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0">
                <Link href="/doctor/patients" className="flex items-center">
                  Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPatients.map((patient, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{patient.name}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {patient.age} tuổi, {patient.gender}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{patient.condition}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Khám gần nhất</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{patient.lastVisit}</p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {patient.status === 'stable' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                          Ổn định
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                          Cần theo dõi
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Tasks */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Công việc cần làm</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Quản lý nhiệm vụ hàng ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {task.task}
                      </p>
                    </div>
                    {task.urgent && !task.completed && (
                      <Badge variant="destructive" className="ml-auto">Gấp</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full text-sm">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Thêm công việc
              </Button>
            </CardFooter>
          </Card>

          {/* Health Metrics */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Chỉ số sức khỏe</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Theo dõi chỉ số bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{metric.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.value}%
                        </span>
                        {metric.trend === 'improving' && (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        )}
                        {metric.trend === 'worsening' && (
                          <TrendingUp className="h-4 w-4 text-rose-500 transform rotate-180" />
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className={`h-2 ${
                        metric.trend === 'improving' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                          : metric.trend === 'worsening'
                          ? 'bg-rose-100 dark:bg-rose-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}
                      indicatorClassName={
                        metric.trend === 'improving' 
                          ? 'bg-emerald-500 dark:bg-emerald-400' 
                          : metric.trend === 'worsening'
                          ? 'bg-rose-500 dark:bg-rose-400'
                          : 'bg-blue-500 dark:bg-blue-400'
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Thông báo</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                  3 mới
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Cuộc họp khoa</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cuộc họp khoa sẽ diễn ra vào 15:00 hôm nay</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 giờ trước</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Cảnh báo thuốc</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Thuốc Amoxicillin sắp hết hạn vào ngày 15/10</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 giờ trước</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}