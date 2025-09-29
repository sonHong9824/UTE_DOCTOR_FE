import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200 mt-10 transition-colors">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <h2 className="text-2xl font-bold">
            Doctor<span className="text-blue-600 dark:text-blue-400">+</span>
          </h2>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Nền tảng chăm sóc sức khỏe hiện đại, kết nối bác sĩ và bệnh nhân mọi lúc mọi nơi.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">Giới thiệu</a>
            </li>
            <li>
              <a href="/services" className="hover:text-blue-600 dark:hover:text-blue-400">Dịch vụ</a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Liên hệ</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
          <ul className="space-y-2 text-sm mb-4">
            <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
            <li>📞 0123 456 789</li>
            <li>✉️ support@doctor.vn</li>
          </ul>
          <div className="w-full h-32 rounded-md overflow-hidden shadow">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6765.509946039445!2d106.76933817427248!3d10.850637657822046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEvhu7kgdGh14bqtdCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmg!5e1!3m2!1svi!2sus!4v1759171154727!5m2!1svi!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Kết nối mạng xã hội */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/hong.son.618179?locale=vi_VN" className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer">
              <Image
                src="/icons/facebook.png"
                alt="Facebook"
                width={24}
                height={24}
                className="dark:invert-0"
              />
            </a>
            <a href="#" className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer">
              <Image
                src="/icons/twitter.png"
                alt="Twitter"
                width={24}
                height={24}
                className="dark:invert-0"
              />
            </a>
            <a href="https://www.linkedin.com/in/s%C6%A1n-nguy%E1%BB%85n-732028330/" className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer">
              <Image
                src="/icons/linkedin.png"
                alt="LinkedIn"
                width={24}
                height={24}
                className="dark:invert-0"
              />
            </a>
            <a href="https://www.instagram.com/nghg_son/" className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer">
              <Image
                src="/icons/instagram.png"
                alt="Instagram"
                width={24}
                height={24}
                className="dark:invert-0"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 dark:border-gray-700 text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Doctor Healthcare. All rights reserved.
      </div>
    </footer>
  );
}
