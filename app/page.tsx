"use client"

import ProductCard from "@/components/product-card"
import ContactButton from "@/components/contact-button"
import YandexMap from "@/components/yandex-map"
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
        .select('id, name, description, image_url, image_urls, category_id, in_stock, is_new')
        .eq('is_featured', true)

      if (error) {
        console.error("Error fetching featured products:", error)
        setError("Failed to load popular toys.")
      } else {
        // Сортируем так, чтобы новинки были первыми
        const sortedData = (data as Product[]).sort((a, b) => {
          if (a.is_new && !b.is_new) return -1
          if (!a.is_new && b.is_new) return 1
          return 0
        })
        setPopularToys(sortedData)
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-2 tracking-widest">
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
        <div className="container mx-auto px-4">
                      <div className="text-center mb-12">
              <h2 className="text-4xl text-blue-700 mb-4 tracking-wider">
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 py-8">
                        {popularToys
                          .slice(pageIndex * toysPerPage, (pageIndex + 1) * toysPerPage)
                          .map((toy) => (
                            <ProductCard key={toy.id} product={toy} width="max-w-[240px]" />
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
          <div className="absolute top-8 right-12 text-sky-300 text-2xl">⭐</div>
          <div className="absolute bottom-8 left-12 text-sky-300 text-2xl">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl text-white mb-6 tracking-wider">
                О магазине ARIA TOYS
              </h2>
              <p className="text-blue-100 font-montserrat leading-relaxed text-lg max-w-3xl mx-auto">
                Мы специализируемся на качественных детских игрушках, которые развивают воображение и творческие способности. 
                Каждая игрушка тщательно отобрана с заботой о безопасности и развитии вашего ребенка.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Contact Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h3 className="text-xl text-white mb-6 text-center tracking-wide">
                  📞 Контактная информация
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-sky-300 text-lg mt-1">📍</div>
                    <div>
                      <div className="font-montserrat font-semibold text-white text-sm">Адрес</div>
                      <div className="font-montserrat text-blue-100 text-sm">
                        Ленинградская обл., Янино-1,<br />
                        Шоссейная улица, 48Ес2
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="text-sky-300 text-lg mt-1">📱</div>
                    <div>
                      <div className="font-montserrat font-semibold text-white text-sm">Телефон</div>
                      <div className="font-montserrat text-blue-100 text-sm">
                        <a href="tel:+79112929496" className="hover:text-white transition-colors">
                          +7 911 292-94-96
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="text-sky-300 text-lg mt-1">📧</div>
                    <div>
                      <div className="font-montserrat font-semibold text-white text-sm">E-mail</div>
                      <div className="font-montserrat text-blue-100 text-sm">
                        <a href="mailto:ariatoys@mail.ru" className="hover:text-white transition-colors">
                          ariatoys@mail.ru
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="text-sky-300 text-lg mt-1">🕒</div>
                    <div>
                      <div className="font-montserrat font-semibold text-white text-sm">Режим работы</div>
                      <div className="font-montserrat text-blue-100 text-sm">
                        Пн – Пт: с 09:00 до 18:00
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yandex Map */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl text-white mb-4 text-center tracking-wide">
                  🗺️ Как нас найти
                </h3>
                <div className="rounded-lg overflow-hidden h-64 bg-gray-200">
                  <YandexMap 
                    address="Shosseynaya ulitsa, 48Ес2, gorodskoy posyolok Yanino-1, Zanevskoye gorodskoye poseleniye, Vsevolozhckiy District, Leningrad Region"
                    className="rounded-lg"
                  />
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
