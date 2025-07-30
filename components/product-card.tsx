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
  image_urls?: string[]
  category_id: string
  in_stock?: boolean
  sku?: string
  age_range?: string
  brand_id?: string
  gender?: string
  is_new?: boolean
}

interface ProductCardProps {
  product: Product
  width?: string
  brandName?: string
}

export default function ProductCard({ product, width = "max-w-[280px]", brandName }: ProductCardProps) {

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className={`bg-white border border-gray-200 rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg relative mx-auto h-[350px] sm:h-[400px] flex flex-col ${width}`}>
        <div className="relative h-64 sm:h-80 bg-white rounded-lg overflow-hidden">
          <Image 
            src={product.image_url || "/placeholder.svg"} 
            alt={product.name} 
            fill 
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Stock status badge - top right - only show when out of stock */}
          {product.in_stock !== undefined && !product.in_stock && (
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Нет в наличии</span>
                <span className="sm:hidden">Нет</span>
              </Badge>
            </div>
          )}
          
          {/* New product badge - top left */}
          {product.is_new && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-semibold">
                Новинка
              </Badge>
            </div>
          )}
        </div>
        
        <div className="pt-2 pb-2 px-2 flex flex-col justify-between h-24 sm:h-28" style={{ backgroundColor: '#E0F2FE' }}>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 text-left line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1 sm:gap-2">
              <p className="text-xs sm:text-sm text-left border border-gray-300 px-1 sm:px-2 py-1 tracking-wide"
                style={{
                  backgroundColor: '#DBE3FA',
                  borderRadius: '10px'
                }}
              >
                {brandName || "Бренд не указан"}
              </p>
              
              {/* Gender badge */}
              {product.gender && (
                <p className="text-xs sm:text-sm text-left border border-gray-300 px-1 sm:px-2 py-1"
                  style={{
                    backgroundColor: '#F0FDF4',
                    borderRadius: '10px'
                  }}
                >
                  {product.gender === 'boys' ? 'М' : 
                   product.gender === 'girls' ? 'Ж' : 
                   'Для всех'}
                </p>
              )}
            </div>
            
            {/* Arrow icon */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-blue-500 rounded-lg p-1 sm:p-2 shadow-lg">
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
