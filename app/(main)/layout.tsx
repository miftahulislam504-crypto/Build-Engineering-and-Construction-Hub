import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

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
    </div>
  );
}
