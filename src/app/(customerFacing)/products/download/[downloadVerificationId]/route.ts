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
// import fs from "fs/promises";
// import path from "path";
import fetch from "node-fetch";  // Explicitly use node-fetch



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

  // Check if `data` is null before proceeding
  if (!data || !data.product || !data.product.filePath) {
    console.error("No valid data found for download verification ID:", downloadVerificationId);
    return NextResponse.redirect(new URL("/products/download/expired", req.url));
  }

  const blobFileUrl = data.product.filePath; // Assume filePath contains the Vercel Blob URL
  const fileName = data.product.name || "download";

  try {
    // Fetch the file from Vercel Blob
    const blobResponse = await fetch(blobFileUrl);

    if (!blobResponse.ok) {
      console.error("Error fetching file from Vercel Blob:", blobResponse.statusText);
      return NextResponse.redirect(new URL("/products/download/error", req.url));
    }

    const fileBuffer = await blobResponse.buffer(); // Get file as buffer
    const contentType = blobResponse.headers.get("content-type") || "application/octet-stream";
    const contentLength = blobResponse.headers.get("content-length") || fileBuffer.length.toString();

    // Return the file as a downloadable response
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": contentType,
        "Content-Length": contentLength,
      },
    });
  } catch (error) {
    console.error("Error handling file download:", error);
    return NextResponse.redirect(new URL("/products/download/error", req.url));
  }

  // if (data == null) {
  //   return NextResponse.redirect(new URL("/products/download/expired", req.url))
  // }

  // try {
  //   // Redirect to the static file URL
  //   return NextResponse.redirect(new URL(data.product.filePath, req.url));
  // } catch (error) {
  //   console.error("Error redirecting to file:", error);
  //   return NextResponse.redirect(new URL("/products/download/error", req.url));
  // }
}

// Vercel issue reading file system
  // try {

  //   // Resolve the absolute path for the file
  //   const resolvedFilePath = path.resolve(process.cwd(), `public${data.product.filePath}`);
  //   console.log("Resolved file path:", resolvedFilePath);

  //   // Check if the file exists
  //   const { size } = await fs.stat(resolvedFilePath);
  //   const file = await fs.readFile(resolvedFilePath);
  //   const extension = resolvedFilePath.split(".").pop();


  //   // console.log("File path:", data.product.filePath);
  //   // const { size } = await fs.stat(data.product.filePath);
  //   // const file = await fs.readFile(data.product.filePath);
  //   // const extension = data.product.filePath.split(".").pop();

  //   return new NextResponse(file, {
  //     headers: {
  //       "Content-Disposition": `attachment; filename="${data.product.name}.${extension}"`,
  //       "Content-Type": "application/octet-stream",
  //       "Content-Length": size.toString(),
  //     },
  //   });
  // } catch (error) {
  //   console.error("Error reading file:", error);
  //   return NextResponse.redirect(new URL("/products/download/error", req.url));
  // }
