import HeroBanner       from "@/components/home/HeroBanner";
import QuickCategories  from "@/components/home/QuickCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStrip       from "@/components/home/BrandStrip";
import TrendingProducts from "@/components/home/TrendingProducts";
import ServiceSection   from "@/components/home/ServiceSection";
import BestSelling      from "@/components/home/BestSelling";
import NewArrivals      from "@/components/home/NewArrivals";
import PromoBanner      from "@/components/home/PromoBanner";
import CalculatorPreview from "@/components/home/CalculatorPreview";
import BlogSection      from "@/components/home/BlogSection";

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <QuickCategories />
      <FeaturedProducts />
      <BrandStrip />
      <TrendingProducts />
      <PromoBanner />
      <ServiceSection />
      <BestSelling />
      <NewArrivals />
      <CalculatorPreview />
      <BlogSection />
    </div>
  );
}
