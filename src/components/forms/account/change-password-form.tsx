import { useChangePassword } from "@/features/user-profile/hooks/useChangePassword";

export default function ChangePasswordForm() {
  // UI-only component: delegates logic to view-model hook.
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    loading,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit,
  } = useChangePassword();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full md:w-3/4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
      </div>
    </form>
  );
}
