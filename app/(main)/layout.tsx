import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Heavy components — lazy load করা হয়েছে (performance এর জন্য)
const CartSidebar = dynamic(
  () => import("@/components/cart/CartSidebar"),
  { ssr: false }
);
const WhatsAppButton = dynamic(
  () => import("@/components/ui/WhatsAppButton"),
  { ssr: false }
);
const LiveChat = dynamic(
  () => import("@/components/ui/LiveChat"),
  { ssr: false }
);
const CompareBar = dynamic(
  () => import("@/components/product/CompareBar"),
  { ssr: false }
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-dark-50">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppButton />
      <CompareBar />
      <LiveChat />
    </div>
  );
}
