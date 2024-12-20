import db from "@/db/db";
import { notFound } from "next/navigation";
import fs from "fs/promises"
import { NextResponse, NextRequest } from "next/server";

// Define GET request handler for fetching and downloading a product fil
export async function GET(req: NextRequest, { params: { id }}: {params: { id: string }}) {
  const product = await db.product.findUnique({ 
    where: { id }, 
    select: { filePath: true, name: true }
  })

  if (product == null) return notFound()

  const { size } = await fs.stat(product.filePath)
  const file = await fs.readFile(product.filePath)
  const extension = product.filePath.split(".").pop()

    // Return the file as a response with download headers
  return new NextResponse(file, { headers: {
    "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
    "Content-Length": size.toString()
  }})
}