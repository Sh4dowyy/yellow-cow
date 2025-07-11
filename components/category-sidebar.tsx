"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/utils/supabase/supabaseClient"

interface Category {
  id: string
  name: string
}

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get current category from URL
  const currentCategory = searchParams.get('category')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')

        if (error) {
          console.error("Error fetching categories:", error)
          setError("Не удалось загрузить категории")
        } else {
          setCategories(data || [])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Произошла ошибка")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden' // Предотвращаем скролл страницы
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/catalog?category=${categoryId}`)
    onClose()
  }

  const handleAllProductsClick = () => {
    router.push('/catalog')
    onClose()
  }

  // Check if we're on catalog page without category filter (all products)
  const isAllProductsActive = !currentCategory

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-montserrat font-bold text-gray-800">Категории</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Закрыть меню"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 font-montserrat">Загрузка категорий...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 font-montserrat">{error}</p>
            </div>
          ) : (
            <div className="py-4">
              {/* Все товары */}
              <button
                onClick={handleAllProductsClick}
                className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors group ${
                  isAllProductsActive 
                    ? 'bg-sky-50 border-r-4 border-sky-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-medium font-montserrat ${
                  isAllProductsActive 
                    ? 'text-sky-600 font-semibold' 
                    : 'text-gray-800 group-hover:text-sky-600'
                }`}>
                  Все товары
                </span>
                <ChevronRight size={16} className={`transition-colors ${
                  isAllProductsActive 
                    ? 'text-sky-600' 
                    : 'text-gray-400 group-hover:text-sky-600'
                }`} />
              </button>

              {/* Разделитель */}
              <div className="mx-6 my-2 border-t border-gray-200"></div>

              {/* Категории */}
              {categories.length > 0 ? (
                categories.map((category) => {
                  const isActive = currentCategory === category.id
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors group ${
                        isActive 
                          ? 'bg-sky-50 border-r-4 border-sky-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`font-medium font-montserrat ${
                        isActive 
                          ? 'text-sky-600 font-semibold' 
                          : 'text-gray-700 group-hover:text-sky-600'
                      }`}>
                        {category.name}
                      </span>
                      <ChevronRight size={16} className={`transition-colors ${
                        isActive 
                          ? 'text-sky-600' 
                          : 'text-gray-400 group-hover:text-sky-600'
                      }`} />
                    </button>
                  )
                })
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 font-montserrat">Категории не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
} 