import Banner from "@/components/banner";
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
    <main>
      <div className="w-full bg-[url('/assets/banner-bg.jpg')] bg-cover bg-center">
        <div className="w-full h-full bg-background/80">
          <Navbar />
          <Banner />
        </div>
      </div>
    </main>
  );
}
