"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, XCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category_id: string
  in_stock?: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group-hover:shadow-xl relative h-96 flex flex-col">
        <div className="relative h-48 bg-sky-100">
          <Image 
            src={product.image_url || "/placeholder.svg"} 
            alt={product.name} 
            fill 
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Stock status badge - top right - only show when out of stock */}
          {product.in_stock !== undefined && !product.in_stock && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-100 text-red-700 border-red-200 font-montserrat text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Нет в наличии
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 pb-12 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-montserrat font-semibold mb-2 text-gray-800 group-hover:text-sky-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm font-montserrat text-gray-600 line-clamp-2">
              {product.description}
            </p>
          </div>
        </CardContent>
        
        {/* Arrow in bottom right corner */}
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center group-hover:bg-sky-600 transition-colors shadow-md">
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      </Card>
    </Link>
  )
}
