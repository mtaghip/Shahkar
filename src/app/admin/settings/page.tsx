import {requireAdmin} from "@/lib/auth";
import {emailConfigured} from "@/lib/admin-validation";
export default async function Page(){
 await requireAdmin();const ready=emailConfigured();
 return <><div className="admin-heading"><div><h1>Settings</h1><p>Your store connections and setup</p></div></div><section className="admin-card"><h2>Customer email</h2><p><span className={"badge "+(ready?"good":"warn")}>{ready?"Sender configured":"Setup required"}</span></p>
 <p>{ready?"Messages will be sent through Resend. A configured key does not guarantee that your sender domain is verified.":"Drafts are available. Sending stays disabled until you connect a verified email sender."}</p>
 <ol><li>Create or use your <a href="https://resend.com/domains" target="_blank" rel="noreferrer">Resend account</a> and verify the domain you want to send from.</li><li>In Vercel → shahkar → Settings → Environment Variables, add <code>RESEND_API_KEY</code> and <code>EMAIL_FROM</code> (for example, <code>Shahkar Carpets &lt;hello@your-domain.com&gt;</code>).</li><li>Optionally add <code>EMAIL_REPLY_TO</code> for customer replies, then redeploy.</li></ol>
 <p><small>Keep API keys in Vercel, not in customer notes or emails. The admin supports one-to-one service messages; bulk campaigns and unsubscribe management are not enabled.</small></p></section>
 <section className="admin-card"><h2>Product media</h2><p>Photos are optimised as WebP and stored in your existing PostgreSQL database. Up to six images per product, 3 MB per upload.</p><p><small>This suits a small catalogue. Monitor database storage as your collection grows.</small></p></section>
 <section className="admin-card"><h2>Store access</h2><p>Only signed-in administrators can access this workspace. Customer records and email history are private.</p><p><small>Admin credentials are managed through your Vercel ADMIN_EMAIL and ADMIN_PASSWORD settings. Never share your admin password with customers.</small></p></section></>;
}
