// End-to-end browser tests. Run against a production build with a freshly
// migrated and seeded database:
//
//   npm run db:reset && npm run build && npm start &   # in another shell
//   npm run test:e2e
//
// Env: E2E_BASE_URL (default http://localhost:3000), ADMIN_EMAIL /
// ADMIN_PASSWORD (default dev credentials), E2E_CHROMIUM_PATH (optional).
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const B = (process.env.E2E_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@shahkarcarpets.co.uk").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "shahkar-admin";
const db = new PrismaClient();
const results = [];
let section = "";
const ok = (name, cond, extra = "") => {
  results.push({ name: `${section} › ${name}`, ok: !!cond });
  console.log(`${cond ? "✓" : "✗"} ${section} › ${name}${extra ? "  — " + extra : ""}`);
};
const step = (name) => {
  section = name;
  console.log(`\n${name}`);
};

const browser = await chromium.launch({
  ...(process.env.E2E_CHROMIUM_PATH ? { executablePath: process.env.E2E_CHROMIUM_PATH } : {}),
  args: ["--no-sandbox"],
});
const newPage = async () => (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const login = async (page, email, password) => {
  await page.goto(B + "/account/login");
  await page.fill("input[name=email]", email);
  await page.fill("input[name=password]", password);
  await page.click('button:has-text("Sign in")');
  await page.waitForLoadState("networkidle");
};
const addToBag = async (page, slug) => {
  await page.goto(`${B}/product/${slug}`);
  await page.click('button:has-text("Add to bag")');
  await page.waitForFunction(() =>
    /Bag \([1-9]/.test(document.querySelector(".header__util")?.textContent || "")
  );
};
const fillCheckout = async (page, name, email) => {
  await page.goto(B + "/checkout");
  await page.fill("input[name=name]", name);
  await page.fill("input[name=email]", email);
  await page.fill("input[name=address]", "1 Test Lane");
  await page.fill("input[name=postcode]", "TE1 1ST");
};

try {
  await db.rateLimit.deleteMany();

  step("Storefront & SEO");
  {
    const home = await (await fetch(B + "/")).text();
    ok("home renders live counts", /1860–1940 · \d+ pieces/.test(home));
    ok("no fictional company number", !/08812449/.test(home));
    const z = await (await fetch(B + "/product/ziegler")).text();
    ok("product shows its own specs", /Sultanabad \(Arak\)/.test(z) && !/Heriz district/.test(z));
    ok("product has Product structured data", /"@type":"Product"/.test(z));
    ok("robots.txt blocks admin", /Disallow: \/admin/.test(await (await fetch(B + "/robots.txt")).text()));
    ok("sitemap lists products", /\/product\/heriz/.test(await (await fetch(B + "/sitemap.xml")).text()));
    for (const p of ["/terms", "/privacy", "/cookies"])
      ok(`${p} renders`, (await fetch(B + p)).status === 200);
  }

  step("Admin & caching");
  const admin = await newPage();
  await login(admin, ADMIN_EMAIL, ADMIN_PASSWORD);
  ok("admin signs in", admin.url().endsWith("/admin"));
  ok(
    "unauthenticated admin is redirected",
    (await fetch(B + "/admin", { redirect: "manual" })).status >= 300
  );
  await admin.goto(B + "/admin/discounts");
  await admin.fill("input[name=code]", "E2E10");
  await admin.fill("input[name=value]", "10");
  await admin.fill("input[name=maxUses]", "5");
  await admin.click('button:has-text("Create code")');
  await admin.waitForSelector("text=Code created.");
  ok("discount code created", true);
  await admin.goto(B + "/admin/products");
  await admin.click('a:has-text("Serapi runner")');
  await admin.waitForURL("**/edit");
  await admin.fill("input[name=price]", "9123");
  await admin.click('button:has-text("Save changes")');
  await admin.waitForURL("**/admin/products?updated=1");
  ok(
    "price edit visible immediately despite caching",
    /£9,123/.test(await (await fetch(B + "/collection")).text())
  );

  // Photo upload → optimised storefront image → lightbox
  await admin.goto(B + "/admin/products");
  await admin.click('a:has-text("Ziegler Sultanabad")');
  await admin.waitForURL("**/edit");
  const photos = await Promise.all(
    ["#8d3229", "#2a4d66"].map((c) =>
      sharp({ create: { width: 1800, height: 1400, channels: 3, background: c } })
        .jpeg()
        .toBuffer()
    )
  );
  await admin.setInputFiles(
    'input[type="file"]',
    photos.map((buffer, i) => ({ name: `p${i}.jpg`, mimeType: "image/jpeg", buffer }))
  );
  await admin.waitForFunction(() => document.querySelectorAll(".media-list figure").length === 2, null, {
    timeout: 30000,
  });
  await admin.click('button:has-text("Save changes")');
  await admin.waitForURL("**/admin/products?updated=1");
  const shopper = await newPage();
  await shopper.goto(B + "/product/ziegler");
  ok(
    "uploaded photo served through the image optimiser",
    (await shopper.locator(".gallery-main img").getAttribute("src"))?.startsWith("/_next/image")
  );
  await shopper.click(".gallery-main");
  await shopper.waitForSelector("dialog.lightbox[open]");
  await shopper.keyboard.press("ArrowRight");
  ok("lightbox opens and navigates", /2 \/ 2/.test(await shopper.textContent(".lightbox__bar")));
  await shopper.keyboard.press("Escape");
  ok("lightbox closes with Esc", !(await shopper.$eval("dialog.lightbox", (d) => d.open)));

  // Phone-sized originals are shrunk in the browser before upload.
  await admin.goto(B + "/admin/products");
  await admin.click('a:has-text("Ziegler Sultanabad")');
  await admin.waitForURL("**/edit");
  const big = await sharp({
    create: { width: 4032, height: 3024, channels: 3, noise: { type: "gaussian", mean: 128, sigma: 60 } },
  })
    .jpeg({ quality: 100 })
    .toBuffer();
  ok("test photo is larger than the 3 MB server limit", big.length > 3_000_000, `${big.length} bytes`);
  await admin.setInputFiles('input[type="file"]', {
    name: "IMG_0001.jpg",
    mimeType: "image/jpeg",
    buffer: big,
  });
  await admin.waitForFunction(() => document.querySelectorAll(".media-list figure").length === 3, null, {
    timeout: 60000,
  });
  ok("large phone photo is resized in the browser and accepted", true);
  await admin.setInputFiles('input[type="file"]', {
    name: "broken.heic",
    mimeType: "image/heic",
    buffer: Buffer.from("not really an image"),
  });
  await admin.waitForSelector(".authform__error");
  ok(
    "unreadable photo gives a clear message",
    /Export it as a JPEG/.test(await admin.textContent(".authform__error"))
  );

  step("Checkout, discount, VAT-ready totals, invoice");
  const buyer = await newPage();
  await addToBag(buyer, "meander");
  await fillCheckout(buyer, "Jane Buyer", "jane@example.com");
  await buyer.check('input[name="shipping"][value="uk-express"]');
  await buyer.fill('input[aria-label="Discount code"]', "e2e10");
  await buyer.click('button:has-text("Apply")');
  await buyer.waitForSelector("text=Code E2E10 applied.");
  ok("checkout total = 6,400 − 640 + 45", /£5,805\.00/.test(await buyer.textContent("aside")));
  await buyer.click('button:has-text("Place order")');
  await buyer.waitForURL("**/order/**");
  const orderId = new URL(buyer.url()).pathname.split("/").pop();
  const orderText = await buyer.textContent("main");
  ok("order shows discount and total", /Discount \(E2E10\)/.test(orderText) && /£5,805\.00/.test(orderText));
  await buyer.goto(`${B}/order/${orderId}/invoice`);
  ok("invoice renders", /Invoice/.test(await buyer.textContent("main")));

  step("Concurrent checkout of a one-of-a-kind piece");
  {
    const [p1, p2] = [await newPage(), await newPage()];
    await addToBag(p1, "bakhshaish");
    await addToBag(p2, "bakhshaish");
    await fillCheckout(p1, "Racer One", "one@example.com");
    await fillCheckout(p2, "Racer Two", "two@example.com");
    await Promise.all([
      p1.click('button:has-text("Place order")'),
      p2.click('button:has-text("Place order")'),
    ]);
    await Promise.all([p1.waitForTimeout(4000), p2.waitForTimeout(4000)]);
    const orders = await db.order.count({ where: { items: { some: { product: { slug: "bakhshaish" } } } } });
    ok("exactly one order wins", orders === 1, `${orders} orders`);
    const loser = [p1, p2].find((p) => !p.url().includes("/order/"));
    const msg = loser ? await loser.textContent("main") : "";
    const path = /just been reserved/.test(msg)
      ? "atomic reservation"
      : /no longer available/.test(msg)
        ? "availability check"
        : "";
    ok("the other buyer is told it's gone", !!path, path);
  }

  step("Atomic stock claim under real parallel load");
  {
    const probe = await db.product.create({
      data: {
        slug: "race-probe-" + Date.now(),
        name: "Race probe",
        tag: "",
        meta: "",
        pricePence: 100,
        category: "antique",
        description: "",
        provenance: "",
        imageCaption: "",
        stock: 1,
        status: "ACTIVE",
      },
    });
    // The same conditional update placeOrder runs inside its transaction.
    const claims = await Promise.all(
      Array.from({ length: 10 }, () =>
        db.$transaction((tx) =>
          tx.product.updateMany({
            where: { id: probe.id, status: "ACTIVE", reserved: false, stock: { gte: 1 } },
            data: { stock: { decrement: 1 }, reserved: true },
          })
        )
      )
    );
    const winners = claims.filter((c) => c.count === 1).length;
    ok("10 parallel claims → exactly 1 winner", winners === 1, `${winners} winners`);
    ok("stock never goes negative", (await db.product.findUnique({ where: { id: probe.id } })).stock === 0);
    await db.product.delete({ where: { id: probe.id } });
  }

  step("Payment, fulfilment, return, refund, restock");
  await admin.goto(`${B}/admin/orders/${orderId}`);
  await admin.click('button:has-text("Mark as paid")');
  await admin.waitForSelector("text=Refund & restock");
  await admin.fill("input[name=trackingCarrier]", "Royal Mail");
  await admin.fill("input[name=trackingNumber]", "RM123GB");
  await admin.click('button:has-text("Mark fulfilled")');
  await admin.waitForTimeout(1000);
  await buyer.goto(`${B}/order/${orderId}`);
  ok("buyer sees tracking", /RM123GB/.test(await buyer.textContent("main")));
  await buyer.click('button:has-text("Request a return")');
  await buyer.waitForTimeout(1200);
  ok("return requested", (await db.return.count({ where: { orderId } })) === 1);
  const stockBefore = (await db.product.findUnique({ where: { slug: "meander" } })).stock;
  await admin.goto(`${B}/admin/orders/${orderId}`);
  for (const label of ["Approved", "Received", "Refund"]) {
    await admin.click(`button:has-text("${label}")`);
    await admin.waitForTimeout(900);
  }
  const refunded = await db.order.findUnique({ where: { id: orderId } });
  ok("order refunded", refunded.status === "REFUNDED");
  ok(
    "stock restored",
    (await db.product.findUnique({ where: { slug: "meander" } })).stock === stockBefore + 1
  );

  step("Authentication hardening");
  {
    const v = await newPage();
    for (let i = 0; i < 9; i++) await login(v, "victim@example.com", "wrong-" + i);
    ok("repeated failures are rate-limited", /Too many attempts/.test(await v.textContent("main")));
    const email = `cust${Date.now()}@example.com`;
    const c = await newPage();
    await c.goto(B + "/account/register");
    await c.fill("input[name=name]", "Reset Tester");
    await c.fill("input[name=email]", email);
    await c.fill("input[name=password]", "first-password");
    await c.click('button:has-text("Create account")');
    await c.waitForURL("**/account");
    const user = await db.user.findUnique({ where: { email } });
    const token = "e2e-" + Date.now();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const r = await newPage();
    await r.goto(`${B}/account/reset?token=${token}`);
    await r.fill("input[name=password]", "second-password");
    await r.click('button:has-text("Set new password")');
    await r.waitForURL("**/account/login?reset=1");
    ok("password reset completes", true);
    await c.goto(B + "/account");
    ok("old session signed out", c.url().includes("/account/login"));
    await login(c, email, "second-password");
    ok("new password works", c.url().endsWith("/account"));
    const exp = await c.evaluate(async () => (await fetch("/api/account/export")).json());
    ok(
      "customer can export own data",
      exp.account?.email === email && !JSON.stringify(exp).includes("passwordHash")
    );
  }

  step("Enquiries, newsletter, GDPR");
  {
    const v = await newPage();
    await v.goto(B + "/contact?piece=heriz");
    await v.fill("input[name=name]", "Hannah Trial");
    await v.fill("input[name=email]", "hannah@example.com");
    await v.click('button:has-text("Send enquiry")');
    await v.waitForSelector("text=Thank you");
    await v.goto(B + "/");
    await v.fill(".newsletter input[name=email]", "reader@example.com");
    await v.click(".newsletter button");
    await v.waitForSelector("text=on the list");
    await admin.goto(B + "/admin/inbox");
    ok("enquiry in admin inbox", /Hannah Trial/.test(await admin.textContent("main")));
    const csv = await admin.evaluate(async () => (await fetch("/api/admin/subscribers")).text());
    ok("subscriber in CSV export", /reader@example\.com/.test(csv));
    const cust = await db.customer.findUnique({ where: { email: "hannah@example.com" } });
    await admin.goto(`${B}/admin/customers/${cust.id}`);
    await admin.fill("input[name=confirm]", "ERASE");
    await admin.click('button:has-text("Erase personal data")');
    await admin.waitForURL("**?erased=1");
    ok(
      "erasure anonymises the customer",
      (await db.customer.findUnique({ where: { id: cust.id } })).name === "Erased customer"
    );
    ok(
      "erasure removes enquiries",
      (await db.enquiry.count({ where: { email: "hannah@example.com" } })) === 0
    );
  }
} catch (e) {
  ok("suite ran without exceptions", false, e.message.split("\n")[0]);
} finally {
  await browser.close();
  await db.$disconnect();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
