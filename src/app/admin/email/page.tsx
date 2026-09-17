import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {emailConfigured,pageNumber} from "@/lib/admin-validation";
export default async function Page({searchParams}:{searchParams:Promise<{page?:string}>}){
 await requireAdmin();const page=pageNumber((await searchParams).page);
 const [messages,count]=await Promise.all([prisma.emailMessage.findMany({orderBy:{createdAt:"desc"},take:25,skip:(page-1)*25}),prisma.emailMessage.count()]);
 return <><div className="admin-heading"><div><h1>Email</h1><p>Drafts and individual customer conversations</p></div><Link className="btn btn--solid" href="/admin/email/new">Write email</Link></div>
 {!emailConfigured() && <div className="admin-notice warning">You can save drafts now. <Link href="/admin/settings">Connect your email sender</Link> to send messages.</div>}
 <div className="table-scroll"><table className="table"><thead><tr><th>Subject</th><th>Recipient</th><th>Status</th><th>Created</th></tr></thead><tbody>{messages.map(m=><tr key={m.id}><td><Link href={"/admin/email/"+m.id}>{m.subject}</Link></td><td>{m.recipient}</td><td><span className={"badge "+(m.status==="ACCEPTED"?"good":m.status==="DRAFT"?"":"warn")}>{m.status==="ACCEPTED"?"Accepted by provider":m.status}</span></td><td>{m.createdAt.toLocaleDateString("en-GB")}</td></tr>)}</tbody></table>{!messages.length && <div className="admin-empty"><strong>Your conversations start here</strong>Write a message, save a draft, then review it before sending.</div>}</div><div className="pagination">{page>1 && <Link href={"?page="+(page-1)}>← Previous</Link>}<small>Page {page}</small>{page*25<count && <Link href={"?page="+(page+1)}>Next →</Link>}</div></>;
}
