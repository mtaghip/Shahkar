import Link from "next/link";
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {emailConfigured} from "@/lib/admin-validation";
import {EmailForm,SendEmailForm} from "@/components/EmailForm";
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{edit?:string}>}){
 await requireAdmin();const {id}=await params;const {edit}=await searchParams;
 const message=await prisma.emailMessage.findUnique({where:{id},include:{customer:true}});
 if(!message)notFound();
 if(edit && message.status==="DRAFT")return <><div className="admin-heading"><h1>Edit draft</h1></div><EmailForm customers={[message.customer]} message={message}/></>;
 return <><div className="admin-heading"><div><h1>{message.subject}</h1><p>To: {message.recipient}</p></div><span className="badge">{message.status}</span></div>
 {message.status==="ACCEPTED" && <div className="admin-notice">Accepted by the email provider. This is not a delivery confirmation; check your Resend dashboard for delivery and bounce events.</div>}
 {["UNKNOWN","SENDING"].includes(message.status) && <div className="admin-notice warning">Do not send another copy until you have checked the provider dashboard. The final outcome is not confirmed here.</div>}
 {message.error && <div className="admin-notice warning">{message.error}</div>}
 <section className="admin-card"><h2>Message preview</h2><div className="message-body">{message.body}</div><p style={{marginTop:16}}><small>Recipient saved with this draft. Customer profile changes do not change this recipient unless you edit and re-save the draft.</small></p></section>
 {message.status==="DRAFT" && <section className="admin-card"><h2>Ready to send?</h2>{!emailConfigured() && <p><Link href="/admin/settings">Configure your email sender</Link> before sending.</p>}<SendEmailForm id={id} recipient={message.recipient} enabled={emailConfigured()}/><p style={{marginTop:20}}><Link href={"?edit=1"}>Edit this draft</Link></p></section>}<Link href={"/admin/customers/"+message.customerId}>View customer →</Link></>;
}
