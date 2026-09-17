"use server";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {emailConfigured,validEmail} from "@/lib/admin-validation";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
export async function saveEmail(id:string|null,_prev:{error?:string},form:FormData):Promise<{error?:string}> {
 await requireAdmin();
 const customerId=String(form.get("customerId") || "");
 const subject=String(form.get("subject") || "").trim();
 const body=String(form.get("body") || "").trim();
 if (!subject || subject.length>200 || /[\r\n]/.test(subject) || !body || body.length>20000) return {error:"Add a subject (up to 200 characters) and message (up to 20,000 characters)."};
 const customer=await prisma.customer.findUnique({where:{id:customerId}});
 if(!customer || !validEmail(customer.email))return {error:"Select a saved customer with a valid email address."};
 if(id){
  const updated=await prisma.emailMessage.updateMany({where:{id,status:"DRAFT"},data:{customerId,recipient:customer.email,subject,body}});
  if(!updated.count)return {error:"Only drafts can be edited."};
 }else{
  const message=await prisma.emailMessage.create({data:{customerId,recipient:customer.email,subject,body}});
  id=message.id;
 }
 revalidatePath("/admin/email");redirect("/admin/email/"+id);
}
export async function sendEmail(id:string,_prev:{error?:string},form:FormData):Promise<{error?:string}> {
 await requireAdmin();
 if(form.get("confirm")!=="on")return {error:"Confirm the recipient and message before sending."};
 if(!emailConfigured())return {error:"Email sending is not configured. See Settings."};
 const message=await prisma.emailMessage.findUnique({where:{id}});
 if(!message || message.status!=="DRAFT")return {error:"This message is not a draft. Refresh to see its status."};
 const claimed=await prisma.emailMessage.updateMany({where:{id,status:"DRAFT"},data:{status:"SENDING",error:null}});
 if(!claimed.count)return {error:"This message is already being sent."};
 let status="UNKNOWN",providerId:string|null=null,error:string|null=null;
 try {
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json","Idempotency-Key":"shahkar-"+id},body:JSON.stringify({from:process.env.EMAIL_FROM,to:[message.recipient],subject:message.subject,text:message.body,...(process.env.EMAIL_REPLY_TO ? {reply_to:process.env.EMAIL_REPLY_TO} : {})}),signal:AbortSignal.timeout(15000)});
  const result=await response.json();
  if(response.ok && typeof result.id==="string"){status="ACCEPTED";providerId=result.id;}
  else if(response.status>=400 && response.status<500 && response.status!==408){status="FAILED";error="The email service rejected this request. Check your verified sender and API key in Settings.";}
  else {error="The email service did not confirm the outcome. Check Resend before sending another message.";}
 }catch{error="Delivery outcome is uncertain. Check Resend before sending another message.";}
 await prisma.emailMessage.update({where:{id},data:{status,providerId,error,sentAt:status==="ACCEPTED"?new Date():null}});
 revalidatePath("/admin/email");revalidatePath("/admin/customers/"+message.customerId);revalidatePath("/admin/email/"+id);
 return error ? {error} : {};
}
