
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import db from "@/db/db"
import { Product } from "@prisma/client"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { cache } from "@/lib/cache"

// Mock hardcoded products data. Temporary fix while fixing caching.
const hardcodedProducts = [
  { id: "1", name: "Intermediate Guitar Course", description: "Master intermediate guitar skills: riffs, scales, and techniques to elevate your playing to the next level.", priceInCents: 1999, imagePath: "/products/intermediate-guitar.jpg" },
  { id: "2", name: "Songwriting Course", description: "Unlock creativity and craft songs: melody, lyrics, and structure for impactful songwriting.", priceInCents: 2999, imagePath: "/products/songwriting.jpg" },
  { id: "3", name: "Strings Course", description: "Master string instruments: technique, bowing, and expression for violin, cello, and more.", priceInCents: 3999, imagePath: "/products/strings.jpg" },
  { id: "4", name: "Ukulele Course", description: "Learn ukulele basics: chords, strumming patterns, and songs to play confidently and with ease.", priceInCents: 2999, imagePath: "/products/ukulele.jpg" },
  { id: "5", name: "Singing Course", description: "Enhance your voice: vocal techniques, breath control, and confidence for powerful singing.", priceInCents: 1999, imagePath: "/products/singing.jpg" },
  { id: "6", name: "Advanced Piano Course", description: "Refine advanced piano skills: complex techniques, expressive dynamics, and performance mastery.", priceInCents: 3999, imagePath: "/products/advanced-piano.jpg" },
  { id: "7", name: "Beginner Piano Course", description: "Learn piano basics: keys, chords, and simple songs to build a strong musical foundation.", priceInCents: 2999, imagePath: "/products/beginner-piano.jpg" },
]


const getMostPopularProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 6,
    })
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 24 }
)

const getNewestProducts =  cache(() => {
  
  return db.product.findMany({ 
    where: {isAvailableForPurchase: true},
    orderBy: { createdAt: "desc"},
    take: 6
  })
}, ["/", "getNewestProducts"])
 

export default function HomePage() {
  return (
    <main className="space-y-12">
      <HeroSection />
      <ProductGridSection
        title="Most Popular"
        productsFetcher={getMostPopularProducts}
      />
      <ProductGridSection title="Newest" productsFetcher={getNewestProducts} />
    </main>
  )
}

type ProductGridSectionProps = {
  title: string
  productsFetcher: () => Promise<Product[]>
}


function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products" className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  )
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>
}) {
  return (await productsFetcher()).map(product => (
    <ProductCard key={product.id} {...product} />
  ))
}

// Hero Section Component
function HeroSection() {
  return (
    <div className="relative h-[400px] bg-cover bg-center" style={{ backgroundImage: 'url("../gabriel-gurrola-2UuhMZEChdc-unsplash.jpg")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-65 flex flex-col justify-center items-center text-center">
        {/* Main Heading */}
        <h1 className="text-6xl font-bold text-white italic mb-4">Welcome to Chord Café</h1>
        
        {/* Subheading */}
        <h2 className="text-3xl text-white opacity-80">Learn music online at your own pace with interactive video lessons!</h2>
      </div>
    </div>
  )
}