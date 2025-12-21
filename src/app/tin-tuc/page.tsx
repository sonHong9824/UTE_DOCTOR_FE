"use client";

import { getPublicNews } from "@/apis/admin/news.api";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, Search, Tag } from "lucide-react";

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
}

export default function TinTucPage() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await getPublicNews();
        const items = res?.data ?? [];
        const newsArray = Array.isArray(items) ? items : [];
        setAllNews(newsArray);
        setFilteredNews(newsArray);
      } catch (e) {
        console.error("Failed to load news", e);
        setAllNews([]);
        setFilteredNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Filter news based on search
  useEffect(() => {
    let result = allNews;

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNews(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, allNews]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <main className="bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16">
        <div className="absolute inset-0 h-[280px]">
          <Image
            src="/assets/banner-bgg.jpg"
            alt="Tin tức Doctor+"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[280px] flex flex-col justify-center">
          {/* <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center text-sm text-white/80 gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li className="opacity-70">/</li>
              <li aria-current="page" className="text-white">
                Tin tức
              </li>
            </ol>
          </nav> */}
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
            Tin Tức Y Khoa
          </h1>
          <p className="text-white/90 max-w-2xl">
            Cập nhật thông tin mới nhất về sức khỏe, y học và các dịch vụ chăm sóc y tế hiện đại
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white dark:bg-gray-900 shadow-md sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Results Count */}
          {/* <div className="mt-3 text-sm text-muted-foreground">
            Hiển thị {filteredNews.length} tin tức
            {searchQuery && ` cho "${searchQuery}"`}
          </div> */}
        </div>
      </section>

      {/* News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-300 dark:bg-gray-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-2xl font-semibold mb-2">Không tìm thấy tin tức</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Chưa có tin tức nào được đăng"}
            </p>
          </div>
        ) : (
          <>
            {/* News Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNews.map((item) => (
                <Link
                  key={item._id}
                  href={`/tin-tuc/${item._id}`}
                  className="group bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.imageUrl || "/assets/news1.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {truncateText(item.content.replace(/<[^>]*>/g, ""), 120)}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.startDate)}</span>
                      </div>
                      {/* <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Đến {formatDate(item.endDate)}</span>
                      </div> */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Trước
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Call to Action */}
      {/* <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Đăng ký để nhận tin tức mới nhất
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Cập nhật những thông tin y khoa hữu ích, mẹo chăm sóc sức khỏe và các chương trình ưu đãi
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section> */}

      <Footer />
    </main>
  );
}
