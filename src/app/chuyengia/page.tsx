"use client";
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Award, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveDoctors } from '@/apis/admin/admin.api';

export default function ChuyenGiaPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await getActiveDoctors({
        page: currentPage,
        limit: 10,
        chuyenKhoaId: selectedSpecialty || undefined,
      });

      // Normalize possible response shapes
      // cases: { code, message, data: { items, pagination } }
      // or { items, pagination }
      // or { data: itemsArray }
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

  const specialties = Array.from(new Set(doctors.map((d: any) => (d?.chuyenKhoa?.name ?? d?.chuyenKhoaId?.name)).filter(Boolean)));

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10)));

  return (
    <main className="bg-background text-foreground">
      {/* Hero (same layout as chuyên khoa page) */}
      <section className="relative w-full h-[240px] md:h-[340px] flex items-center justify-center">
        <img src="/assets/chuyen-gia-hero.jpg" alt="Chuyên gia" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">Đội Ngũ Chuyên Gia</h1>
          <p className="mt-2 text-sm sm:text-base drop-shadow">Tìm bác sĩ chuyên môn cao, giàu kinh nghiệm</p>
        </div>
        <div className="absolute inset-0 bg-black/25" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Specialty Filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{filteredDoctors.length}</span> bác sĩ
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor: any) => (
                <div
                  key={doctor?._id ?? doctor?.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={doctor?.profile?.avatarUrl ?? doctor?.profileId?.avatarUrl ?? ''}
                          alt={doctor?.profile?.name ?? doctor?.profileId?.name ?? doctor?.doctorName ?? 'Bác sĩ'}
                          className="w-24 h-24 rounded-lg object-cover border-2 border-blue-100"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {doctor?.doctorName ?? doctor?.profile?.name ?? doctor?.profileId?.name}
                        </h3>
                        
                        {/* Specialty Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mb-2">
                          {doctor?.chuyenKhoa?.name ?? doctor?.chuyenKhoaId?.name}
                        </div>

                        {/* Degrees */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(doctor?.degree ?? []).map((deg: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              <Award className="w-3 h-3 mr-1" />
                              {deg}
                            </span>
                          ))}
                        </div>

                        {/* Academic Title */}
                        {doctor.academic && (
                          <div className="text-sm text-purple-600 font-medium mb-2">
                            {doctor.academic}
                          </div>
                        )}

                        {/* Experience */}
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Briefcase className="w-4 h-4 mr-1 text-gray-400" />
                          <span>{doctor?.yearsOfExperience ?? 0} năm kinh nghiệm</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                      {doctor?.bio}
                    </p>

                    {/* Achievements */}
                    {(doctor?.achievements ?? []).length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Thành tích nổi bật:</div>
                        <ul className="space-y-1">
                          {(doctor?.achievements ?? []).slice(0, 2).map((achievement: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <Star className="w-3 h-3 mr-1 mt-0.5 text-yellow-500 flex-shrink-0" />
                              <span className="line-clamp-1">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200">
                      Đặt lịch khám
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy bác sĩ
                </h3>
                <p className="text-gray-600">
                  Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredDoctors.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

