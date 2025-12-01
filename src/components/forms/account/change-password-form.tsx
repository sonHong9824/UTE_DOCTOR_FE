import { useState } from "react";
import { ChangePassword } from "@/apis/user/user.api";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Vui lòng điền đầy đủ mật khẩu");
      return;
    }
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await ChangePassword({ currentPassword, newPassword });
      if (res?.code === 0 || res?.code === 200 || res?.code === undefined) {
        alert("Đổi mật khẩu thành công");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(res?.message || "Đổi mật khẩu thất bại");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi khi đổi mật khẩu";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

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
