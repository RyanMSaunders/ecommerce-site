
"use server"

import { z } from "zod"
import db from "@/db/db"
import fs from "fs/promises"
import { redirect } from "next/navigation"

// Defines a schema for validating a required file input
const fileSchema = z.instanceof(File, { message: "Required" })
// Extends file schema to ensure the file is an image type or empty
const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"))

// Schema for product data, with required fields and validation rules
const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required")
})

// Main function to add a product
export async function addProduct(formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data

 // Ensures "products" directory exists, creating it if necessary
  await fs.mkdir("products", { recursive: true })
// Generates a unique file path and saves the uploaded file
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))

// Ensures "public/products" directory exists for image, creating it if necessary
  await fs.mkdir("public/products", { recursive: true })
 // Generates a unique image path and saves the uploaded image in the public directory
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
  await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))

  // Saves product details, including file and image paths, to the database
  await db.product.create({ data: {
    name: data.name,
    description: data.description,
    priceInCents: data.priceInCents,
    filePath,
    imagePath

  }})
  
  // Redirects to the product administration page upon successful creation
  redirect("/admin/products")
}