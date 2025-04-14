"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 bg-sky-100">
        <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-contain p-4" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <p className="text-lg font-bold text-sky-600">{product.price} ₽</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link href={`/product/${product.id}`}>
          <Button variant="outline" className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white">
            Подробнее
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
