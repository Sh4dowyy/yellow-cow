"use client"

import ProductCard from "@/components/product-card"
import ContactButton from "@/components/contact-button"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/supabaseClient"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  image_urls?: string[]
  category_id: string
  in_stock: boolean
  is_new?: boolean
  manufacturer: string
  brand_id?: string
}

interface Brand {
  id: string
  name: string
}

interface BrandWithCount {
  id: string
  name: string
  productCount: number
}

export default function Home() {
  const [popularToys, setPopularToys] = useState<Product[]>([])
  const [brands, setBrands] = useState<BrandWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const toysPerPage = 5

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, description, image_url, image_urls, category_id, in_stock, is_new, manufacturer, brand_id')
          .eq('is_featured', true)

        if (productsError) {
          console.error("Error fetching featured products:", productsError)
          setError("Failed to load popular toys.")
        } else {
          // Сортируем так, чтобы новинки были первыми
          const sortedData = (productsData as Product[]).sort((a, b) => {
            if (a.is_new && !b.is_new) return -1
            if (!a.is_new && b.is_new) return 1
            return 0
          })
          setPopularToys(sortedData)
        }

        // Fetch brands with product counts
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name')

        if (brandsError) {
          console.error("Error fetching brands:", brandsError)
        } else {
          // Get product counts for each brand
          const brandsWithCounts = await Promise.all(
            (brandsData as Brand[]).map(async (brand) => {
              const { count } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('brand_id', brand.id)
              
              return {
                ...brand,
                productCount: count || 0
              }
            })
          )
          
          // Sort brands by product count and filter out those with 0 products
          const filteredBrands = brandsWithCounts
            .filter(brand => brand.productCount > 0)
            .sort((a, b) => b.productCount - a.productCount)
          
          setBrands(filteredBrands)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-2 tracking-widest">
                <span className="inline-block bg-gradient-to-r from-sky-300 to-sky-400 bg-clip-text text-transparent">
                  ARIA
                </span>
                <span className="text-white ml-2">TOYS</span>
              </h1>
              <div className="w-20 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mx-auto"></div>
            </div>
            
            
            <p className="text-lg sm:text-xl md:text-2xl font-montserrat font-bold text-white mb-8 leading-relaxed">
              Волшебный мир детских игрушек!
            </p>
            <p className="text-base sm:text-lg font-montserrat font-medium text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Подарите вашему ребенку радость и развитие с качественными игрушками. 
              От развивающих конструкторов до мягких плюшевых друзей!
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="/catalog" className="bg-sky-400 hover:bg-sky-500 text-white tracking-wide py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Открыть каталог
              </a>
              <button onClick={() => document.getElementById('popular-toys')?.scrollIntoView({ behavior: 'smooth' })} className="bg-blue-500 hover:bg-blue-600 text-white tracking-wide py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Популярные игрушки
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-blue-100 font-montserrat font-medium mb-2">Найдите идеальную игрушку для вашего ребенка!</p>
              <p className="text-blue-200 font-montserrat text-sm">Используйте поиск или выберите категорию в меню</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Toys Section */}
      <section id="popular-toys" className="py-24 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
                      <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl text-blue-700 mb-4 tracking-wider">
                Популярные игрушки
              </h2>
              <p className="text-base sm:text-lg text-blue-600 font-montserrat font-medium">Самые любимые игрушки наших маленьких покупателей!</p>
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
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6 md:gap-8 px-2 sm:px-4 py-8">
                        {popularToys
                          .slice(pageIndex * toysPerPage, (pageIndex + 1) * toysPerPage)
                          .map((toy) => (
                            <ProductCard key={toy.id} product={toy} width="max-w-[180px] sm:max-w-[240px]" />
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

      {/* Brands Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-blue-700 mb-4 tracking-wider">
              Популярные бренды
            </h2>
            <p className="text-base sm:text-lg text-blue-600 font-montserrat font-medium">
              Известные производители игрушек в нашем каталоге
            </p>
          </div>
          
          {brands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {brands.map((brand) => (
                <div key={brand.id} className="group">
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200">
                    <div className="text-center">
                      <h3 className="text-sm sm:text-base font-montserrat font-semibold text-gray-800 mb-2 line-clamp-2">
                        {brand.name}
                      </h3>
                      <div className="text-xs sm:text-sm text-blue-600 font-medium">
                        {brand.productCount} товар{brand.productCount === 1 ? '' : brand.productCount < 5 ? 'а' : 'ов'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 font-montserrat">Бренды скоро появятся!</p>
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-8 right-12 text-sky-300 text-2xl">⭐</div>
          <div className="absolute bottom-8 left-12 text-sky-300 text-2xl">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl text-white mb-6 tracking-wider">
                ARIA TOYS - Где купить
              </h2>
              <p className="text-blue-100 font-montserrat leading-relaxed text-lg max-w-3xl mx-auto">
                Мы специализируемся на качественных детских игрушках, которые развивают воображение и творческие способности. 
                Найдите наши игрушки в популярных интернет-магазинах!
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Our Stores */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h3 className="text-2xl text-white mb-8 text-center tracking-wide">
                  🛍️ Наши магазины
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Wildberries */}
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300">
                      <h4 className="text-xl font-montserrat font-semibold text-white mb-3">
                        Wildberries
                      </h4>
                      <a
                        href="https://www.wildberries.ru/seller/1534088"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-montserrat font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Перейти в магазин
                      </a>
                    </div>
                  </div>

                  {/* Ozon */}
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300">
                      <h4 className="text-xl font-montserrat font-semibold text-white mb-3">
                        Ozon
                      </h4>
                      <a
                        href="https://www.ozon.ru/seller/aria-toys-1455526"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-montserrat font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Перейти в магазин
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Email */}
                <div className="mt-8 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h4 className="text-lg font-montserrat font-semibold text-white mb-2">
                      Связаться с нами
                    </h4>
                    <p className="text-blue-100 font-montserrat text-sm">
                      По всем вопросам пишите на: 
                      <a href="mailto:ariatoys@mail.ru" className="text-sky-300 hover:text-white transition-colors ml-2">
                        ariatoys@mail.ru
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Button */}
      <ContactButton />
    </div>
  )
}
