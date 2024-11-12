// import db from "@/db/db";
// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs/promises"

// export async function GET(req: NextRequest, {params: { downloadVerificationId }, }: { params: {downloadVerificationId: string}}) {
//   const data = await db.downloadVerification.findUnique({
//     where: { id: downloadVerificationId, expiresAt: { gt: new Date()} },
//     select: { product: { select: { filePath: true, name: true } }}
//   })
 
//   if (data == null ) {
//     return NextResponse.redirect(new URL("/products/download/expired", req.url))
//   }

//   const { size } = await fs.stat(data.product.filePath)
//   const file = await fs.readFile(data.product.filePath)
//   const extension = data.product.filePath.split(".").pop()

//     // Return the file as a response with download headers
//   return new NextResponse(file, { headers: {
//     "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
//     "Content-Length": size.toString()
//   }})

//   return new NextResponse("Hi")
// }



// import db from "@/db/db"
// import { NextRequest, NextResponse } from "next/server"
// import fs from "fs/promises"

// export async function GET(
//   req: NextRequest,
//   {
//     params: { downloadVerificationId },
//   }: { params: { downloadVerificationId: string } }
// ) {
//   const data = await db.downloadVerification.findUnique({
//     where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
//     select: { product: { select: { filePath: true, name: true } } },
//   })

//   if (data == null) {
//     return NextResponse.redirect(new URL("/products/download/expired", req.url))
//   }

//   const { size } = await fs.stat(data.product.filePath)
//   const file = await fs.readFile(data.product.filePath)
//   const extension = data.product.filePath.split(".").pop()

//   return new NextResponse(file, {
//     headers: {
//       "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
//       "Content-Length": size.toString(),
//     },
//   })
// }


import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";


export async function GET(
  req: NextRequest,
  { params: { downloadVerificationId } }: { params: { downloadVerificationId: string } }
) {

  if (!downloadVerificationId) {
    console.error("Download Verification ID is missing or invalid in route.ts");
    return NextResponse.redirect(new URL("/products/download/error", req.url));
  }

  const data = await db.downloadVerification.findUnique({
    where: { id: downloadVerificationId },
    select: {
      product: {
        select: {
          filePath: true,
          name: true,
        },
      },
    },
  });
  console.log("Fetched data:", data);
  console.log("Download Verification ID:", downloadVerificationId);



  if (data == null) {
    return NextResponse.redirect(new URL("/products/download/expired", req.url))
  }

  try {

    // Resolve the absolute path for the file
    const resolvedFilePath = path.resolve(process.cwd(), `public${data.product.filePath}`);
    console.log("Resolved file path:", resolvedFilePath);

    // Check if the file exists
    const { size } = await fs.stat(resolvedFilePath);
    const file = await fs.readFile(resolvedFilePath);
    const extension = resolvedFilePath.split(".").pop();


    // console.log("File path:", data.product.filePath);
    // const { size } = await fs.stat(data.product.filePath);
    // const file = await fs.readFile(data.product.filePath);
    // const extension = data.product.filePath.split(".").pop();

    return new NextResponse(file, {
      headers: {
        "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": size.toString(),
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL("/products/download/error", req.url));
  }
}