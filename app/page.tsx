"use client"

import ProductCard from "@/components/product-card"
import { useState, useEffect, useRef } from "react"
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
  brand_id?: string
}

interface Brand {
  id: string
  name: string
  image_url?: string
}

interface BrandWithCount {
  id: string
  name: string
  image_url?: string
  productCount: number
}

export default function Home() {
  const [popularToys, setPopularToys] = useState<Product[]>([])
  const [brands, setBrands] = useState<BrandWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
    const desktopScrollRef = useRef<HTMLDivElement>(null)

  // Функции для скролла на десктопе
  const scrollLeft = () => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      })
    }
  }

  // Функция для скролла с учетом высоты хедера
  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      // Получаем реальную высоту хедера
      const header = document.querySelector('header') || document.querySelector('nav')
      const headerHeight = header ? header.offsetHeight + 20 : 100 // +20px дополнительный отступ
      const elementPosition = element.offsetTop - headerHeight
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, description, image_url, image_urls, category_id, in_stock, is_new, brand_id')
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
        // First try with image_url, if it fails, try without it
        let { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name, image_url')

        // If error occurs (possibly because image_url column doesn't exist), try without image_url
        if (brandsError) {
          console.warn("Error fetching brands with image_url, trying without it:", brandsError)
          const fallbackQuery = await supabase
            .from('brands')
            .select('id, name')
          
          // Add image_url field to maintain type compatibility
          brandsData = fallbackQuery.data?.map(brand => ({ ...brand, image_url: null })) || null
          brandsError = fallbackQuery.error
        }

        if (brandsError) {
          console.error("Error fetching brands:", brandsError)
        } else {
          console.log("Fetched brands data:", brandsData)
          
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
          
          console.log("Brands with counts:", brandsWithCounts)
          
          // Show all brands, regardless of product count (for debugging)
          // Later we can add back the filter: .filter(brand => brand.productCount > 0)
          const sortedBrands = brandsWithCounts
            .sort((a, b) => b.productCount - a.productCount)
          
          setBrands(sortedBrands)
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
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 py-4 overflow-hidden">
        {/* Animated Stars Background */}
        <div className="absolute inset-0">
          {/* Large Sky Stars */}
          <div className="absolute top-10 left-10 w-8 h-8 transform rotate-12">
            <div className="text-sky-300 text-4xl">⭐</div>
          </div>
          <div className="absolute top-20 right-20 w-6 h-6 transform -rotate-12">
            <div className="text-sky-400 text-3xl">⭐</div>
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
          <div className="absolute top-1/4 left-1/3 translate-x-8 translate-y-4 w-16 h-12 bg-white rounded-full opacity-15"></div>
          <div className="absolute bottom-1/3 right-1/4 w-28 h-14 bg-white rounded-full opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/4 -translate-x-10 translate-y-5 w-16 h-12 bg-white rounded-full opacity-15"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* ARIA TOYS Logo */}
            <div className="mb-6">
              <img 
                src="/logos/aria-toys-logo.png" 
                alt="ARIA TOYS"
                className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto mx-auto mb-3"
              />
              <div className="w-20 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mx-auto"></div>
            </div>
            
            <p className="text-lg sm:text-xl md:text-2xl font-montserrat font-bold text-white mb-6 leading-relaxed">
              Волшебный мир детских игрушек!
            </p>
            <p className="text-base sm:text-lg font-montserrat font-medium text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Подарите вашему ребенку радость и развитие с качественными игрушками. 
              От развивающих конструкторов до мягких плюшевых друзей!
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 max-w-4xl mx-auto">
              <a href="/catalog" className="bg-sky-400 hover:bg-sky-500 text-white py-4 px-6 sm:px-8 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap">
                Открыть каталог
              </a>
              <button onClick={() => scrollToSection('popular-toys')} className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 sm:px-8 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap">
                Популярные игрушки
              </button>
              <button onClick={() => scrollToSection('brands')} className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 sm:px-8 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap">
                Бренды
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-blue-100 font-montserrat font-medium mb-2">Найдите идеальную игрушку для вашего ребенка!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Toys Section */}
      <section id="popular-toys" className="py-24 bg-white">
        <div className="container mx-auto px-2 sm:px-4">
                      <div className="text-center mb-12">
                          <h2 className="text-3xl sm:text-4xl text-blue-700 mb-4">
              Популярные игрушки
            </h2>
              <p className="text-base sm:text-lg text-blue-600 font-montserrat font-medium">Самые любимые игрушки наших маленьких покупателей!</p>
            </div>
          
                    {popularToys.length > 0 ? (
            <>
              {/* Мобильная версия с горизонтальным скроллом */}
              <div className="block sm:hidden overflow-hidden">
                <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
                  {popularToys.map((toy) => (
                    <div key={toy.id} className="flex-shrink-0">
                      <ProductCard product={toy} width="w-[160px]" brandName={brands.find(brand => brand.id === toy.brand_id)?.name} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Десктопная версия с горизонтальным скроллом и кнопками */}
              <div className="hidden sm:block relative overflow-hidden">
                <div 
                  ref={desktopScrollRef}
                  className="flex gap-6 overflow-x-auto pb-4 px-4 scrollbar-hide"
                >
                  {popularToys.map((toy) => (
                    <div key={toy.id} className="flex-shrink-0">
                      <ProductCard product={toy} width="w-[240px]" brandName={brands.find(brand => brand.id === toy.brand_id)?.name} />
                    </div>
                  ))}
                </div>

                {/* Кнопки навигации для десктопа */}
                {popularToys.length > 4 && (
                  <>
                    <button
                      onClick={scrollLeft}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:bg-sky-50 hover:border-sky-200 z-10"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                      onClick={scrollRight}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:bg-sky-50 hover:border-sky-200 z-10"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 font-montserrat">Популярные игрушки скоро появятся!</p>
            </div>
          )}
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl text-blue-700 mb-4">
              Бренды
            </h2>
            <p className="text-base sm:text-lg text-blue-600 font-montserrat font-medium">
              Известные производители игрушек в нашем каталоге
            </p>
          </div>
          
          {brands.length > 0 ? (
            <>
              {/* Мобильная версия с горизонтальным скроллом */}
              <div className="block sm:hidden overflow-hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
                  {brands.map((brand) => (
                    <a 
                      key={brand.id} 
                      href={`/catalog?brand=${brand.id}`}
                      className="group block flex-shrink-0"
                    >
                      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 overflow-hidden aspect-square w-20 h-20">
                        {brand.image_url ? (
                          <img 
                            src={brand.image_url} 
                            alt={brand.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                                                      <span className="text-blue-600 font-bold text-xl">
                            {brand.name.charAt(0)}
                          </span>
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Версия для планшетов и десктопов */}
              <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {brands.map((brand) => (
                  <a 
                    key={brand.id} 
                    href={`/catalog?brand=${brand.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 overflow-hidden aspect-square">
                      {brand.image_url ? (
                        <img 
                          src={brand.image_url} 
                          alt={brand.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-2xl sm:text-3xl">
                            {brand.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </>
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
              <div className="flex items-center justify-center mb-6">
                <img 
                  src="/logos/aria-toys-logo.png" 
                  alt="ARIA TOYS"
                  className="h-12 w-auto mr-4"
                />
                <h2 className="text-3xl text-white">
                  - Где купить
                </h2>
              </div>
              <p className="text-blue-100 font-montserrat leading-relaxed text-lg max-w-3xl mx-auto">
                Мы специализируемся на качественных детских игрушках, которые развивают воображение и творческие способности. 
                Найдите наши игрушки в популярных интернет-магазинах!
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Our Stores */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h3 className="text-2xl text-white mb-8 text-center">
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
                        href="https://www.wildberries.ru/seller/4349348"
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
                        href="https://www.ozon.ru/seller/aria-toys-2520310/?miniapp=seller_2520310"
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
    </div>
  )
}
