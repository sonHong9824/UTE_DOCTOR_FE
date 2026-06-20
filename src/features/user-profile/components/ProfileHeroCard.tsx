"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import { CalendarDays, Coins, Mail, Pencil } from "lucide-react";

import { formatDateVN, getInitials, getStatusMeta } from "../utils/profile-format";

interface ProfileHeroCardProps {
  user: AccountProfileDTO;
  coinBalance: number | null;
  loadingCoin: boolean;
  onEdit: () => void;
}

// Summary banner at the top of the personal-info tab: avatar, name, status,
// join date and (when available) coin balance.
export default function ProfileHeroCard({
  user,
  coinBalance,
  loadingCoin,
  onEdit,
}: ProfileHeroCardProps) {
  const status = getStatusMeta(user.status);
  const showCoin = loadingCoin || coinBalance !== null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 p-6 shadow-lg shadow-blue-500/20 sm:p-8">
      {/* Soft decorative glows for depth */}
      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <Avatar className="h-24 w-24 border-4 border-white/80 shadow-xl ring-2 ring-white/30 sm:h-28 sm:w-28">
            <AvatarImage
              src={user.avatarUrl}
              alt={user.name || "Ảnh đại diện"}
              className="object-cover object-center"
            />
            <AvatarFallback className="bg-white text-xl font-bold text-blue-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
              {user.name || "Bệnh nhân"}
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sky-50 ring-1 ring-white/15 backdrop-blur-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                Tham gia {formatDateVN(user.createdAt)}
              </span>
            </div>

            {user.email ? (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-sky-100/90 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {showCoin ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2.5 ring-1 ring-white/25 backdrop-blur-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Coins className="h-5 w-5 text-amber-200" />
              </span>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wide text-sky-50/80">
                  Số dư Coin
                </p>
                {loadingCoin ? (
                  <Skeleton className="mt-0.5 h-5 w-16 bg-white/30" />
                ) : (
                  <p className="text-lg font-bold leading-tight text-white">
                    {coinBalance?.toLocaleString("vi-VN") ?? "0"}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          <Button
            onClick={onEdit}
            className="gap-2 rounded-xl bg-white px-5 font-semibold text-blue-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-lg active:translate-y-0"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa thông tin
          </Button>
        </div>
      </div>
    </section>
  );
}
