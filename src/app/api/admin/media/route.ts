import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export async function POST(request: Request) {
 const user = await getCurrentUser();
 if (user?.role !== "admin") return Response.json({error:"Sign in as an administrator."},{status:401});
 const origin = request.headers.get("origin");
 if (!origin || new URL(origin).host !== request.headers.get("host")) return Response.json({error:"Invalid request origin."},{status:403});
 if (Number(request.headers.get("content-length")) > 3_200_000) return Response.json({error:"Images must be under 3 MB."},{status:413});
 try {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 3_000_000 || !["image/jpeg","image/png","image/webp"].includes(file.type)) return Response.json({error:"Choose a JPEG, PNG or WebP under 3 MB."},{status:400});
  const data = await sharp(Buffer.from(await file.arrayBuffer()), {limitInputPixels:30_000_000}).rotate().resize(1600,1600,{fit:"inside",withoutEnlargement:true}).webp({quality:80}).toBuffer();
  if (data.length > 1_000_000) return Response.json({error:"This image is too detailed. Please use a smaller image."},{status:400});
  const media = await prisma.media.create({data:{data:new Uint8Array(data)},select:{id:true}});
  return Response.json(media,{status:201});
 } catch { return Response.json({error:"The image could not be processed. Try a different photo."},{status:400}); }
}
