"use client";
import {useActionState} from "react";
import {saveEmail,sendEmail} from "@/lib/actions/email";
export function EmailForm({customers,selected,message}:{customers:{id:string;name:string;email:string}[];selected?:string;message?:{id:string;subject:string;body:string;customerId:string}}){
 const [state,action,pending]=useActionState(saveEmail.bind(null,message?.id ?? null),{});
 return <form action={action}><div className="admin-card"><div className="pform">
 <label className="field field--wide"><span>To</span><select name="customerId" required defaultValue={message?.customerId || selected || ""}><option value="">Select a customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}</select></label>
 <label className="field field--wide"><span>Subject</span><input name="subject" required maxLength={200} defaultValue={message?.subject}/></label>
 <label className="field field--wide"><span>Message</span><textarea name="body" required rows={14} maxLength={20000} defaultValue={message?.body} placeholder="Write a personal message to your customer…"/></label>
 <small className="field--wide">For individual customer service messages. This is not a bulk marketing tool. You will review the saved draft before sending.</small></div></div>{state.error && <p className="authform__error" role="alert">{state.error}</p>}<button className="primary" disabled={pending || !customers.length}>{pending?"Saving…":"Save draft & review"}</button></form>;
}
export function SendEmailForm({id,recipient,enabled}:{id:string;recipient:string;enabled:boolean}){
 const [state,action,pending]=useActionState(sendEmail.bind(null,id),{});
 return <form action={action}><label className="checkline"><input type="checkbox" name="confirm" required disabled={!enabled || pending}/> I have checked the message and want to email {recipient}.</label><div style={{marginTop:16}}><button className="primary" disabled={!enabled || pending}>{pending?"Sending…":"Send email"}</button></div>{state.error && <p role="alert" className="authform__error">{state.error}</p>}</form>;
}
