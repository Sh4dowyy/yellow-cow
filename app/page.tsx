"use client"

import ProductCard from "@/components/product-card"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/supabaseClient"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category_id: string
}

export default function Home() {
  const [popularToys, setPopularToys] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const toysPerPage = 3

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, image_url, category_id')
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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-montserrat">Загрузка...</div>
    </div>
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-montserrat font-bold mb-4">Ошибка</h1>
        <p className="font-montserrat text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 py-20 overflow-hidden">
        {/* Animated Stars Background */}
        <div className="absolute inset-0">
          {/* Large Sky Stars */}
          <div className="absolute top-10 left-10 w-8 h-8 transform rotate-12">
            <div className="text-sky-300 text-4xl">⭐</div>
          </div>
          <div className="absolute top-20 right-20 w-6 h-6 transform -rotate-12">
            <div className="text-sky-400 text-3xl">⭐</div>
          </div>
          <div className="absolute bottom-16 left-1/4 w-6 h-6 transform rotate-45">
            <div className="text-sky-300 text-3xl">⭐</div>
          </div>
          <div className="absolute top-1/3 right-1/3 w-4 h-4 transform -rotate-45">
            <div className="text-sky-400 text-2xl">⭐</div>
          </div>
          <div className="absolute bottom-1/4 right-1/4 w-8 h-8 transform rotate-12">
            <div className="text-sky-300 text-4xl">⭐</div>
          </div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 transform -rotate-12">
            <div className="text-sky-400 text-2xl">⭐</div>
          </div>
          <div className="absolute bottom-1/3 right-1/5 w-6 h-6 transform rotate-45">
            <div className="text-sky-300 text-3xl">⭐</div>
          </div>

          {/* White Cloud shapes */}
          <div className="absolute top-1/4 left-1/3 w-24 h-12 bg-white rounded-full opacity-20"></div>
          <div className="absolute top-1/4 left-1/3 ml-8 mt-4 w-16 h-12 bg-white rounded-full opacity-15"></div>
          <div className="absolute bottom-1/3 right-1/4 w-28 h-14 bg-white rounded-full opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/4 ml-10 mt-5 w-18 h-12 bg-white rounded-full opacity-15"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* ARIA TOYS Logo Style */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 tracking-tight">
                <span className="inline-block bg-gradient-to-r from-sky-300 to-sky-400 bg-clip-text text-transparent">
                  ARIA
                </span>
                <span className="text-white ml-2">TOYS</span>
              </h1>
              <div className="w-20 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mx-auto"></div>
            </div>
            
            <p className="text-xl md:text-2xl font-montserrat font-bold text-white mb-8 leading-relaxed">
              Волшебный мир детских игрушек!
            </p>
            <p className="text-lg font-montserrat font-medium text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Подарите вашему ребенку радость и развитие с качественными игрушками. 
              От развивающих конструкторов до мягких плюшевых друзей!
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="/catalog" className="bg-sky-400 hover:bg-sky-500 text-white font-montserrat font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Открыть каталог
              </a>
              <button onClick={() => document.getElementById('popular-toys')?.scrollIntoView({ behavior: 'smooth' })} className="bg-blue-500 hover:bg-blue-600 text-white font-montserrat font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Популярные игрушки
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-blue-100 font-montserrat font-medium mb-2">Найдите идеальную игрушку для вашего малыша!</p>
              <p className="text-blue-200 font-montserrat text-sm">Используйте поиск или выберите категорию в меню</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Toys Section */}
      <section id="popular-toys" className="py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4">
                      <div className="text-center mb-12">
              <h2 className="text-4xl font-montserrat font-black text-blue-700 mb-4 tracking-tight">
                Популярные игрушки
              </h2>
              <p className="text-lg text-blue-600 font-montserrat font-medium">Самые любимые игрушки наших маленьких покупателей!</p>
            </div>
          
          {popularToys.length > 0 ? (
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentPage * 100}%)`
                  }}
                >
                  {/* Create pages of 3 toys each */}
                  {Array.from({ length: Math.ceil(popularToys.length / toysPerPage) }).map((_, pageIndex) => (
                    <div key={pageIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {popularToys
                          .slice(pageIndex * toysPerPage, (pageIndex + 1) * toysPerPage)
                          .map((toy) => (
                            <ProductCard key={toy.id} product={toy} />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {Math.ceil(popularToys.length / toysPerPage) > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all ${
                      currentPage === 0 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-sky-50 hover:border-sky-200'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(Math.min(Math.ceil(popularToys.length / toysPerPage) - 1, currentPage + 1))}
                    disabled={currentPage === Math.ceil(popularToys.length / toysPerPage) - 1}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all ${
                      currentPage === Math.ceil(popularToys.length / toysPerPage) - 1 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-sky-50 hover:border-sky-200'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}

              {/* Page Indicators */}
              {Math.ceil(popularToys.length / toysPerPage) > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {Array.from({ length: Math.ceil(popularToys.length / toysPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentPage 
                          ? 'bg-sky-500' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 font-montserrat">Популярные игрушки скоро появятся!</p>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 text-sky-300 text-3xl">⭐</div>
          <div className="absolute bottom-20 right-20 text-sky-300 text-3xl">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-montserrat font-black text-white mb-4 tracking-tight">
                О магазине ARIA TOYS
              </h2>
              <p className="text-xl text-blue-100 font-montserrat font-medium">Мы создаем волшебство детства уже много лет!</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-montserrat font-bold text-white mb-2">Качество превыше всего</h3>
                    <p className="text-blue-100 font-montserrat leading-relaxed">
                      Мы тщательно отбираем каждую игрушку, уделяя особое внимание качеству материалов и безопасности.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-montserrat font-bold text-white mb-2">Развитие и радость</h3>
                    <p className="text-blue-100 font-montserrat leading-relaxed">
                      Наши игрушки не только развлекают, но и способствуют развитию важных навыков и творческого мышления.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-montserrat font-bold text-white mb-2">Для каждого ребенка</h3>
                    <p className="text-blue-100 font-montserrat leading-relaxed">
                      Мы верим, что каждый ребенок уникален, и предлагаем разнообразный ассортимент для всех возрастов.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-montserrat font-bold text-white mb-2">Быстрая доставка</h3>
                    <p className="text-blue-100 font-montserrat leading-relaxed">
                      Заказывайте на популярных маркетплейсах и получайте игрушки максимально быстро!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
