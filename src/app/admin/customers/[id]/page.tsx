import Link from "next/link";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {formatExact} from "@/lib/money";
import CustomerForm from "@/components/CustomerForm";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string}>}){
 await requireAdmin();const {id}=await params;const {saved}=await searchParams;
 const customer=await prisma.customer.findUnique({where:{id},include:{orders:{orderBy:{createdAt:"desc"},take:20},messages:{orderBy:{createdAt:"desc"},take:10},_count:{select:{orders:true}}}});
 if(!customer)notFound();
 const paid=await prisma.order.aggregate({where:{customerId:id,status:"PAID"},_sum:{totalPence:true}});
 return <>{saved && <div className="admin-notice" role="status">Customer saved.</div>}<div className="admin-heading"><div><h1>{customer.name}</h1><p>Customer since {customer.createdAt.toLocaleDateString("en-GB")}</p></div><Link className="btn btn--solid" href={"/admin/email/new?customer="+id}>Write email</Link></div>
 <div className="admin-columns"><CustomerForm customer={customer}/><div><section className="admin-card"><h2>Customer overview</h2><p><strong>{formatExact(paid._sum.totalPence || 0)}</strong> paid lifetime spend</p><p>{customer._count.orders} orders</p><h3>Recent orders</h3>{customer.orders.map(o=><Link className="quick-link" key={o.id} href={"/admin/orders?q="+encodeURIComponent(o.reference)}><strong>{o.reference} · {formatExact(o.totalPence)}</strong><small>{o.status.replaceAll("_"," ")} · {o.createdAt.toLocaleDateString("en-GB")}</small></Link>)}{!customer.orders.length && <p className="subtle">No orders yet.</p>}</section><section className="admin-card"><h2>Email history</h2>{customer.messages.map(m=><Link key={m.id} className="quick-link" href={"/admin/email/"+m.id}><strong>{m.subject}</strong><small>{m.status} · {m.createdAt.toLocaleDateString("en-GB")}</small></Link>)}{!customer.messages.length && <p className="subtle">No emails yet.</p>}</section></div></div></>;
}
