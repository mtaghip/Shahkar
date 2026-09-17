"use server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validEmail } from "@/lib/admin-validation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
export async function saveCustomer(id:string|null,_prev:{error?:string},form:FormData):Promise<{error?:string}> {
 await requireAdmin();
 const email = String(form.get("email") || "").trim().toLowerCase();
 const name = String(form.get("name") || "").trim();
 if (!validEmail(email) || !name || name.length > 150) return {error:"Enter a name and valid email address."};
 const data = {email,name,phone:String(form.get("phone") || "").trim().slice(0,80),address:String(form.get("address") || "").trim().slice(0,1500),notes:String(form.get("notes") || "").trim().slice(0,10000),tags:String(form.get("tags") || "").trim().slice(0,500),marketingConsent:form.get("marketingConsent")==="on"};
 const duplicate = await prisma.customer.findUnique({where:{email}});
 if (duplicate && duplicate.id!==id) return {error:"A customer with this email already exists."};
 let customer;
 try {customer = id ? await prisma.customer.update({where:{id},data}) : await prisma.customer.create({data});}
 catch {return {error:"Could not save the customer. Refresh and try again."};}
 revalidatePath("/admin/customers");revalidatePath("/admin");
 redirect("/admin/customers/"+customer.id+"?saved=1");
}
