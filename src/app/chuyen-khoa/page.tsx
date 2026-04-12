import Image from "next/image";
import Link from "next/link";

export default function ChuyenKhoaPage() {
  const specialties = [
    {
      name: "Nội tổng quát",
      desc: "Khám và điều trị các bệnh lý nội khoa thường gặp.",
      icon: "/icons/internal.png",
    },
    {
      name: "Ngoại tổng quát",
      desc: "Chẩn đoán và phẫu thuật điều trị bệnh lý ngoại khoa.",
      icon: "/icons/surgery.png",
    },
    {
      name: "Nhi khoa",
      desc: "Khám, theo dõi sức khỏe và tiêm chủng cho trẻ em.",
      icon: "/icons/pediatrics.png",
    },
    {
      name: "Sản - Phụ khoa",
      desc: "Chăm sóc sức khỏe sinh sản và thai sản.",
      icon: "/icons/obgyn.png",
    },
    {
      name: "Tim mạch",
      desc: "Khám, tư vấn và điều trị các bệnh tim mạch.",
      icon: "/icons/cardiology.png",
    },
    {
      name: "Tai - Mũi - Họng",
      desc: "Chẩn đoán và điều trị các bệnh lý tai mũi họng.",
      icon: "/icons/ent.png",
    },
  ];

  return (
    <main className="bg-background text-foreground">
      {/* Hero section */}
    <section className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center">
    {/* Ảnh nền */}
    <Image
        src="/assets/chuyen-khoa.jpg"
        alt="Chuyên khoa"
        fill
        priority
        className="object-cover"
    />

    </section>


      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Các chuyên khoa nổi bật
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((sp, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-xl transition-transform hover:-translate-y-1 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full">
                <Image
                  src={sp.icon}
                  alt={sp.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{sp.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {sp.desc}
              </p>
              <Link
                href={`/chuyen-khoa/${index}`}
                className="inline-block px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Đặt lịch khám ngay hôm nay
        </h2>
        <p className="mb-6">
          Đội ngũ bác sĩ chuyên khoa hàng đầu luôn sẵn sàng phục vụ bạn.
        </p>
        <Link
          href="/dat-lich"
          className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Đặt lịch khám
        </Link>
      </section>
    </main>
  );
}
