"use client";
import { useState } from "react";
export default function ProductMedia({initial = [], onBusy}: {initial?:string[];onBusy:(busy:boolean)=>void}) {
 const [ids,setIds] = useState(initial);
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState("");
 async function upload(files:FileList|null) {
  if (!files || busy) return;
  setError("");
  if (ids.length + files.length > 6) {setError("Use up to six photos per product.");return;}
  setBusy(true);onBusy(true);
  try {
   for (const file of Array.from(files)) {
    if (file.size > 3_000_000) throw new Error("Each photo must be under 3 MB.");
    const body = new FormData();body.set("file",file);
    const response = await fetch("/api/admin/media",{method:"POST",body});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Upload failed.");
    setIds(current=>[...current,result.id]);
   }
  } catch(error) {setError(error instanceof Error ? error.message : "Upload failed. Please retry.");}
  finally {setBusy(false);onBusy(false);}
 }
 return <div className="field--wide"><h2>Product photos</h2><div className="upload-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files);}}>
 <label className="field"><span>{busy ? "Uploading and optimising…" : "Drop photos here or choose files"}</span><input aria-label="Upload product photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || ids.length>=6} onChange={e=>{void upload(e.target.files);e.target.value="";}}/></label><small>Up to six JPEG, PNG or WebP photos, 3 MB each. The first photo is the cover.</small>
 </div><input type="hidden" name="imageIds" value={ids.join(",")}/>
 <div className="media-list">{ids.map((id,index)=><figure key={id}><img src={"/api/media/"+id} alt={"Product photo "+(index+1)}/><figcaption><small>{index===0 ? "Cover photo" : "Photo "+(index+1)}</small><button type="button" disabled={busy} onClick={()=>setIds(current=>current.filter(item=>item!==id))}>Remove photo {index+1}</button>{index>0 && <button type="button" disabled={busy} onClick={()=>setIds(current=>[id,...current.filter(item=>item!==id)])}>Make cover</button>}</figcaption></figure>)}</div>
 {error && <p className="authform__error" role="alert">{error}</p>}</div>;
}
