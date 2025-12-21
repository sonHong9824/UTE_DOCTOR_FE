"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDoctorById } from "@/apis/admin/admin.api";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  ArrowLeft,
  Heart,
  Calendar,
} from "lucide-react";

interface Doctor {
  _id: string;
  doctorName: string;
  profile?: {
    avatarUrl: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    dob: string;
  };
  profileId?: any;
  chuyenKhoa?: {
    name: string;
    description: string;
  };
  chuyenKhoaId?: any;
  degree?: string[];
  academic?: string;
  bio?: string;
  achievements?: string[];
  yearsOfExperience?: number;
  topReviews?: any[];
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bio" | "achievements">("bio");

  useEffect(() => {
    if (!doctorId) return;

    const fetchDoctor = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDoctorById(doctorId);
        const doctorData = res?.data || res;
        setDoctor(doctorData);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin bác sĩ:", err);
        setError("Không thể tải thông tin bác sĩ. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-80 bg-gray-200 rounded-2xl"></div>
            <div className="h-12 bg-gray-200 rounded w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Không tìm thấy thông tin bác sĩ"}
            </h2>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const specialty = doctor?.chuyenKhoa?.name ?? doctor?.chuyenKhoaId?.name ?? "Chuyên khoa";
  const avatarUrl =
    doctor?.profile?.avatarUrl ?? doctor?.profileId?.avatarUrl ?? "";
  const doctorName =
    doctor?.doctorName ?? doctor?.profile?.name ?? doctor?.profileId?.name ?? "Bác sĩ";
  const email = doctor?.profile?.email ?? doctor?.profileId?.email ?? "";
  const phone = doctor?.profile?.phone ?? doctor?.profileId?.phone ?? "";
  const address = doctor?.profile?.address ?? doctor?.profileId?.address ?? "";
  const bio = doctor?.bio ?? "";
  const degrees = doctor?.degree ?? [];
  const achievements = doctor?.achievements ?? [];
  const experience = doctor?.yearsOfExperience ?? 0;
  const academic = doctor?.academic || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        {/* <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button> */}

        {/* Doctor Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-blue-000 via-blue-100 to-cyan-000"></div>

          <div className="px-6 sm:px-8 pb-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row gap-8 -mt-20 mb-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={doctorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 pt-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {doctorName}
                </h1>

                {/* Academic Title & Specialty */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {academic && (
                    <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {academic}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <Stethoscope className="w-4 h-4" />
                    {specialty}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold mb-1">
                      <Briefcase className="w-4 h-4" />
                      Kinh nghiệm
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {experience}
                    </p>
                    <p className="text-xs text-gray-600">Năm</p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-600 font-semibold mb-1">
                      {/* <Star className="w-4 h-4" /> */}
                      Đánh giá
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {doctor?.topReviews?.length ?? 0}
                    </p>
                    <p className="text-xs text-gray-600">Bình luận</p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                      {/* <Award className="w-4 h-4" /> */}
                      Bằng cấp
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {degrees.length}
                    </p>
                    <p className="text-xs text-gray-600">Chứng chỉ</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="flex flex-col gap-3 pt-8">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md">
                  <Calendar className="w-5 h-5" />
                  Đặt lịch khám
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all">
                  <Heart className="w-5 h-5" />
                  Yêu thích
                </button>
              </div> */}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Thông tin liên hệ
                </h3>

                {email && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600 mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900 font-semibold">{email}</p>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Điện thoại</p>
                      <p className="text-gray-900 font-semibold">{phone}</p>
                    </div>
                  </div>
                )}

                {address && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="text-gray-900 font-semibold">{address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Specialty Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Chuyên ngành
                </h3>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-blue-900 mb-2">
                    {specialty}
                  </h4>
                  {doctor?.chuyenKhoa?.description && (
                    <p className="text-sm text-blue-700">
                      {doctor.chuyenKhoa.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div>
              <div className="flex gap-2 mb-6 border-b">
                <button
                  onClick={() => setActiveTab("bio")}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === "bio"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tiểu sử
                </button>
                <button
                  onClick={() => setActiveTab("achievements")}
                  className={`px-6 py-3 font-semibold border-b-2 transition ${
                    activeTab === "achievements"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Thành tựu & Bằng cấp
                </button>
              </div>

              {/* Bio Tab */}
              {activeTab === "bio" && (
                <div className="space-y-8">
                  {bio && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Giới thiệu
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {bio}
                      </div>
                    </div>
                  )}

                  {degrees.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Bằng cấp
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {degrees.map((degree, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 bg-blue-50 rounded-lg p-4"
                          >
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                            <span className="text-gray-900 font-semibold">
                              {degree}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === "achievements" && (
                <div className="space-y-6">
                  {achievements.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {/* <Award className="w-5 h-5 text-amber-600" /> */}
                        Thành tựu & Giải thưởng
                      </h3>
                      <div className="space-y-3">
                        {achievements.map((achievement, idx) => (
                          <div
                            key={idx}
                            className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-600"
                          >
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                              {achievement}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">Chưa có thông tin thành tựu.</p>
                  )}

                  {degrees.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {/* <GraduationCap className="w-5 h-5 text-blue-600" /> */}
                        Bằng cấp
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {degrees.map((degree, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 bg-blue-50 rounded-lg p-4"
                          >
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                            <span className="text-gray-900 font-semibold">
                              {degree}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Doctors Section */}
        {/* <div className="mt-16 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Các bác sĩ cùng chuyên khoa
          </h2>
          <p className="text-gray-600 text-center py-12 bg-white rounded-2xl">
            Đang tải danh sách bác sĩ cùng chuyên khoa...
          </p>
        </div> */}
      </div>

      <Footer />
    </div>
  );
}
