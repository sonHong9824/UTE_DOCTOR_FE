import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import {
  BellRing,
  CalendarDays,
  FileHeart,
  HeartPulse,
  Lock,
  User,
  WalletCards,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile?: AccountProfileDTO;
  compact?: boolean;
}

const tabs = [
  { id: "general-health", label: "Sức khỏe tổng quát", icon: HeartPulse },
  { id: "personal-info", label: "Thông tin cá nhân", icon: User },
  { id: "password", label: "Mật khẩu", icon: Lock },
  { id: "medical-detail", label: "Chi tiết bệnh lý", icon: FileHeart },
  { id: "appointments", label: "Đăng ký lịch hẹn", icon: CalendarDays },
  { id: "notifications", label: "Thông báo", icon: BellRing },
  { id: "wallet", label: "Ví điện tử", icon: WalletCards },
] as const;

export default function Sidebar({
  activeTab,
  setActiveTab,
  profile,
  compact = false,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "bg-[var(--sidebar)] text-[var(--sidebar-foreground)]",
        compact
          ? "w-full border-b px-3 py-3"
          : "h-full w-64 overflow-y-auto border-r border-[var(--sidebar-border)] px-4 py-5"
      )}
    >
      {!compact && profile ? (
        <div className="mb-5 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 dark:border-sky-900/50 dark:from-sky-950/40 dark:to-cyan-950/30">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white bg-white shadow-sm">
              <AvatarImage src={profile.avatarUrl} alt={profile.name || "Ảnh đại diện bệnh nhân"} />
              <AvatarFallback className="bg-sky-100 font-semibold text-sky-700">
                {(profile.name || "BN")
                  .split(" ")
                  .slice(-2)
                  .map((part) => part.charAt(0))
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{profile.name || "Bệnh nhân"}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                Hồ sơ sức khỏe cá nhân
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <nav aria-label="Điều hướng hồ sơ bệnh nhân">
        <ul
          className={cn(
            compact ? "flex gap-2 overflow-x-auto pb-1" : "space-y-1.5"
          )}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <li key={tab.id} className={compact ? "shrink-0" : undefined}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
                    compact ? "whitespace-nowrap px-3 py-2" : "w-full px-3 py-3 text-left",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
