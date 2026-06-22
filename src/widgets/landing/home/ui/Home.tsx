import Footer from "@/shared/ui/Footer";
import BottomCta from "@/widgets/landing/bottom/BottomCta";
import FeatureSection from "@/widgets/landing/feature/FeatureSection";
import HomeModal from "@/widgets/landing/home/ui/lib/HomeModal";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full h-full bg-navy-950">
      <HomeModal />
      <FeatureSection />
      <BottomCta />
      <Footer />
    </div>
  );
}
