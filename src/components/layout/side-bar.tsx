import { FileText, Heart, Lock, User } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: "general-health", label: "Sức khỏe tổng quát", icon: <Heart size={20} /> },
    { id: "personal-info", label: "Thông tin cá nhân", icon: <User size={20} /> },
    { id: "password", label: "Mật khẩu", icon: <Lock size={20} /> },
    { id: "medical-detail", label: "Chi tiết bệnh lý", icon: <FileText size={20} /> },
  ];

  return (
    <div
      className="
        w-64 h-screen p-4 rounded-r-xl
        bg-[var(--sidebar)] text-[var(--sidebar-foreground)]
        shadow-lg
      "
    >
      <ul className="space-y-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${isActive 
                  ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-md" 
                  : "hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] hover:shadow-sm"
                }
              `}
            >
              {/* Indicator bên trái cho tab active */}
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-[var(--sidebar-ring)] rounded-tr rounded-br"></span>
              )}
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
