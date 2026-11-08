import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Cookie notice — Shahkar Carpets",
  description: "The cookies Shahkar Carpets uses, and why no consent banner is needed.",
  alternates: { canonical: "/cookies" },
};

const COOKIES = [
  { name: "shahkar_cart", purpose: "Remembers what is in your bag.", lasts: "30 days" },
  {
    name: "shahkar_session",
    purpose: "Keeps you signed in to your account.",
    lasts: "30 days, or until you sign out",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookies"
      title="Cookie notice"
      intro="We use a small number of strictly necessary cookies and nothing else — no advertising, tracking or analytics cookies."
    >
      <h2>The cookies we set</h2>
      <div className="table-scroll" style={{ margin: "8px 0 24px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>What it does</th>
              <th>How long</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c) => (
              <tr key={c.name}>
                <td>
                  <code>{c.name}</code>
                </td>
                <td>{c.purpose}</td>
                <td>{c.lasts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Because these cookies are strictly necessary for features you ask for — your bag and your account —
        the law (the Privacy and Electronic Communications Regulations) does not require us to ask for your
        consent, so we don&rsquo;t show a cookie banner.
      </p>

      <h2>Card payments</h2>
      <p>
        When you pay by card you are taken to Stripe&rsquo;s secure checkout, which sets its own cookies to
        prevent fraud. Those are governed by Stripe&rsquo;s cookie policy.
      </p>

      <h2>Controlling cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. If you block these two, your bag and sign-in
        won&rsquo;t work.
      </p>
    </LegalPage>
  );
}
