import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {formatExact} from "@/lib/money";
import {emailConfigured} from "@/lib/admin-validation";
export default async function Page(){
 await requireAdmin();
 const [products,customers,orders,revenue,recent,lowStock,drafts]=await Promise.all([
 prisma.product.count({where:{status:"ACTIVE"}}),prisma.customer.count(),prisma.order.count(),
 prisma.order.aggregate({where:{status:"PAID"},_sum:{totalPence:true}}),
 prisma.order.findMany({orderBy:{createdAt:"desc"},take:6}),
 prisma.product.count({where:{status:"ACTIVE",stock:{lte:1}}}),prisma.product.count({where:{status:"DRAFT"}})]);
 return <><div className="admin-heading"><div><h1>Your store, at a glance</h1><p>Welcome back. Here’s what’s happening at Shahkar.</p></div><Link className="btn" href="/" target="_blank">View store ↗</Link></div>
 <div className="admin-grid">{[["Paid revenue",formatExact(revenue._sum.totalPence || 0),"All time"],["Orders",orders,"All statuses"],["Active products",products,"Published in your store"],["Customers",customers,"Saved customer profiles"]].map(([label,value,detail])=><div className="metric" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</div>
 <div className="admin-columns"><div><section className="admin-card"><h2>Make room for your next great piece</h2><p className="subtle">Add photography, set your price and stock, and publish when your product is ready.</p><Link className="btn btn--solid" href="/admin/products/new">Add a product</Link><Link className="btn" style={{marginLeft:10}} href="/admin/products">Manage catalogue</Link></section>
 <section><div className="admin-heading"><h2>Recent orders</h2><Link href="/admin/orders">View all →</Link></div><div className="table-scroll"><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{recent.map(o=><tr key={o.id}><td><Link href={"/admin/orders?q="+o.reference}>{o.reference}</Link><small>{o.createdAt.toLocaleDateString("en-GB")}</small></td><td>{o.name}</td><td>{formatExact(o.totalPence)}</td><td><span className={"badge "+(o.status==="PAID"?"good":"")}>{o.status.replaceAll("_"," ")}</span></td></tr>)}</tbody></table>{!recent.length && <div className="admin-empty"><strong>Ready for your first order</strong>New orders will appear here automatically.</div>}</div></section></div>
 <div><section className="admin-card"><h2>Store checklist</h2><Link className="quick-link" href="/admin/products?status=DRAFT"><strong>{drafts} draft products</strong><small>Review and publish your next additions →</small></Link><Link className="quick-link" href="/admin/products?stock=low"><strong>{lowStock} products with low stock</strong><small>Includes one-of-a-kind pieces →</small></Link><Link className="quick-link" href="/admin/settings"><strong>{emailConfigured()?"Email sender configured":"Connect your email sender"}</strong><small>{emailConfigured()?"Review your email setup":"Save drafts now; connect Resend to send"} →</small></Link></section>
 <section className="admin-card"><h2>Build customer relationships</h2><p className="subtle">Save contact details, preferences and private notes, then write a personal follow-up.</p><Link className="btn" href="/admin/customers/new">Add customer</Link></section></div></div></>;
}
