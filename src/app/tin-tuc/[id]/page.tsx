"use client";

import { getPublicNews } from "@/apis/admin/news.api";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = useMemo(() => String(params?.id || ""), [params]);

  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPublicNews();
        const items = res?.data ?? [];
        setNewsItems(Array.isArray(items) ? items : []);
      } catch (e) {
        // keep empty list
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const item = useMemo(() => newsItems.find((n) => String(n._id) === id), [newsItems, id]);

  if (loading) return <div className="container mx-auto px-6 py-16">Loading...</div>;
  if (!item) return (
    <div className="container mx-auto px-6 py-16">
      <p className="mb-4">Không tìm thấy tin tức.</p>
      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={() => router.push("/")}>Về trang chủ</button>
    </div>
  );

  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <section className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
        {/* <div className="mb-4">
          <Link href="/" className="text-blue-600 hover:underline">← Trang chủ</Link>
        </div> */}
        <h1 className="text-3xl font-bold mb-3">{item.title}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {new Date(item.startDate).toLocaleDateString()}
        </p>
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={1920}
            height={1080}
            sizes="100vw"
            className="w-full h-auto object-contain rounded-xl mb-6"
          />
        )}
        <article className="prose dark:prose-invert whitespace-pre-line">
          {item.content}
        </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
