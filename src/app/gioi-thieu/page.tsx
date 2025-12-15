"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function GioiThieuPage() {
  const [activeId, setActiveId] = useState<string>("ve-chung-toi");

  const stats = [
    { label: "Bác sĩ", value: "150+" },
    { label: "Chuyên khoa", value: "30+" },
    { label: "Ca khám mỗi ngày", value: "1,200+" },
    { label: "Đánh giá 5★", value: "9,000+" },
  ];

  const values = [
    {
      title: "Tận tâm",
      desc: "Đặt sức khỏe và trải nghiệm của bệnh nhân làm trọng tâm.",
      icon: "❤️",
    },
    {
      title: "Chính xác",
      desc: "Quy trình chẩn đoán và điều trị dựa trên bằng chứng khoa học.",
      icon: "📊",
    },
    { title: "Bảo mật", desc: "Dữ liệu cá nhân được bảo vệ nhiều lớp.", icon: "🔐" },
    { title: "Đổi mới", desc: "Ứng dụng công nghệ y tế hiện đại.", icon: "⚙️" },
  ];

  const anchors = [
    { id: "ve-chung-toi", label: "Về chúng tôi" },
    { id: "su-menh-tam-nhin", label: "Sứ mệnh – Tầm nhìn" },
    { id: "doi-ngu-chuyen-gia", label: "Đội ngũ chuyên gia" },
    { id: "benh-vien-5-sao", label: "Bệnh viện 5 sao" },
    { id: "co-so-vat-chat", label: "Cơ sở vật chất" },
    { id: "quy-trinh-khoa-hoc", label: "Quy trình khoa học" },
    { id: "dich-vu-gia-thanh", label: "Dịch vụ & giá" },
    { id: "gia-tri-cot-loi", label: "Giá trị cốt lõi" },
    { id: "quy-trinh-hoat-dong", label: "Quy trình hoạt động" },
    { id: "co-so-hien-dai", label: "Cơ sở hiện đại" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -40% 0px", threshold: 0.25 }
    );

    anchors.forEach((a) => {
      const el = document.getElementById(a.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      step: "01",
      title: "Đăng ký & hồ sơ",
      desc: "Tạo tài khoản, hoàn thiện hồ sơ sức khỏe trong vài phút.",
    },
    {
      step: "02",
      title: "Chọn bác sĩ",
      desc: "Lọc theo chuyên khoa, kinh nghiệm, thời gian rảnh.",
    },
    {
      step: "03",
      title: "Khám & theo dõi",
      desc: "Khám trực tuyến hoặc tại cơ sở, lưu trữ kết quả tập trung.",
    },
  ];

  return (
    <main className="bg-background text-foreground scroll-smooth">
      <Navbar />

      {/* Hero with background banner + breadcrumb */}
      <section className="relative pt-16">
        <div className="absolute inset-0 h-[360px]">
          <Image
            src="/assets/banner-bg.jpg"
            alt="Giới thiệu Doctor+"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[360px] flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Doctor+ — Nền tảng chăm sóc sức khỏe hiện đại
          </h1>
          <p className="text-white/90 mt-3 max-w-3xl">
            Kết nối nhanh với bác sĩ, đặt lịch linh hoạt, theo dõi điều trị và hồ sơ y tế một cách thông minh.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/chuyen-khoa" className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Khám phá chuyên khoa</a>
            <a href="/chuyen-gia" className="px-5 py-3 rounded-lg border border-white text-white hover:bg-white/10">Đội ngũ bác sĩ</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex gap-6 w-fit">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky anchors */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-4 overflow-x-auto py-3" aria-label="Section navigation">
            {anchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors ${
                  activeId === a.id
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={activeId === a.id ? "page" : undefined}
              >
                {a.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Về Chúng Tôi */}
      <section id="ve-chung-toi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl font-bold mb-4">Về Chúng Tôi</h2>
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <p className="text-muted-foreground leading-relaxed">
              Dựa trên nền tảng truyền thống, các giá trị lớn của ngành y Việt Nam từ xưa đến nay, đồng thời mong muốn mang lại cho người dân dịch vụ khám chữa bệnh chất lượng cao về y khoa, tiếp cận phương pháp, kỹ thuật và phác đồ hiện đại, được hưởng các dịch vụ cao cấp như ở nước ngoài, bệnh viện Đa Khoa Tâm Anh đã được thành lập.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Ngay từ khi mới bắt đầu đi vào hoạt động, bệnh viện Tâm Anh đã chú trọng việc xây dựng đội ngũ chuyên gia bác sĩ giỏi về chuyên môn, nhiều kinh nghiệm, bệnh viện đã quy tụ được đội ngũ chuyên gia hàng đầu từ nhiều lĩnh vực như nam khoa tiết niệu, sản phụ khoa, nhi khoa, hô hấp, cơ xương khớp, hỗ trợ sinh sản, tai mũi họng, thần kinh…
            </p>
          </div>
          <Image src="/assets/about-hospital.png" alt="Về chúng tôi" width={800} height={500} className="w-full rounded-xl shadow" />
        </div>
      </section>

      {/* Sứ mệnh – Tầm nhìn */}
      <section id="su-menh-tam-nhin" className="bg-gray-50 dark:bg-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Sứ Mệnh – Tầm Nhìn</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-muted-foreground leading-relaxed">
                Chúng tôi hướng tới hệ sinh thái chăm sóc sức khỏe toàn diện, nơi mọi người dân đều có thể tiếp cận dịch vụ khám chữa bệnh chất lượng cao, minh bạch, an toàn và nhân văn.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
                <li>Nâng cao chất lượng y tế qua đào tạo và nghiên cứu.</li>
                <li>Ứng dụng công nghệ y khoa hiện đại, triển khai các phác đồ chuẩn quốc tế.</li>
                <li>Đặt trải nghiệm người bệnh làm trung tâm, dịch vụ tận tâm.</li>
              </ul>
            </div>
            <Image src="/assets/xet-nghiem.jpg" alt="Sứ mệnh tầm nhìn" width={900} height={600} className="w-full rounded-xl shadow" />
          </div>
        </div>
      </section>

      {/* Đội ngũ chuyên gia */}
      <section id="doi-ngu-chuyen-gia" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl font-bold mb-4">Đội Ngũ Chuyên Gia</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["Nam khoa – Tiết niệu", "Sản phụ khoa", "Nhi khoa", "Hô hấp", "Cơ xương khớp", "Tai mũi họng"].map((dept, i) => (
            <div key={i} className="p-5 rounded-xl bg-white dark:bg-gray-900 shadow hover:shadow-lg transition">
              <Image src={["/assets/chuyen-khoa.jpg", "/assets/xet-nghiem.jpg", "/assets/kham-tu-xa.jpg"][i % 3]} alt={dept} width={400} height={250} className="w-full rounded-lg mb-3 object-cover h-[160px]" />
              <div className="font-semibold">{dept}</div>
              <p className="text-sm text-muted-foreground mt-1">Quy tụ chuyên gia đầu ngành, chuyên môn sâu, giàu kinh nghiệm.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bệnh viện khách sạn 5 sao */}
      <section id="benh-vien-5-sao" className="bg-gray-50 dark:bg-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Bệnh Viện Khách Sạn 5 Sao</h2>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <Image src="/assets/about-hospital.png" alt="Bệnh viện khách sạn" width={900} height={600} className="w-full rounded-2xl shadow" />
            <div>
              <p className="text-muted-foreground">
                Mô hình bệnh viện khách sạn chú trọng trải nghiệm chất lượng cao: không gian, cảnh quan, phòng nội trú, nhà hàng, tiện ích… phù hợp tiêu chuẩn quốc tế.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cơ sở vật chất – Trang thiết bị hiện đại */}
      <section id="co-so-vat-chat" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl font-bold mb-4">Cơ Sở Vật Chất – Trang Thiết Bị Hiện Đại</h2>
        <p className="text-muted-foreground mb-6">
          Bệnh viện Đa khoa Tâm Anh đầu tư lớn cho thiết bị, phương pháp chẩn đoán và điều trị hàng đầu thế giới. Nhiều trang thiết bị hiếm có tại Việt Nam.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {["Khám tổng quát", "Xét nghiệm", "Chẩn đoán hình ảnh"].map((label, i) => (
            <div key={i} className="p-5 rounded-xl bg-white dark:bg-gray-900 shadow">
              <Image src={["/assets/kham-tong-quat.jpg", "/assets/xet-nghiem.jpg", "/assets/chuyen-khoa.jpg"][i % 3]} alt={label} width={400} height={250} className="w-full rounded-lg mb-3 object-cover h-[160px]" />
              <div className="font-semibold">{label}</div>
              <p className="text-sm text-muted-foreground">Hệ thống hiện đại, hỗ trợ các ca phẫu thuật và chẩn đoán chính xác.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quy trình khoa học – toàn diện */}
      <section id="quy-trinh-khoa-hoc" className="bg-gray-50 dark:bg-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Quy Trình Khoa Học – Toàn Diện</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((st) => (
              <div key={st.step} className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow">
                <div className="text-blue-600 font-bold">{st.step}</div>
                <div className="text-lg font-semibold mb-1">{st.title}</div>
                <p className="text-sm text-muted-foreground">{st.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-4">
            Quy trình thăm khám, điều trị được xây dựng toàn diện, khoa học; tiết kiệm thời gian, chi phí và công sức của khách hàng.
          </p>
        </div>
      </section>

      {/* Dịch vụ cao cấp – Giá thành hợp lý */}
      <section id="dich-vu-gia-thanh" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold mb-4">Dịch Vụ Cao Cấp – Giá Thành Hợp Lý</h2>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-muted-foreground mb-4">
              Hướng tới phục vụ đông đảo khách hàng với giá thành hợp lý, nhiều chính sách ưu đãi về chi phí, hỗ trợ thanh toán linh hoạt.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
              <li>Minh bạch giá dịch vụ, không phụ phí bất ngờ.</li>
              <li>Ưu đãi theo chương trình định kỳ, hợp tác bảo hiểm.</li>
              <li>Tư vấn giải pháp phù hợp ngân sách.</li>
            </ul>
          </div>
          <Image src="/assets/about-hospital.png" alt="Dịch vụ" width={900} height={600} className="w-full rounded-xl shadow" />
        </div>
      </section>

      {/* Values */}
      <section id="gia-tri-cot-loi" className="bg-gray-50 dark:bg-gray-800 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-5 rounded-xl bg-white dark:bg-gray-900 shadow hover:shadow-lg transition">
                <div className="text-3xl mb-2">{v.icon}</div>
                <div className="font-semibold mb-1">{v.title}</div>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="quy-trinh-hoat-dong" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-3xl font-bold mb-8">Quy trình hoạt động</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div key={st.step} className="p-6 rounded-xl bg-white dark:bg-gray-900 shadow">
              <div className="text-blue-600 font-bold">{st.step}</div>
              <div className="text-lg font-semibold mb-1">{st.title}</div>
              <p className="text-sm text-muted-foreground">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Facility */}
      <section id="co-so-hien-dai" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <Image src="/assets/kham-tong-quat.jpg" alt="Cơ sở vật chất" width={900} height={600} className="w-full rounded-2xl shadow" />
          <div>
            <h3 className="text-2xl font-bold mb-3">Cơ sở vật chất hiện đại</h3>
            <p className="text-muted-foreground mb-4">
              Hệ thống phòng khám đạt chuẩn, trang thiết bị tiên tiến, đảm bảo quá trình chẩn đoán và điều trị hiệu quả.
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
              <li>Phòng khám chuyên sâu theo từng lĩnh vực</li>
              <li>Hệ thống xét nghiệm đạt chuẩn quốc tế</li>
              <li>Quy trình quản lý hồ sơ số hóa, nhanh chóng</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
