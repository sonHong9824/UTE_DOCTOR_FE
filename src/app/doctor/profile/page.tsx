
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDoctorById } from "@/apis/doctor/profile.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Calendar, Stethoscope, Award, BookOpen, Users, Briefcase, Heart } from "lucide-react";
import { toast } from "sonner";

interface DoctorData {
  _id: string;
  profileId: {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    gender: string;
    dob: string;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  accountId: string;
  doctorName: string;
  chuyenKhoaId: {
    _id: string;
    name: string;
    description: string;
    status: boolean;
    __v: number;
    createdAt: string;
    updatedAt: string;
  };
  degree: string[];
  academic: string;
  bio: string;
  achievements: string[];
  yearsOfExperience: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function DoctorProfilePage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const doctorId = typeof window !== "undefined" ? localStorage.getItem("doctorId") : null;
        console.log("🔍 Fetched doctorId from localStorage:", doctorId);
        
        if (!doctorId) {
          console.error("❌ No doctorId found");
          toast.error("Không tìm thấy ID bác sĩ");
          router.push("/");
          return;
        }

        const response = await getDoctorById(doctorId);
        const dObj = response?.data ?? response ?? null;
        console.log("✅ API Response:", dObj);
        
        if (dObj) {
          console.log("📝 Setting doctor data:", dObj);
          setDoctor(dObj);
        } else {
          console.error("❌ No data in response");
          toast.error("Không thể tải thông tin bác sĩ");
        }
      } catch (error) {
        console.error("❌ Failed to fetch doctor profile:", error);
        toast.error("Lỗi khi tải thông tin bác sĩ");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy thông tin bác sĩ</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = doctor.profileId;
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const genderLabel = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  }[profile.gender] || profile.gender;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 rounded-b-3xl shadow-lg"></div>
          
          <div className="relative -mt-32 mx-4 sm:mx-6 lg:mx-8">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-4 border-white dark:border-slate-900 shadow-lg">
                      {profile.avatarUrl ? (
                        <img 
                          src={profile.avatarUrl} 
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                          <span className="text-white text-5xl font-bold">
                            {profile.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 pt-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      {doctor.doctorName}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold text-sm py-1 px-3">
                        {doctor.chuyenKhoaId.name}
                      </Badge>
                      <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold text-sm py-1 px-3">
                        {doctor.academic}
                      </Badge>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-5 max-w-2xl">
                      {doctor.bio}
                    </p>

                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold">{doctor.yearsOfExperience} năm kinh nghiệm</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Họ và tên</p>
                <p className="text-lg text-gray-900 dark:text-white">{profile.name}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Giới tính</p>
                <p className="text-lg text-gray-900 dark:text-white">{genderLabel}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Ngày sinh</p>
                <div className="space-y-1">
                  <p className="text-lg text-gray-900 dark:text-white">
                    {formatDate(profile.dob)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tuổi: {calculateAge(profile.dob)} tuổi
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ
                </p>
                <p className="text-lg text-gray-900 dark:text-white">{profile.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              Thông tin liên hệ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Số điện thoại</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">{profile.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Thông tin chuyên môn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Specialization */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {/* <Stethoscope className="w-5 h-5 text-purple-600" /> */}
                  <p className="font-semibold text-gray-900 dark:text-white">Chuyên khoa</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {doctor.chuyenKhoaId.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {doctor.chuyenKhoaId.description}
                  </p>
                </div>
              </div>

              {/* Degrees */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {/* <BookOpen className="w-5 h-5 text-amber-600" /> */}
                  <p className="font-semibold text-gray-900 dark:text-white">Bằng cấp</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {doctor.degree.map((deg, index) => (
                    <Badge key={index} variant="secondary" className="text-base py-2 px-3">
                      {deg}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Academic Rank */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {/* <Award className="w-5 h-5 text-blue-600" /> */}
                  <p className="font-semibold text-gray-900 dark:text-white">Danh hiệu học vị</p>
                </div>
                <Badge className="text-base py-2 px-3 bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400">
                  {doctor.academic}
                </Badge>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {/* <Calendar className="w-5 h-5 text-green-600" /> */}
                  <p className="font-semibold text-gray-900 dark:text-white">Kinh nghiệm</p>
                </div>
                <p className="text-lg text-gray-900 dark:text-white">
                  {doctor.yearsOfExperience} năm kinh nghiệm công tác
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {doctor.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                Giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {doctor.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {doctor.achievements && doctor.achievements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                Thành tích và đạt được
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctor.achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex-shrink-0">
                      <Award className="w-5 h-5 text-amber-600 mt-0.5" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                      {achievement}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Thông tin khác
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p>Tham gia: {formatDate(doctor.createdAt)}</p>
              </div>
              <div>
                <p>Cập nhật: {formatDate(doctor.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
