import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
export async function GET(_request: Request, {params}: {params:Promise<{id:string}>}) {
 const {id} = await params;
 const product = await prisma.product.findFirst({where:{status:"ACTIVE",imageIds:{has:id}},select:{id:true}});
 if (!product && (await getCurrentUser())?.role !== "admin") return new Response("Not found",{status:404});
 const media = await prisma.media.findUnique({where:{id}});
 if (!media) return new Response("Not found",{status:404});
 return new Response(new Uint8Array(media.data),{headers:{"Content-Type":"image/webp","X-Content-Type-Options":"nosniff","Cache-Control":product ? "public, max-age=300" : "private, no-store"}});
}
