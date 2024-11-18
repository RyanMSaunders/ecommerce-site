
"use server"

import { z } from "zod"
import db from "@/db/db"
import fs from "fs/promises"
// import { join } from 'path'
import { notFound, redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob";


// const isProd = process.env.NODE_ENV === 'production'

// Helper function to get the appropriate base directory based on environment
// function getBaseDir() {
//   return isProd ? '/tmp' : process.cwd()
// }
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
export async function addProduct(prevState: unknown, formData: FormData) {
  // const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
  // if (result.success === false) {
  //   return result.error.formErrors.fieldErrors
  // }

  // const data = result.data
  // const baseDir = getBaseDir()
  
  // // For development and production, ensure images go to public/products
  // const productsDir = join(baseDir, 'products')
  // const publicProductsDir = join(baseDir, 'public', 'products')

  // // Create directories
  // await fs.mkdir(productsDir, { recursive: true })
  // await fs.mkdir(publicProductsDir, { recursive: true })

  // // Generate unique IDs
  // const fileId = crypto.randomUUID()
  // const imageId = crypto.randomUUID()
  
  // // Save the product file
  // const fullFilePath = join(productsDir, `${fileId}-${data.file.name}`)
  // await fs.writeFile(fullFilePath, Buffer.from(await data.file.arrayBuffer()))

  // // Save the image to public directory
  // const imageFileName = `${imageId}-${data.image.name}`
  // const fullImagePath = join(publicProductsDir, imageFileName)
  // await fs.writeFile(fullImagePath, Buffer.from(await data.image.arrayBuffer()))

  // // Store the consistent paths in database
  // const filePath = `products/${fileId}-${data.file.name}`
  // const imagePath = `/products/${imageFileName}`  // This path will work with your existing ProductCard

  // // Save to database
  // await db.product.create({
  //   data: {
  //     isAvailableForPurchase: false,
  //     name: data.name,
  //     description: data.description,
  //     priceInCents: data.priceInCents,
  //     filePath,
  //     imagePath
  //   },
  // })

  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // Generate unique IDs
  const fileId = crypto.randomUUID();
  const imageId = crypto.randomUUID();

  // Upload the product file to Vercel Blob
  const fileUpload = await put(`products/${fileId}-${data.file.name}`, await data.file.arrayBuffer(), {
    contentType: data.file.type,
    access: "public"
  });
  const filePath = fileUpload.url;

  // Upload the product image to Vercel Blob
  const imageUpload = await put(`public/products/${imageId}-${data.image.name}`, await data.image.arrayBuffer(), {
    contentType: data.image.type,
    access: "public"
  });
  const imagePath = imageUpload.url;

  // Save to the database
  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  revalidatePath("/")
  revalidatePath("/products")
  redirect("/admin/products")
}






export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
  await db.product.update({where: {id}, data: {isAvailableForPurchase} } )

  revalidatePath("/")
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({where: {id}})
  if (product == null) return notFound();

  fs.unlink(product.filePath)
  await fs.unlink(`public${product.imagePath}`)

  revalidatePath("/")
  revalidatePath("/products")
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional()
})


export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data
  const product = await db.product.findUnique({ where: { id }})

  if (product == null) return notFound()

  let filePath = product.filePath
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath)
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
  }

  let imagePath = product.imagePath
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`)
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))
  }



//  // Ensures "products" directory exists, creating it if necessary
//   await fs.mkdir("products", { recursive: true })
// // Generates a unique file path and saves the uploaded file
//   const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
//   await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))

// // Ensures "public/products" directory exists for image, creating it if necessary
//   await fs.mkdir("public/products", { recursive: true })
//  // Generates a unique image path and saves the uploaded image in the public directory
//   const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
//   await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))

  // Saves product details, including file and image paths, to the database
  await db.product.update({ 
    where: { id },
    data: {
    name: data.name,
    description: data.description,
    priceInCents: data.priceInCents,
    filePath,
    imagePath

    },
  })
 
  revalidatePath("/")
  revalidatePath("/products")
  redirect("/admin/products")
}