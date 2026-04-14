import LoginForm from "@/features/auth/components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-200/15 rounded-full blur-3xl"></div>
      </div>

      {/* Medical icons floating */}
      <div className="absolute top-10 left-20 text-blue-300/30 animate-pulse">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
      <div className="absolute bottom-20 left-32 text-cyan-300/30 animate-pulse" style={{animationDelay: '1s'}}>
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </div>
      <div className="absolute top-32 right-24 text-teal-300/30 animate-pulse" style={{animationDelay: '0.5s'}}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      <div className="flex w-full max-w-6xl mx-4 relative z-10">
        <div className="flex w-full shadow-2xl rounded-3xl overflow-hidden bg-white/95 backdrop-blur-sm border border-white/20">
          
          {/* Left side - Login Form */}
          <div className="w-full md:w-2/5 p-8 lg:p-12 bg-white">
            <div className="max-w-md mx-auto">
              {/* Logo & Header */}
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Doctor +</h1>
                <p className="text-gray-500">Chào mừng trở lại</p>
              </div>

              <LoginForm />
            </div>
          </div>

          {/* Right side - Visual Banner */}
          <div className="hidden md:flex md:w-3/5 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 text-white p-12 lg:p-16 flex-col justify-center items-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
            
            <div className="relative z-10 text-center max-w-lg">
              {/* Large Icon */}
              {/* <div className="mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="M8 14h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M12 18h.01"></path>
                  </svg>
                </div>
              </div> */}

              {/* Heading */}
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Đặt lịch khám<br />dễ dàng
              </h2>
              
              {/* Subtitle */}
              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                Quản lý sức khỏe thông minh với<br />hệ thống đặt lịch hiện đại
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3">
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  Nhanh chóng
                </div>
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  Bảo mật
                </div>
                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                  Tiện lợi
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-4xl font-bold mb-1">15K+</div>
                  <div className="text-blue-100 text-sm">Người dùng</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">50+</div>
                  <div className="text-blue-100 text-sm">Bác sĩ</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">98%</div>
                  <div className="text-blue-100 text-sm">Hài lòng</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}