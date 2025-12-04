"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Banner from "@/components/banner";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { getDoctorsAdmin } from '@/apis/admin/admin.api';
import { getAllReviews } from '@/apis/review/review.api';

// Fallback static names used when API returns no doctors
const fallbackNames = ["Chí", "Daniel", "Hiếu", "Minh"];

export default function Home() {
  const router = useRouter();

  const [apiDoctors, setApiDoctors] = useState<any[]>([]);
  const [apiReviews, setApiReviews] = useState<any[]>([]);

  useEffect(() => {
    // fetch a small set of doctors to display on homepage
    const fetch = async () => {
      try {
        const res = await getDoctorsAdmin({ page: 1, limit: 8 });
        const docs = res?.data?.doctors ?? [];
        setApiDoctors(docs);
      } catch (e) {
        console.error('Failed to load doctors for homepage', e);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getAllReviews();
        // DataResponse wrapper: res?.data may be the array, or res itself may be the array
        const items = res?.data ?? res ?? [];
        setApiReviews(Array.isArray(items) ? items : []);
      } catch (e) {
        console.error('Failed to load reviews for homepage', e);
      }
    };
    fetchReviews();
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const role = (localStorage.getItem('role') || '').toUpperCase();
    // If no role, stay on public homepage
    if (!role) return;

    // Redirect based on role
    if (role === 'ADMIN') {
      router.replace('/admin');
    } else if (role === 'DOCTOR') {
      router.replace('/doctor');
    }
  }, [router]);

  return (
    <main className="bg-background text-foreground">
      {/* Banner */}
      <div className="w-full bg-[url('/assets/banner-bg.jpg')] bg-cover bg-center">
        <div className="w-full h-full bg-background/80">
          <Navbar />
          <Banner />
        </div>
      </div>

      {/* About Section */}
      <section className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">
            Về <span className="text-blue-600 dark:text-blue-400">Doctor+</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Doctor+ là nền tảng chăm sóc sức khỏe toàn diện, cung cấp dịch vụ khám
            chữa bệnh trực tuyến và trực tiếp, kết nối bác sĩ với bệnh nhân nhanh chóng,
            an toàn và hiệu quả.
          </p>
          <a
            href="/about"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Tìm hiểu thêm
          </a>
        </div>
        <Image
          src="/assets/about-hospital.png"
          alt="Hospital"
          width={700}
          height={400}
          className="rounded-xl shadow-lg"
        />
      </section>

      {/* Services */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Dịch vụ nổi bật</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Khám tổng quát",
                desc: "Dịch vụ khám sức khỏe định kỳ, phát hiện bệnh sớm.",
                img: "/assets/kham-tong-quat.jpg",
              },
              {
                title: "Khám từ xa",
                desc: "Kết nối với bác sĩ qua video call mọi lúc, mọi nơi.",
                img: "/assets/kham-tu-xa.jpg",
              },
              {
                title: "Xét nghiệm",
                desc: "Dịch vụ xét nghiệm máu, nước tiểu và nhiều hơn nữa.",
                img: "/assets/xet-nghiem.jpg",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition"
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  width={400}
                  height={250}
                  className="rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Đội ngũ bác sĩ</h2>
        <Carousel>
          <CarouselContent>
            {/* Render server-backed doctors if available, otherwise fallback to static list */}
            {/**
             * Each doctor object from API is expected to have at least:
             * - doctorName
             * - profile or profileId with avatarUrl, email
             * - chuyenKhoaId?.name as specialty
             */}
            {/** Use local state `doctors` filled by effect below */}
            {(function renderDoctors() {
              // Safe guard: window-only API lives in client component
              // `apiDoctors` populated in useEffect
              return (apiDoctors.length ? apiDoctors : fallbackNames).map((d: any, idx: number) => {
                const avatarUrl = d?.profile?.avatarUrl ?? d?.profileId?.avatarUrl ?? d?.avatar ?? null;
                const name = d?.doctorName ?? d?.profile?.name ?? d?.profileId?.name ?? (typeof d === 'string' ? d : `Bác sĩ ${idx + 1}`);
                const specialty = d?.chuyenKhoaId?.name ?? d?.specialty ?? 'Chuyên khoa';
                const fallbackImg = `/assets/bs/bs-${(name || '').toString().split(' ')[1] || `default-${idx}`}.jpg`;
                return (
                  <CarouselItem key={d?._id ?? d?.id ?? `fallback-${idx}`} className="basis-1/1 md:basis-1/2 lg:basis-1/3">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow text-center h-[320px] flex flex-col items-center justify-center">
                      <div className="w-[200px] h-[200px] mb-4">
                        {avatarUrl ? (
                          // external avatar URL: use <img> to avoid Next.js domain config issues
                          // ensure URL is a string
                          <img src={String(avatarUrl)} alt={name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Image src={fallbackImg} alt={name} width={200} height={200} className="w-full h-full object-cover rounded-full" />
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{name}</h3>
                      <p className="text-gray-500 text-sm">{specialty}</p>
                    </div>
                  </CarouselItem>
                );
              });
            })()}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>


      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Phản hồi bệnh nhân</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {apiReviews && apiReviews.length > 0 ? (
              apiReviews.map((r: any, i: number) => {
                const comment = r?.comment ?? r?.message ?? '';
                const patientName = r?.patientId?.profileId?.name ?? r?.patientId?.name ?? `Bệnh nhân ${i + 1}`;
                return (
                  <div key={r._id ?? i} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
                    <p className="italic">“{comment}”</p>
                    <div className="mt-4 text-sm font-semibold">- {patientName}</div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Chưa có phản hồi nào.</p>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Tin tức & Sức khỏe</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 1, 1].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition"
            >
              <Image
                src={`/assets/news${n}.jpg`}
                alt={`News ${n}`}
                width={400}
                height={250}
                className="rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Bài viết {n}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nội dung tóm tắt về sức khỏe, y tế...
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
