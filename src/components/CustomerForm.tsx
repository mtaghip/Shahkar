"use client";
import {useActionState} from "react";
import {saveCustomer} from "@/lib/actions/customers";
type CustomerFields = {id:string;name:string;email:string;phone:string;address:string;notes:string;tags:string;marketingConsent:boolean};
export default function CustomerForm({customer}: {customer?:CustomerFields}) {
 const [state,action,pending] = useActionState(saveCustomer.bind(null,customer?.id ?? null),{});
 return <form action={action}><div className="admin-card"><h2>Customer details</h2><div className="pform">
 <label className="field"><span>Full name</span><input name="name" required maxLength={150} defaultValue={customer?.name}/></label>
 <label className="field"><span>Email address</span><input type="email" name="email" required maxLength={254} defaultValue={customer?.email}/></label>
 <label className="field"><span>Phone</span><input name="phone" type="tel" defaultValue={customer?.phone}/></label>
 <label className="field"><span>Tags</span><input name="tags" placeholder="VIP, interior designer, London" defaultValue={customer?.tags}/></label>
 <label className="field field--wide"><span>Address</span><textarea name="address" rows={3} defaultValue={customer?.address}/></label>
 <label className="field field--wide"><span>Private notes</span><textarea name="notes" rows={5} defaultValue={customer?.notes} placeholder="Preferences, room dimensions, conversations…"/></label>
 <label className="checkline field--wide"><input type="checkbox" name="marketingConsent" defaultChecked={customer?.marketingConsent}/> Customer has explicitly agreed to marketing emails</label>
 <small className="field--wide">Record when and how permission was given in the private notes. Creating a customer does not create a login account or send an email.</small>
 </div></div>{state.error && <p role="alert" className="authform__error">{state.error}</p>}<button className="primary" disabled={pending}>{pending ? "Saving…" : "Save customer"}</button></form>;
}
