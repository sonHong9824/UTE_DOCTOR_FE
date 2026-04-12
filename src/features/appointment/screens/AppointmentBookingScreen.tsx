"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { useAppointmentBooking } from "@/features/appointment/hooks/useAppointmentBooking";
import { TimeHelper } from "@/lib/time";

export default function AppointmentBookingScreen() {
  const {
    formData,
    loading,
    showSuccessModal,
    successMessage,
    showErrorModal,
    errorMessage,
    timeSlots,
    coinBalance,
    loadingCoin,
    specialtySearchTerm,
    specialtySuggestions,
    doctorSearchTerm,
    doctorSuggestions,
    isDoctorFocused,
    showSpecialtySuggestions,
    canUseCoinPayment,
    bookingLifecycleState,
    pendingAppointmentId,
    paymentUrl,

    setShowSuccessModal,
    setShowErrorModal,
    setIsDoctorFocused,
    setShowSpecialtySuggestions,

    handleChange,
    handleDateChange,
    handleSpecialtySearch,
    handleSelectSpecialty,
    handleSpecialtyBlur,
    handleDoctorSearch,
    handleDoctorSelect,
    handleDoctorBlur,
    handleSubmit,
    handleRetryStatusCheck,
    openPaymentWindow,
    getTimeSlotDisplay,
  } = useAppointmentBooking();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Đặt Lịch Khám Bệnh</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Thông tin bệnh viện</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên Bệnh viện *</label>
                  <input
                    value={formData.hospitalName}
                    disabled
                    onChange={(e) => handleChange("hospitalName", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên Khoa *</label>

                  <input
                    type="text"
                    value={specialtySearchTerm}
                    onChange={(e) => {
                      handleSpecialtySearch(e.target.value);
                      setShowSpecialtySuggestions(true);
                    }}
                    onBlur={handleSpecialtyBlur}
                    onFocus={() => setShowSpecialtySuggestions(true)}
                    placeholder="Nhập để tìm chuyên khoa..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  {showSpecialtySuggestions && specialtySuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full border border-gray-300 bg-white rounded-lg mt-1 max-h-60 overflow-y-auto shadow-md">
                      {specialtySuggestions.map((spec) => (
                        <li
                          key={spec._id}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                          onClick={() => handleSelectSpecialty(spec)}
                        >
                          {spec.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-900">Thông tin bác sĩ</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm bác sĩ *</label>
                <input
                  type="text"
                  value={doctorSearchTerm}
                  onFocus={() => setIsDoctorFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsDoctorFocused(false), 150);
                    handleDoctorBlur();
                  }}
                  onChange={(e) => handleDoctorSearch(e.target.value)}
                  placeholder="Nhập tên bác sĩ..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                {doctorSuggestions.length > 0 && isDoctorFocused && (
                  <ul className="border border-gray-300 mt-1 rounded-lg max-h-60 overflow-y-auto bg-white shadow-md">
                    {doctorSuggestions.map((doc) => (
                      <li
                        key={doc.id}
                        className="px-4 py-2 cursor-pointer hover:bg-purple-100"
                        onClick={() => {
                          handleDoctorSelect(doc);
                          setIsDoctorFocused(false);
                        }}
                      >
                        {doc.name}
                      </li>
                    ))}
                  </ul>
                )}

                {doctorSuggestions.length === 0 && doctorSearchTerm && (
                  <p className="text-sm text-amber-600 mt-2">Không tìm thấy bác sĩ phù hợp</p>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Thông tin lịch hẹn</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày và giờ hẹn *</label>
                  <DatePicker
                    value={formData.appointmentDate ? TimeHelper.toSafeDate(formData.appointmentDate) ?? undefined : undefined}
                    onChange={(date) => handleDateChange(date ?? null)}
                    limitDays={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khung Giờ Khám *</label>
                  <select
                    value={formData.timeSlotId}
                    onChange={(e) => handleChange("timeSlotId", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option key="__empty_slot__" value="">-- Chọn khung giờ --</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {getTimeSlotDisplay(slot)}
                      </option>
                    ))}
                  </select>
                  {formData.timeSlotId && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">ID: {formData.timeSlotId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại Dịch Vụ (ServiceType) *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => handleChange("serviceType", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="KHAM_DICH_VU">Khám dịch vụ</option>
                    <option value="KHAM_BHYT">Khám BHYT</option>
                    <option value="KHAM_TONG_QUAT">Khám tổng quát</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý do khám *</label>
                  <textarea
                    value={formData.reasonForAppointment}
                    onChange={(e) => handleChange("reasonForAppointment", e.target.value)}
                    placeholder="Mô tả ngắn về lý do khám"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-5 rounded-xl">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">Thông tin thanh toán</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương Thức Thanh Toán *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange("paymentMethod", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="ONLINE">VNPay (Sandbox)</option>
                    <option value="COIN">
                      Dùng Coin
                      {!loadingCoin && coinBalance > 0 && ` (${coinBalance.toLocaleString("vi-VN")} coins)`}
                    </option>
                    <option value="OFFLINE">Thanh toán tại bệnh viện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) => handleChange("amount", e.target.value ? Number(e.target.value) : 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Bệnh Nhân *</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => handleChange("patientEmail", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div> */}
              </div>

              {canUseCoinPayment && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Thanh toán bằng Coin</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số Coin hiện có: <span className="text-blue-600 font-bold">{coinBalance}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số Coin để dùng *</label>
                      <input
                        type="number"
                        value={formData.coinsToUse || 0}
                        onChange={(e) => {
                          const value = Math.min(Number(e.target.value) || 0, coinBalance);
                          handleChange("coinsToUse", value);
                          handleChange("useCoin", value > 0);
                        }}
                        max={coinBalance}
                        min={0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập số coin muốn dùng"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : bookingLifecycleState === "PENDING_PAYMENT" ? "Đang chờ thanh toán" : "Đặt Lịch Khám"}
            </button>

            {bookingLifecycleState === "PENDING_PAYMENT" && pendingAppointmentId && (
              <div className="mt-4 p-4 rounded-xl border border-amber-300 bg-amber-50">
                <h4 className="font-semibold text-amber-800">Trạng thái: Chờ thanh toán</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Mã lịch hẹn: <span className="font-mono">{pendingAppointmentId}</span>
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Hệ thống sẽ tự động kiểm tra trạng thái sau thanh toán. Bạn cũng có thể kiểm tra thủ công.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleRetryStatusCheck}
                    className="px-3 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Kiểm tra trạng thái
                  </button>
                  {paymentUrl && (
                    <button
                      onClick={openPaymentWindow}
                      className="px-3 py-2 text-sm rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      Mở lại cổng thanh toán
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Thành công</h3>
                <p className="text-sm text-gray-700 mb-4">{successMessage}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {showErrorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg border-l-4 border-red-500">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Lỗi</h3>
                <p className="text-sm text-gray-700 mb-4">{errorMessage}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
