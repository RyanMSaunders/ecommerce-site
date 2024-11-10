
"use client"

import { Label } from "@radix-ui/react-label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { formatCurrency } from "@/lib/formatters"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addProduct } from "../../_actions/products"
import { useFormStatus } from "react-dom"
import { useFormState } from "react-dom"
import { useActionState } from "react"

export function ProductForm() {
  const [error, action] = useActionState(addProduct, {})
  const [priceInCents, setPriceInCents] = useState<number>()

  return (
  < form action={action} className="space-y-8">
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input type="text" id="name" name="name" required />
      { error.name && <div className="text-destructive">{error.name}</div>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="priceInCents">Price In Cents</Label>
      <Input 
        type="number"  
        id="priceInCents" 
        name="priceInCents" 
        required 
        value={priceInCents} 
        onChange={e => setPriceInCents(Number(e.target.value) || undefined)}
      />
      <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
      </div>
    { error.priceInCents && <div className="text-destructive">{error.priceInCents}</div>}

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" name="description" required />
      { error.description && <div className="text-destructive">{error.description}</div>}

    </div>
    <div className="space-y-2">
      <Label htmlFor="file">File</Label>
      <Input type="file" id="file" name="file" required />
      { error.file && <div className="text-destructive">{error.file}</div>}

    </div>
    <div className="space-y-2">
      <Label htmlFor="image">Image</Label>
      <Input type="file" id="image" name="image" required />
      { error.image && <div className="text-destructive">{error.image}</div>}

    </div>
    <SubmitButton />

    </div>
  
  </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return  <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
}