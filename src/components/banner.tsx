"use client";
import React from "react";
import { useTypewriter, Cursor } from "react-simple-typewriter";

const Banner = () => {
  const [text] = useTypewriter({
    words: [
      "Đặt lịch khám nhanh chóng, tiện lợi.",
      "Bác sĩ giàu kinh nghiệm, tận tâm.",
      "Chăm sóc sức khỏe mọi lúc, mọi nơi.",
    ],
    loop: true,
    typeSpeed: 30,
    deleteSpeed: 10,
    delaySpeed: 2000,
  });

  return (
    <div className="h-96 max-w-screen-2xl mx-auto flex flex-col justify-center items-center text-center">
      <h1 className="text-2xl md:text-4xl uppercase font-bold text-foreground">
        DOCTOR - MEDICAL PLATFORM
      </h1>
      <p className="text-base md:text-lg font-semibold mt-2 text-muted-foreground">
        {text} <Cursor cursorBlinking cursorStyle="|" cursorColor="hsl(var(--primary))" />
      </p>
    </div>
  );
};

export default Banner;
