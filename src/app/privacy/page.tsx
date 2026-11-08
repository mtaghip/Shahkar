import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { COMPANY, legalLine } from "@/lib/company";

export const metadata = {
  title: "Privacy notice — Shahkar Carpets",
  description: "How Shahkar Carpets collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy notice"
      intro="We collect only what we need to sell you a carpet and look after you afterwards. We never sell your information."
    >
      <h2>Who is responsible</h2>
      <p>
        {legalLine()} is the controller of your personal information under the UK GDPR and the Data Protection
        Act 2018. Contact us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> about anything in this
        notice.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>Orders</strong> — name, email, phone, delivery address and what you bought, to fulfil your
          order (performance of a contract) and keep accounting records (legal obligation).
        </li>
        <li>
          <strong>Accounts</strong> — your email, name and a securely hashed password, so you can see your
          orders (contract). We never see or store your password itself.
        </li>
        <li>
          <strong>Enquiries</strong> — what you tell us through the contact form, to reply and arrange home
          trials (legitimate interests).
        </li>
        <li>
          <strong>Newsletter</strong> — your email and when you agreed, to send new listings (consent). You
          can unsubscribe at any time.
        </li>
        <li>
          <strong>Payments</strong> — card details go directly to Stripe; we never receive or store them.
        </li>
        <li>
          <strong>Security</strong> — limited technical data such as your IP address, briefly, to protect
          sign-in and forms from abuse (legitimate interests).
        </li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Only the service providers that run the shop for us, under contract and only on our instructions:
        Vercel (website hosting), Neon (database), Stripe (card payments) and Resend (email delivery), plus
        the couriers who deliver your carpet. Some of these process data in the United States under the UK
        International Data Transfer Agreement or the UK–US data bridge.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Order and payment records: six years, as UK tax law requires.</li>
        <li>Enquiries: two years after our last contact.</li>
        <li>Newsletter: until you unsubscribe.</li>
        <li>Accounts: until you ask us to delete yours.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your information, have it corrected or erased, restrict or object to how we
        use it, receive it in a portable format, and withdraw consent at any time. Signed-in customers can
        download their data from their <Link href="/account">account page</Link>; for anything else, email us
        and we&rsquo;ll respond within one month. We may keep order records we are legally required to retain.
      </p>
      <p>
        If you&rsquo;re unhappy with how we handle your information you can complain to the Information
        Commissioner&rsquo;s Office at{" "}
        <a href="https://ico.org.uk" target="_blank" rel="noreferrer">
          ico.org.uk
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        We use only the cookies needed to run the shop. See our <Link href="/cookies">cookie notice</Link>.
      </p>
    </LegalPage>
  );
}
