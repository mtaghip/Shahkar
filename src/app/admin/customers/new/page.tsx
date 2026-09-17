import CustomerForm from "@/components/CustomerForm";
import {requireAdmin} from "@/lib/auth";
export default async function Page(){await requireAdmin();return <><div className="admin-heading"><div><h1>Add customer</h1><p>Keep every relationship in one place.</p></div></div><CustomerForm/></>;}
