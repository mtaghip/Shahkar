import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {formatExact} from "@/lib/money";
import {pageNumber} from "@/lib/admin-validation";
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;status?:string;stock?:string;page?:string;created?:string;updated?:string}>}){
 await requireAdmin();const params=await searchParams;const q=(params.q || "").slice(0,150);const page=pageNumber(params.page);
 const status=["ACTIVE","DRAFT","ARCHIVED"].includes(params.status || "") ? params.status : undefined;
 const where={...(status?{status}:{}),...(params.stock==="low"?{stock:{lte:1}}:{}),OR:[{name:{contains:q,mode:"insensitive" as const}},{sku:{contains:q,mode:"insensitive" as const}}]};
 const [products,count]=await Promise.all([prisma.product.findMany({where,orderBy:{updatedAt:"desc"},take:25,skip:(page-1)*25}),prisma.product.count({where})]);
 const query=new URLSearchParams({q,status:status || "",stock:params.stock || ""});
 return <>{(params.created || params.updated) && <div role="status" className="admin-notice">Product {params.created?"created":"updated"} successfully.</div>}<div className="admin-heading"><div><h1>Products</h1><p>{count} products · Your curated collection</p></div><Link className="btn btn--solid" href="/admin/products/new">Add product</Link></div>
 <form className="admin-toolbar"><input name="q" aria-label="Search products" defaultValue={q} placeholder="Search products or SKU"/><select name="status" aria-label="Product status" defaultValue={status || ""}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select><select name="stock" aria-label="Inventory filter" defaultValue={params.stock || ""}><option value="">All inventory</option><option value="low">Low stock (0–1)</option></select><button className="btn">Filter</button></form>
 <div className="table-scroll"><table className="table"><thead><tr><th>Product</th><th>Status</th><th>Inventory</th><th>Category</th><th>Price</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><div className="product-cell">{p.imageIds[0]?<img className="product-thumb" src={"/api/media/"+p.imageIds[0]} alt=""/>:<div className="product-thumb"/>}<div><Link href={"/admin/products/"+p.id+"/edit"}>{p.name}</Link><small>{p.sku || "No SKU"}</small></div></div></td><td><span className={"badge "+(p.status==="ACTIVE"?"good":"")}>{p.status.toLowerCase()}</span></td><td>{p.stock} in stock{p.reserved && <small>Reserved</small>}</td><td>{p.category}</td><td>{formatExact(p.pricePence)}</td></tr>)}</tbody></table>{!products.length && <div className="admin-empty"><strong>No matching products</strong>Add a product or change your filters.</div>}</div>
 <div className="pagination">{page>1 && <Link href={"?"+query+"&page="+(page-1)}>← Previous</Link>}<small>Page {page}</small>{page*25<count && <Link href={"?"+query+"&page="+(page+1)}>Next →</Link>}</div></>;
}
