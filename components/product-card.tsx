"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/supabaseClient"

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
  manufacturer?: string
}

interface ProductCardProps {
  product: Product
  width?: string
}

export default function ProductCard({ product, width = "max-w-[280px]" }: ProductCardProps) {
  const [categoryName, setCategoryName] = useState<string>("")

  useEffect(() => {
    const fetchCategory = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', product.category_id)
        .single()

      if (error) {
        console.error("Error fetching category:", error)
        setCategoryName("Неизвестная категория")
      } else {
        setCategoryName(data?.name || "Неизвестная категория")
      }
    }

    if (product.category_id) {
      fetchCategory()
    }
  }, [product.category_id])

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className={`bg-white transition-all duration-300 group-hover:scale-105 relative mx-auto h-[400px] flex flex-col ${width}`}>
        <div className="relative h-80 bg-white rounded-lg overflow-hidden">
          <Image 
            src={product.image_url || "/placeholder.svg"} 
            alt={product.name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          
          {/* Stock status badge - top right - only show when out of stock */}
          {product.in_stock !== undefined && !product.in_stock && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                <XCircle className="h-3 w-3 mr-1" />
                Нет в наличии
              </Badge>
            </div>
          )}
        </div>
        
        <div className="pt-2 pb-0 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate mb-1 text-left">
              {product.name}
            </h3>
            <p className="text-sm text-left border border-gray-300 px-2 py-1 inline-block"
              style={{
                backgroundColor: '#DBE3FA',
                borderRadius: '10px'
              }}
            >
              {categoryName}
            </p>
          </div>
        </div>
        
        {/* Arrow icon in bottom right corner */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-blue-500 rounded-lg p-2 shadow-lg">
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  )
}
