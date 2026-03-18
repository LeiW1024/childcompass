// app/page.tsx — Server component (Navbar needs server context)
import Navbar from "@/components/layout/Navbar";
import HomeContent from "@/components/HomeContent";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HomeContent />
      <Footer />
    </div>
  );
}
