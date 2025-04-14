"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/supabaseClient"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  is_featured: boolean
}

export default function Home() {
  const [popularToys, setPopularToys] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, category_id')
        .eq('is_featured', true)

      if (error) {
        console.error("Error fetching featured products:", error)
        setError("Failed to load popular toys.")
      } else {
        setPopularToys(data as Product[])
      }
      setLoading(false)
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Ошибка</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-sky-400 to-sky-300 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-10 h-10 bg-yellow-300 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-yellow-300 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-14 h-14 bg-yellow-300 rounded-full"></div>

          {/* Cloud shapes */}
          <div className="absolute top-1/4 left-1/3 w-32 h-16 bg-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/3 ml-10 mt-5 w-20 h-16 bg-white rounded-full"></div>
          <div className="absolute top-2/3 right-1/3 w-32 h-16 bg-white rounded-full"></div>
          <div className="absolute top-2/3 right-1/3 ml-10 mt-5 w-20 h-16 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Волшебный мир детских игрушек
            </h1>
            <p className="text-xl text-white mb-8">
              Подарите вашему ребенку радость и развитие с игрушками от Aria Toys
            </p>
            <Link href="/catalog">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold text-lg px-8 py-6 rounded-full">
                Смотреть игрушки
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Toys Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Популярные игрушки</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularToys.map((toy) => (
              <ProductCard key={toy.id} product={toy} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/catalog">
              <Button variant="outline" className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white">
                Смотреть все игрушки
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-sky-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">О нас</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg text-gray-700 mb-6">
                Aria Toys — это магазин качественных игрушек для детей всех возрастов. Мы тщательно отбираем каждую
                игрушку, уделяя особое внимание качеству материалов, безопасности и развивающему потенциалу.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Наша миссия — приносить радость детям и спокойствие родителям, предлагая игрушки, которые не только
                развлекают, но и способствуют развитию важных навыков и творческого мышления.
              </p>
              <p className="text-lg text-gray-700">
                Мы верим, что каждый ребенок уникален, и стремимся предложить разнообразный ассортимент игрушек, чтобы
                каждый малыш нашел то, что ему по душе.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
