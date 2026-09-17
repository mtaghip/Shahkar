import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {pageNumber} from "@/lib/admin-validation";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}) {
 await requireAdmin();
 const params = await searchParams; const q=(params.q || "").slice(0,150);const page=pageNumber(params.page);
 const where={OR:[{name:{contains:q,mode:"insensitive" as const}},{email:{contains:q,mode:"insensitive" as const}},{tags:{contains:q,mode:"insensitive" as const}}]};
 const [customers,count]=await Promise.all([prisma.customer.findMany({where,orderBy:{createdAt:"desc"},skip:(page-1)*25,take:25,include:{_count:{select:{orders:true}}}}),prisma.customer.count({where})]);
 return <><div className="admin-heading"><div><h1>Customers</h1><p>{count} customer{count===1?"":"s"} · People behind your orders</p></div><Link className="btn btn--solid" href="/admin/customers/new">Add customer</Link></div>
 <form className="admin-toolbar"><input aria-label="Search customers" name="q" defaultValue={q} placeholder="Search name, email or tags"/><button className="btn">Search</button></form>
 <div className="table-scroll"><table className="table"><thead><tr><th>Customer</th><th>Location / address</th><th>Orders</th><th>Marketing permission</th><th>Tags</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><Link href={"/admin/customers/"+c.id}>{c.name}</Link><small>{c.email}</small></td><td>{c.address || "—"}</td><td>{c._count.orders}</td><td><span className={"badge "+(c.marketingConsent?"good":"")}>{c.marketingConsent?"Subscribed":"Not subscribed"}</span></td><td>{c.tags || "—"}</td></tr>)}</tbody></table>{!customers.length && <div className="admin-empty"><strong>No customers found</strong>Add your first customer, or try another search.</div>}</div>
 <div className="pagination">{page>1 && <Link href={"?q="+encodeURIComponent(q)+"&page="+(page-1)}>← Previous</Link>}<small>Page {page}</small>{page*25<count && <Link href={"?q="+encodeURIComponent(q)+"&page="+(page+1)}>Next →</Link>}</div></>;
}
