import LoginForm from "@/app/(auth)/login/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full max-w-5xl shadow-lg rounded-2xl overflow-hidden border">
        {/* Cột bên trái: Form */}
        <div className="flex w-full md:w-2/5 items-center justify-center bg-white p-8">
          <Card className="w-full border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Đăng nhập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>

        {/* Cột bên phải: Mô tả */}
        <div className="hidden md:flex w-3/5 bg-primary text-primary-foreground items-center justify-center p-10 flex-col">
          <h1 className="text-3xl font-bold mb-4">Chào mừng trở lại!</h1>
          <p className="text-base text-white/90 leading-relaxed max-w-md text-center">
            Hãy đăng nhập để tiếp tục quản lý thông tin, đặt dịch vụ và tận
            hưởng trải nghiệm tốt nhất.
          </p>
        </div>
      </div>
    </div>
  );
}
