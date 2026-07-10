import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Terms & Conditions | EngineX Mart",
  description: "Read EngineX Mart's terms and conditions governing the use of our marketplace platform.",
};

const LAST_UPDATED = "June 1, 2025";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-900 to-dark-800 text-white py-12">
        <div className="container-main max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-dark-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-main max-w-4xl py-12">
        <div className="space-y-8">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing and using the EngineX Mart website and services, you accept
              and agree to be bound by these Terms and Conditions. If you do not agree
              to these terms, please do not use our platform.
            </p>
            <p>
              These terms apply to all users including customers, vendors, and visitors.
              We reserve the right to modify these terms at any time.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <ul>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>You must be at least 18 years old to create an account and make purchases</li>
              <li>One person may not maintain multiple accounts</li>
            </ul>
          </Section>

          <Section title="3. Products and Pricing">
            <ul>
              <li>All prices are listed in Bangladeshi Taka (BDT) and include VAT where applicable</li>
              <li>Prices are subject to change without prior notice due to market conditions</li>
              <li>Product images are for illustration purposes only; actual products may vary slightly</li>
              <li>We reserve the right to limit quantities of any product per order</li>
              <li>We are not responsible for typographical errors in pricing; we may cancel orders placed at incorrect prices</li>
            </ul>
          </Section>

          <Section title="4. Orders and Payment">
            <ul>
              <li>Orders are confirmed only after successful payment or acceptance of Cash on Delivery</li>
              <li>We accept payments via bKash, Nagad, Rocket, and credit/debit cards through SSLCommerz</li>
              <li>For bulk orders, a quotation request must be submitted and approved before purchase</li>
              <li>We reserve the right to cancel any order for any reason, including stock unavailability</li>
              <li>In case of cancellation, full refund will be processed within 5-7 business days</li>
            </ul>
          </Section>

          <Section title="5. Delivery Policy">
            <ul>
              <li>Delivery is available across Bangladesh; delivery charges vary by location and order size</li>
              <li>Estimated delivery times are 2-7 business days depending on location</li>
              <li>For bulk/heavy construction materials, delivery timelines may vary</li>
              <li>Risk of loss transfers to you upon delivery to the specified address</li>
              <li>Free delivery is available for orders above ৳10,000</li>
            </ul>
          </Section>

          <Section title="6. Returns and Refunds">
            <ul>
              <li>Products may be returned within 7 days of delivery if they are defective or damaged</li>
              <li>Returns are not accepted for opened cement bags, cut cables, or custom-cut materials</li>
              <li>To initiate a return, contact our customer support with photos of the defective item</li>
              <li>Refunds will be processed to the original payment method within 5-7 business days</li>
              <li>Delivery charges are non-refundable unless the return is due to our error</li>
            </ul>
          </Section>

          <Section title="7. Engineering Services">
            <ul>
              <li>Service bookings are confirmed only after reviewing your project requirements</li>
              <li>Service timelines are estimates and may vary based on project complexity</li>
              <li>All engineering services are provided by qualified and licensed professionals</li>
              <li>EngineX Mart acts as a marketplace; individual service providers are responsible for their work quality</li>
              <li>Cancellation of booked services must be made at least 48 hours in advance for a full refund</li>
            </ul>
          </Section>

          <Section title="8. Quotation System">
            <ul>
              <li>Quotations are valid for the period specified in the quotation document</li>
              <li>Prices in quotations are subject to change if market rates fluctuate significantly</li>
              <li>Approved quotations create a binding order commitment from both parties</li>
              <li>We reserve the right to reject quotation requests at our discretion</li>
            </ul>
          </Section>

          <Section title="9. Prohibited Activities">
            <p>You agree not to:</p>
            <ul>
              <li>Use our platform for any unlawful purpose</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Post spam, malicious content, or inappropriate reviews</li>
              <li>Resell products purchased from our platform without authorization</li>
              <li>Use our engineering calculators for structural decisions without professional verification</li>
            </ul>
          </Section>

          <Section title="10. Intellectual Property">
            <p>
              All content on EngineX Mart — including logos, images, text, and software — is
              the property of EngineX Mart and protected by applicable intellectual property laws.
              You may not reproduce, distribute, or create derivative works without our express
              written permission.
            </p>
          </Section>

          <Section title="11. Disclaimer of Warranties">
            <p>
              EngineX Mart provides its services &quot;as is&quot; without warranties of any kind.
              We do not warrant that our website will be error-free or uninterrupted.
              Engineering calculator results are approximations and should not be used as
              the sole basis for structural or safety decisions without professional review.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, EngineX Mart shall not be liable for
              any indirect, incidental, special, or consequential damages arising from your
              use of our platform. Our total liability shall not exceed the amount paid for
              the specific product or service giving rise to the claim.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms and Conditions are governed by and construed in accordance with
              the laws of Bangladesh. Any disputes shall be resolved in the courts of Dhaka,
              Bangladesh.
            </p>
          </Section>

          <Section title="14. Contact Information">
            <p>For questions about these Terms, please contact us:</p>
            <div className="card p-5 bg-dark-50 mt-4">
              <div className="space-y-2 text-sm text-dark-600">
                <p><strong>EngineX Mart</strong></p>
                <p>Email: legal@buildenginex.vercel.app</p>
                <p>Phone: {process.env.NEXT_PUBLIC_CALL_NUMBER || "+880 1XXX-XXXXXX"}</p>
                <p>Address: Dhaka, Bangladesh</p>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-xl font-bold text-dark-900 border-b border-dark-100 pb-2">
        {title}
      </h2>
      <div className="text-dark-600 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}
