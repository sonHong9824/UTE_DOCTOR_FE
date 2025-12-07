import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["vietnamese"],
});


export const metadata: Metadata = {
  title: "Doctor - Healthcare",
  description: "Healthcare Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={montserrat.className}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
