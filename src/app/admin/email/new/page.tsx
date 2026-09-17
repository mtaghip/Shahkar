import Link from "next/link";
import {prisma} from "@/lib/prisma";
import {requireAdmin} from "@/lib/auth";
import {EmailForm} from "@/components/EmailForm";
export default async function Page({searchParams}:{searchParams:Promise<{customer?:string}>}){
 await requireAdmin();const {customer}=await searchParams;
 const customers=await prisma.customer.findMany({select:{id:true,name:true,email:true},orderBy:{name:"asc"}});
 return <><div className="admin-heading"><div><h1>Write email</h1><p>A personal conversation with your customer.</p></div></div>{!customers.length && <div className="admin-notice warning"><Link href="/admin/customers/new">Add a customer first</Link> to start writing.</div>}<EmailForm customers={customers} selected={customer}/></>;
}
