import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__cols">
        <div>
          <div className="footer__brand">SHAHKAR</div>
          <div className="footer__brandsub">Carpets · est. 1974</div>
          <p className="footer__note">
            New pieces are listed most Thursdays. Join the list and see them
            before they reach the site.
          </p>
          <NewsletterForm />
        </div>

        <div className="footer__col">
          <div className="footer__coltitle">Shop</div>
          <Link href="/collection?filter=antique">Antique &amp; collectable</Link>
          <Link href="/collection?filter=contemporary">
            Contemporary handmade
          </Link>
          <Link href="/collection">Runners</Link>
          <Link href="/collection">Under £5,000</Link>
        </div>

        <div className="footer__col">
          <div className="footer__coltitle">House</div>
          <Link href="/house">Our story</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/contact">Visit the showroom</Link>
          <Link href="/contact">Trade enquiries</Link>
        </div>

        <div className="footer__col">
          <div className="footer__coltitle">Care</div>
          <Link href="/contact">Home trial</Link>
          <Link href="/contact">Delivery &amp; returns</Link>
          <Link href="/contact">Cleaning &amp; repair</Link>
          <Link href="/contact">Valuations</Link>
        </div>
      </div>

      <div className="footer__legal">
        <div>&copy; 2026 Shahkar Carpets Ltd · Registered in England 08812449</div>
        <div className="footer__links">
          <Link href="/contact">Terms</Link>
          <Link href="/contact">Privacy</Link>
          <Link href="/contact">Instagram</Link>
        </div>
      </div>
    </footer>
  );
}
