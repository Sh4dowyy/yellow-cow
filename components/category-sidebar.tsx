"use client"

import { useEffect, useRef, Suspense } from "react"
import { X, ChevronRight, Package, Star, Award, Store } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface CategorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

function CategorySidebarContent({ isOpen, onClose }: CategorySidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

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

  const handleCatalogClick = () => {
    router.push('/catalog')
    onClose()
  }

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (!element) return
    const header = document.querySelector('header') || document.querySelector('nav')
    const headerHeight = header ? header.offsetHeight + 20 : 100
    const rect = element.getBoundingClientRect()
    const absoluteTop = window.pageYOffset + rect.top - headerHeight
    window.scrollTo({ top: absoluteTop, behavior: 'smooth' })
  }

  const handlePopularToysClick = () => {
    if (pathname === '/') {
      onClose()
      setTimeout(() => scrollToSection('popular-toys'), 320)
    } else {
      router.push('/#popular-toys')
      onClose()
    }
  }

  const handleBrandsClick = () => {
    if (pathname === '/') {
      onClose()
      setTimeout(() => scrollToSection('brands'), 320)
    } else {
      router.push('/#brands')
      onClose()
    }
  }

  const handleStoresClick = () => {
    if (pathname === '/') {
      onClose()
      setTimeout(() => scrollToSection('our-stores'), 320)
    } else {
      router.push('/#our-stores')
      onClose()
    }
  }

  // Check which menu item is active
  const isCatalogActive = pathname === '/catalog'
  const isPopularActive = false // Не используем активное состояние для главной страницы
  const isBrandsActive = false // Не используем активное состояние для главной страницы
  const isStoresActive = false // Не используем активное состояние для главной страницы

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
          <h2 className="text-xl font-montserrat font-bold text-gray-800">Меню</h2>
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
          <div className="py-4">
            {/* Открыть каталог */}
            <button
              onClick={handleCatalogClick}
              className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors group ${
                isCatalogActive && !isPopularActive && !isBrandsActive
                  ? 'bg-sky-50 border-r-4 border-sky-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={20} className={`transition-colors ${
                  isCatalogActive && !isPopularActive && !isBrandsActive
                    ? 'text-sky-600' 
                    : 'text-gray-500 group-hover:text-sky-600'
                }`} />
                <span className={`font-medium font-montserrat ${
                  isCatalogActive && !isPopularActive && !isBrandsActive
                    ? 'text-sky-600 font-semibold' 
                    : 'text-gray-800 group-hover:text-sky-600'
                }`}>
                  Открыть каталог
                </span>
              </div>
              <ChevronRight size={16} className={`transition-colors ${
                isCatalogActive && !isPopularActive && !isBrandsActive
                  ? 'text-sky-600' 
                  : 'text-gray-400 group-hover:text-sky-600'
              }`} />
            </button>

            {/* Популярные игрушки */}
            <button
              onClick={handlePopularToysClick}
              className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors group ${
                isPopularActive
                  ? 'bg-sky-50 border-r-4 border-sky-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star size={20} className={`transition-colors ${
                  isPopularActive
                    ? 'text-sky-600' 
                    : 'text-gray-500 group-hover:text-sky-600'
                }`} />
                <span className={`font-medium font-montserrat ${
                  isPopularActive
                    ? 'text-sky-600 font-semibold' 
                    : 'text-gray-800 group-hover:text-sky-600'
                }`}>
                  Популярные игрушки
                </span>
              </div>
              <ChevronRight size={16} className={`transition-colors ${
                isPopularActive
                  ? 'text-sky-600' 
                  : 'text-gray-400 group-hover:text-sky-600'
              }`} />
            </button>

            {/* Бренды */}
            <button
              onClick={handleBrandsClick}
              className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors group ${
                isBrandsActive
                  ? 'bg-sky-50 border-r-4 border-sky-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award size={20} className={`transition-colors ${
                  isBrandsActive
                    ? 'text-sky-600' 
                    : 'text-gray-500 group-hover:text-sky-600'
                }`} />
                <span className={`font-medium font-montserrat ${
                  isBrandsActive
                    ? 'text-sky-600 font-semibold' 
                    : 'text-gray-800 group-hover:text-sky-600'
                }`}>
                  Бренды
                </span>
              </div>
              <ChevronRight size={16} className={`transition-colors ${
                isBrandsActive
                  ? 'text-sky-600' 
                  : 'text-gray-400 group-hover:text-sky-600'
              }`} />
            </button>

            {/* Наши магазины */}
            <button
              onClick={handleStoresClick}
              className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors group ${
                isStoresActive
                  ? 'bg-sky-50 border-r-4 border-sky-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store size={20} className={`transition-colors ${
                  isStoresActive
                    ? 'text-sky-600' 
                    : 'text-gray-500 group-hover:text-sky-600'
                }`} />
                <span className={`font-medium font-montserrat ${
                  isStoresActive
                    ? 'text-sky-600 font-semibold' 
                    : 'text-gray-800 group-hover:text-sky-600'
                }`}>
                  Наши магазины
                </span>
              </div>
              <ChevronRight size={16} className={`transition-colors ${
                isStoresActive
                  ? 'text-sky-600' 
                  : 'text-gray-400 group-hover:text-sky-600'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CategorySidebar({ isOpen, onClose }: CategorySidebarProps) {
  return (
    <Suspense fallback={
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-montserrat font-bold text-gray-800">Меню</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Закрыть меню"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 font-montserrat">Загрузка...</p>
        </div>
      </div>
    }>
      <CategorySidebarContent isOpen={isOpen} onClose={onClose} />
    </Suspense>
  )
} 