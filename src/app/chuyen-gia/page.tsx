"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Award, Briefcase, ChevronLeft, ChevronRight, MapPin, Clock, Calendar, Heart, User, Stethoscope, GraduationCap, TrendingUp } from 'lucide-react';
import { getActiveDoctors } from '@/apis/admin/admin.api';
import { getSpecialties } from '@/apis/appointment/appointment.api';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Link from 'next/link';

export default function ChuyenGiaPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, selectedSpecialty]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialties('');
        const items = res?.data ?? [];
        setSpecialties(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách chuyên khoa:", error);
      }
    };
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await getActiveDoctors({
        page: currentPage,
        limit: 10,
        chuyenKhoaId: selectedSpecialty || undefined,
      });

      const items = response?.data?.items ?? response?.items ?? response?.data ?? [];
      const pag = response?.data?.pagination ?? response?.pagination ?? {};

      setDoctors(Array.isArray(items) ? items : []);
      setPagination({
        page: Number(pag?.page ?? currentPage) || currentPage,
        limit: Number(pag?.limit ?? 10) || 10,
        total: Number(pag?.total ?? (Array.isArray(items) ? items.length : 0)) || 0,
      });
    } catch (error) {
      console.error("Lỗi khi tải danh sách bác sĩ:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor: any) => {
    const name = (doctor?.doctorName ?? doctor?.profile?.name ?? doctor?.profileId?.name ?? '').toString().toLowerCase();
    const chuyen = (doctor?.chuyenKhoa?.name ?? doctor?.chuyenKhoaId?.name ?? '').toString().toLowerCase();
    const q = searchTerm.toLowerCase();
    return !q || name.includes(q) || chuyen.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Đội Ngũ Bác Sĩ Chuyên Nghiệp
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Gặp gỡ các chuyên gia y tế hàng đầu với nhiều năm kinh nghiệm và chuyên môn cao
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{pagination.total}+ Bác sĩ</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Chuyên khoa đa dạng</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Đặt lịch nhanh chóng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 sticky top-0 lg:top-4 z-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Specialty Filter */}
            <div className="relative lg:w-72">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer transition-all text-gray-700"
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties.map(specialty => (
                  <option key={specialty._id} value={specialty._id}>{specialty.name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm border-t pt-4">
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-8 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-2xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-12">
              {filteredDoctors.map((doctor: any) => {
                const specialty = doctor?.chuyenKhoa?.name ?? doctor?.chuyenKhoaId?.name ?? '';
                const colorKey = specialty.includes('Nội') ? 'blue' : 
                                  specialty.includes('Ngoại') ? 'purple' :
                                  specialty.includes('Da') ? 'pink' :
                                  specialty.includes('Tim') ? 'red' : 'cyan';

                const badgeColorMap: Record<string, string> = {
                  blue: 'bg-blue-50 text-blue-700',
                  purple: 'bg-purple-50 text-purple-700',
                  pink: 'bg-pink-50 text-pink-700',
                  red: 'bg-red-50 text-red-700',
                  cyan: 'bg-cyan-50 text-cyan-700',
                  default: 'bg-gray-50 text-gray-700',
                };

                const badgeClasses = badgeColorMap[colorKey] ?? badgeColorMap.default;

                const degrees = Array.isArray(doctor?.degree)
                  ? doctor.degree
                  : doctor?.degree
                    ? [doctor.degree]
                    : [];

                return (
                  <div
                    key={doctor?._id ?? doctor?.id}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="p-5">
                      <div className="flex gap-4 mb-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-blue-50 group-hover:border-blue-200 transition-all">
                            <img
                              src={doctor?.profile?.avatarUrl ?? doctor?.profileId?.avatarUrl ?? ''}
                              alt={doctor?.profile?.name ?? doctor?.profileId?.name ?? doctor?.doctorName ?? 'Bác sĩ'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {doctor?.doctorName ?? doctor?.profile?.name ?? doctor?.profileId?.name}
                          </h3>

                          {/* Specialty Badge */}
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClasses} mb-2`}>
                            <Stethoscope className="w-3 h-3 mr-1" />
                            {specialty}
                          </div>

                          {/* Academic Title */}
                          {doctor.academic && (
                            <div className="text-xs text-purple-600 font-semibold line-clamp-1">
                              {doctor.academic}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Briefcase className="w-3 h-3 mr-1 text-blue-500" />
                          <span>{doctor?.yearsOfExperience ?? 0} năm</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-amber-500" />
                          <span>{doctor?.topReviews?.length ?? 0} đánh giá</span>
                        </div>
                      </div>

                      {/* Bio */}
                      {doctor?.bio && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {doctor.bio}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/chuyen-gia/${doctor?._id}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-4 h-4" />
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredDoctors.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <div className="text-gray-300 mb-6">
                  <Search className="w-24 h-24 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Không tìm thấy bác sĩ
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Không có bác sĩ nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSpecialty("");
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Xem tất cả bác sĩ
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredDoctors.length > 0 && totalPages > 1 && (
              <div className="mt-8 mb-12">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Trang <span className="font-semibold text-gray-900">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[44px] px-4 py-3 rounded-xl font-semibold transition-all ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                  : 'border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-sm text-gray-600">
                      Tổng <span className="font-semibold text-gray-900">{pagination.total}</span> bác sĩ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}