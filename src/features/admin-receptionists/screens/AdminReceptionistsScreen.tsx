"use client";

import { useState } from "react";
import { Plus, Search, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ReceptionistCreateForm } from "@/features/admin-receptionists/components/ReceptionistCreateForm";
import { ReceptionistList } from "@/features/admin-receptionists/components/ReceptionistList";
import { useAdminReceptionistCreation } from "@/features/admin-receptionists/hooks/useAdminReceptionistCreation";

export default function AdminReceptionistsScreen() {
  const [openCreate, setOpenCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const {
    form,
    errors,
    submitting,
    receptionists,
    loadingList,
    listError,
    search,
    page,
    pagination,
    updateField,
    setSearch,
    setPage,
    retryList,
    submit,
  } = useAdminReceptionistCreation();

  const handleCreate = async () => {
    const created = await submit();
    if (created) setOpenCreate(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Quản lý hồ sơ và thông tin lễ tân trong hệ thống
          </p>
          <Button
            onClick={() => setOpenCreate(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-700"
          >
            <Plus className="mr-2 size-4.5" />
            Thêm lễ tân mới
          </Button>
        </div>

        <Card className="cursor-default hover:scale-100">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email lễ tân"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  aria-label="Hiển thị dạng lưới"
                  onClick={() => setViewMode("grid")}
                  className={`rounded px-3 py-1.5 ${
                    viewMode === "grid"
                      ? "bg-white shadow dark:bg-slate-700"
                      : ""
                  }`}
                >
                  <span className="grid h-4 w-4 grid-cols-2 gap-0.5">
                    <span className="rounded-sm bg-gray-600" />
                    <span className="rounded-sm bg-gray-600" />
                    <span className="rounded-sm bg-gray-600" />
                    <span className="rounded-sm bg-gray-600" />
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Hiển thị dạng danh sách"
                  onClick={() => setViewMode("list")}
                  className={`rounded px-3 py-1.5 ${
                    viewMode === "list"
                      ? "bg-white shadow dark:bg-slate-700"
                      : ""
                  }`}
                >
                  <span className="flex h-4 w-4 flex-col gap-1">
                    <span className="h-0.5 rounded bg-gray-600" />
                    <span className="h-0.5 rounded bg-gray-600" />
                    <span className="h-0.5 rounded bg-gray-600" />
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ReceptionistList
          receptionists={receptionists}
          loading={loadingList}
          error={listError}
          search={search}
          page={page}
          totalPages={pagination.totalPages}
          viewMode={viewMode}
          onPageChange={setPage}
          onRetry={() => void retryList()}
          onClearSearch={() => setSearch("")}
        />
      </div>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-h-[90vh] w-[98vw] max-w-[760px] overflow-y-auto p-0">
          <DialogHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 pb-4 pt-6 dark:from-slate-800 dark:to-slate-900">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
                <UserRoundCheck className="size-5" />
              </span>
              Tạo tài khoản lễ tân mới
            </DialogTitle>
            <DialogDescription>
              Tạo Account và Profile lễ tân. Mật khẩu tạm thời sẽ được hệ thống
              gửi qua email.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            <ReceptionistCreateForm
              form={form}
              errors={errors}
              submitting={submitting}
              onFieldChange={updateField}
              onSubmit={() => void handleCreate()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
