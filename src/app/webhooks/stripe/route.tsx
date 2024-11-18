
// Called by Stripe when we have a successful payment, more secure, only called upon successful payment

import db from "../../../db/db"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import {Resend} from "resend"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string )
const resend = new Resend(process.env.RESEND_API_KEY as string)

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  )
  console.log("Stripe Event:", event);

  if (event.type === "charge.succeeded") {
    const charge = event.data.object
    const productId = charge.metadata.productId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount

    console.log("Charge Data:", { productId, email, pricePaidInCents });

    const product = await db.product.findUnique({ where: { id: productId}})
    console.log("Product Found:", product);

    if (product == null || email == null) {
      console.error("Missing product or email:", { product, email });
      return new NextResponse("Bad Request", { status: 400})
    }

    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents } },
    }
    console.log("User Fields for Upsert:", userFields);
    const {
      orders: [order],
    } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } },
    })

    console.log("Order Created/Updated:", order);

    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })

    console.log("Download Verification Created:", downloadVerification);
    
    console.log("Sending Confirmation Email...");
    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Order Confirmation",
      // react: <h1>Hi</h1>
      react: (
        <PurchaseReceiptEmail
          order={order}
          product={product}
          downloadVerificationId={downloadVerification.id}
        />
      ),
    })
    console.log("Email Sent Successfully");
  }

  return new NextResponse()

}