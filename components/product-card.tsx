"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category_id: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:shadow-xl relative">
        <div className="relative h-48 bg-sky-100">
          <Image 
            src={product.image_url || "/placeholder.svg"} 
            alt={product.name} 
            fill 
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
        <CardContent className="p-4 pb-12">
                <h3 className="text-lg font-montserrat font-semibold mb-2 text-gray-800 group-hover:text-sky-600 transition-colors">
        {product.name}
      </h3>
      <p className="text-sm font-montserrat text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </CardContent>
        
        {/* Arrow in bottom right corner */}
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center group-hover:bg-sky-600 transition-colors shadow-md">
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      </Card>
    </Link>
  )
}
