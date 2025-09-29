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

export default function Home() {
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
            {["Chí", "Daniel", "Hiếu", "Minh"].map((d) => (
              <CarouselItem
                key={d}
                className="basis-1/1 md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow text-center h-[320px] flex flex-col items-center justify-center">
                  <div className="w-[200px] h-[200px] mb-4">
                    <Image
                      src={`/assets/bs/bs-${d}.jpg`}
                      alt={`Doctor ${d}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">Bác sĩ {d}</h3>
                  <p className="text-gray-500 text-sm">Chuyên khoa nội</p>
                </div>
              </CarouselItem>
              
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>


      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Phản hồi bệnh nhân</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Dịch vụ tuyệt vời, bác sĩ rất tận tâm.",
              "Ứng dụng tiện lợi, đặt lịch nhanh chóng.",
              "Cơ sở vật chất hiện đại, tôi rất yên tâm.",
            ].map((fb, i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow"
              >
                <p className="italic">“{fb}”</p>
                <div className="mt-4 text-sm font-semibold">- Bệnh nhân {i + 1}</div>
              </div>
            ))}
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
