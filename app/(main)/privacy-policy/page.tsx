import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Privacy Policy | Build EngineX",
  description: "Read Build EngineX's privacy policy to understand how we collect, use, and protect your personal information.",
};

const LAST_UPDATED = "June 1, 2025";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-12">
        <div className="container-main max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-primary-200 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container-main max-w-4xl py-12">
        <div className="prose prose-sm max-w-none space-y-8">

          <Section title="1. Introduction">
            <p>
              Welcome to Build EngineX (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are committed to protecting
              your personal information and your right to privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit our
              website and use our services.
            </p>
            <p>
              Please read this policy carefully. If you disagree with its terms, please
              discontinue use of our site.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>Personal Information You Provide</SubHeading>
            <ul>
              <li>Name, email address, and phone number (during registration)</li>
              <li>Delivery addresses and billing information</li>
              <li>Profile photo (optional)</li>
              <li>Messages and inquiries sent through our contact form</li>
              <li>Reviews and ratings you submit</li>
            </ul>
            <SubHeading>Information Automatically Collected</SubHeading>
            <ul>
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring URLs and search queries</li>
              <li>Device information (mobile, desktop, OS)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders and service bookings</li>
              <li>Send order confirmations and delivery updates via email and SMS</li>
              <li>Respond to your questions and customer support requests</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our website, products, and services</li>
              <li>Detect and prevent fraudulent transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Payment Information">
            <p>
              We do not store your full payment card details on our servers. Payment processing
              is handled by our trusted third-party providers:
            </p>
            <ul>
              <li><strong>bKash</strong> — Mobile banking payments</li>
              <li><strong>Nagad</strong> — Mobile banking payments</li>
              <li><strong>SSLCommerz</strong> — Credit/debit card payments</li>
            </ul>
            <p>
              These providers have their own privacy policies governing how they handle
              your payment information. We recommend reviewing their policies.
            </p>
          </Section>

          <Section title="5. Sharing Your Information">
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Delivery companies, SMS providers, and email services that help us operate our business</li>
              <li><strong>Payment Processors:</strong> To complete your transactions securely</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p>
              We do not sell, trade, or rent your personal information to third parties
              for marketing purposes.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement appropriate technical and organizational security measures to
              protect your personal information against unauthorized access, alteration,
              disclosure, or destruction. These include:
            </p>
            <ul>
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure Firebase authentication and Firestore database</li>
              <li>Regular security assessments</li>
              <li>Limited access to personal data by authorized personnel only</li>
            </ul>
            <p>
              However, no method of transmission over the internet is 100% secure.
              We cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              We use cookies and similar tracking technologies to enhance your experience
              on our website. Cookies are small files stored on your device that help us:
            </p>
            <ul>
              <li>Remember your login session</li>
              <li>Save your cart items</li>
              <li>Understand how you use our site</li>
              <li>Deliver relevant content and advertisements</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling cookies
              may affect the functionality of our website.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Ask us to correct inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
            </ul>
            <p>
              To exercise these rights, please contact us at
              <strong> privacy@buildenginex.vercel.app</strong>.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Our services are not directed to children under the age of 13. We do not
              knowingly collect personal information from children. If you believe we
              have collected information from a child, please contact us immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you
              of any significant changes by posting the new policy on this page and
              updating the &quot;Last updated&quot; date. We encourage you to review this
              policy periodically.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="card p-5 bg-dark-50 not-prose mt-4">
              <div className="space-y-2 text-sm text-dark-600">
                <p><strong>Build EngineX</strong></p>
                <p>Email: privacy@buildenginex.vercel.app</p>
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-semibold text-dark-800 mt-4 mb-2">{children}</p>
  );
}
