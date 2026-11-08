import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { COMPANY, legalLine } from "@/lib/company";

export const metadata = {
  title: "Terms of sale — Shahkar Carpets",
  description: "The terms on which Shahkar Carpets sells antique and contemporary handmade carpets.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of sale"
      intro="These terms apply when you buy from us as a consumer. Nothing in them affects your statutory rights."
    >
      <h2>1. Who we are</h2>
      <p>
        This website is run by {legalLine()}
        {COMPANY.registeredOffice ? `, registered office ${COMPANY.registeredOffice}` : ""}. You can reach us
        at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or on {COMPANY.phone}.
      </p>

      <h2>2. Our carpets</h2>
      <p>
        Antique and collectable carpets are pre-owned, one-of-a-kind pieces. We describe their age, origin,
        condition and any repairs as accurately as we can, and photograph them as they are. Colours vary
        between screens, and handmade carpets are rarely perfectly square: measurements are accurate to within
        about 2%.
      </p>
      <p>
        Contemporary pieces marked &ldquo;made to order&rdquo; are woven for you. Lead times on each product
        page are estimates; we&rsquo;ll keep you updated if a workshop runs late.
      </p>

      <h2>3. Prices and payment</h2>
      <p>
        Prices are in pounds sterling and include VAT where it applies. The delivery charge, if any, is shown
        at checkout before you pay. You can pay by card through our payment provider, Stripe, or by
        arrangement with us. A piece is held for you once you place an order; if an order we have agreed to
        settle by arrangement isn&rsquo;t paid within 14 days, we may cancel it.
      </p>

      <h2>4. Our contract with you</h2>
      <p>
        Our contract is formed when we email to confirm your payment has been received. If we can&rsquo;t
        accept your order — for example because a piece has just been reserved by someone else — we&rsquo;ll
        tell you and refund anything you have paid.
      </p>

      <h2>5. Delivery</h2>
      <p>
        We deliver to the address you give at checkout. UK delivery includes underlay and fitting where the
        product page says so. The carpet becomes your responsibility once it has been delivered to you.
      </p>

      <h2>6. Your right to cancel and our 14-day home trial</h2>
      <p>
        Under the Consumer Contracts Regulations 2013 you may cancel your order for any reason within 14 days
        of the day you receive the carpet. This is also the length of our home trial. To cancel, use{" "}
        <strong>Request a return</strong> on your order page or email us. Please return the carpet within 14
        days of telling us, in the condition you received it; you pay the cost of returning it unless it is
        faulty or not as described. We&rsquo;ll refund the price and the standard delivery charge within 14
        days of receiving it back, to your original payment method.
      </p>
      <p>
        <strong>Made-to-measure pieces:</strong> the right to cancel does not apply to carpets made to your
        own specification (for example a size or colour you chose). We&rsquo;ll always confirm this with you
        before work starts.
      </p>

      <h2>7. If something is wrong</h2>
      <p>
        Your rights under the Consumer Rights Act 2015 are unaffected: goods must be as described, of
        satisfactory quality and fit for purpose. If a carpet is faulty or not as described, contact us and
        we&rsquo;ll repair, replace or refund it as the law provides.
      </p>

      <h2>8. Our liability</h2>
      <p>
        We are responsible for loss or damage you suffer that is a foreseeable result of our breaking these
        terms or failing to use reasonable care. We do not exclude liability where it would be unlawful to do
        so, including for death or personal injury caused by negligence, or for fraud.
      </p>

      <h2>9. Your information</h2>
      <p>
        We use your personal information as described in our <Link href="/privacy">privacy notice</Link>.
      </p>

      <h2>10. Law and disputes</h2>
      <p>
        These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland
        you may also bring proceedings there. Please contact us first — most problems are quickly put right.
      </p>
    </LegalPage>
  );
}
