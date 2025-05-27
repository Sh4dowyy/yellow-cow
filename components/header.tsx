"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/supabaseClient"

interface SearchResult {
  id: string
  name: string
  description: string
  category_name?: string
  type: 'product' | 'category'
}

interface HeaderProps {
  onCategoryMenuToggle: () => void
}

export default function Header({ onCategoryMenuToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    return pathname === path
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
      setLoading(false)
    }

    checkUser()

    // Слушаем изменения состояния авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true)
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)

    try {
      // Поиск продуктов
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, category_id')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5)

      // Поиск категорий
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(3)

      // Получаем названия категорий для продуктов
      let categoryNames: { [key: string]: string } = {}
      if (products && products.length > 0) {
        const categoryIds = Array.from(new Set(products.map(p => p.category_id)))
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, name')
          .in('id', categoryIds)
        
        if (categoryData) {
          categoryNames = categoryData.reduce((acc: { [key: string]: string }, cat) => {
            acc[cat.id] = cat.name
            return acc
          }, {})
        }
      }

      const results: SearchResult[] = []

      if (products && !productsError) {
        products.forEach(product => {
          results.push({
            id: product.id,
            name: product.name,
            description: product.description,
            category_name: categoryNames[product.category_id],
            type: 'product'
          })
        })
      }

      if (categories && !categoriesError) {
        categories.forEach(category => {
          results.push({
            id: category.id,
            name: category.name,
            description: '',
            type: 'category'
          })
        })
      }

      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchResults(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'product') {
      router.push(`/product/${result.id}`)
    } else {
      router.push(`/catalog?category=${result.id}`)
    }
    setShowSearchResults(false)
    setSearchQuery('')
  }

  if (loading) {
    return <div className="bg-white shadow-sm h-16"></div>
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Burger Menu Button */}
          <button
            onClick={onCategoryMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Открыть меню категорий"
          >
            <Menu size={24} className="text-gray-700" />
          </button>

          {/* Логотип */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-montserrat font-bold text-sky-500 tracking-tight">ARIA TOYS</span>
          </Link>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Right side: Navigation + Search */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Menu */}
            <nav className="flex items-center gap-6">
              {isAuthenticated && (
                <Link
                  href="/admin"
                                      className={`text-base font-medium font-montserrat transition-colors whitespace-nowrap ${isActive("/admin") ? "text-sky-500" : "text-gray-700 hover:text-sky-500"}`}
                >
                  Админка
                </Link>
              )}


            </nav>

            {/* Search Bar */}
            <div className="relative w-full max-w-xs" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearch(e.target.value)
                    }}
                    className="pl-10 pr-4 font-montserrat"
                  />
                </div>
              </form>

              {/* Результаты поиска */}
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 font-montserrat">
                      Поиск...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 font-montserrat">{result.name}</p>
                              {result.description && (
                                <p className="text-sm text-gray-500 font-montserrat line-clamp-1">{result.description}</p>
                              )}
                              {result.category_name && (
                                <p className="text-xs text-sky-600 font-montserrat">{result.category_name}</p>
                              )}
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-montserrat">
                              {result.type === 'product' ? 'Товар' : 'Категория'}
                            </span>
                          </div>
                        </button>
                      ))}
                      {searchQuery.trim() && (
                        <button
                          onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                          className="w-full text-left px-4 py-3 hover:bg-sky-50 border-t border-gray-200 text-sky-600 font-medium font-montserrat"
                        >
                          Показать все результаты для "{searchQuery}"
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500 font-montserrat">
                      Ничего не найдено
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile search button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
              aria-label="Открыть поиск"
            >
              {isMenuOpen ? <X size={24} className="text-gray-700" /> : <Search size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Panel */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            {/* Mobile поиск */}
            <div className="relative mb-4" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Поиск игрушек..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearch(e.target.value)
                    }}
                    className="pl-10 pr-4 font-montserrat"
                  />
                </div>
              </form>

              {/* Результаты поиска для мобильных */}
              {showSearchResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 font-montserrat">
                      Поиск...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            handleResultClick(result)
                            setIsMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 font-montserrat">{result.name}</p>
                              {result.description && (
                                <p className="text-sm text-gray-500 font-montserrat line-clamp-1">{result.description}</p>
                              )}
                              {result.category_name && (
                                <p className="text-xs text-sky-600 font-montserrat">{result.category_name}</p>
                              )}
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-montserrat">
                              {result.type === 'product' ? 'Товар' : 'Категория'}
                            </span>
                          </div>
                        </button>
                      ))}
                      {searchQuery.trim() && (
                        <button
                          onClick={() => {
                            handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)
                            setIsMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-sky-50 border-t border-gray-200 text-sky-600 font-medium font-montserrat"
                        >
                          Показать все результаты для "{searchQuery}"
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500 font-montserrat">
                      Ничего не найдено
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Админка */}
            {isAuthenticated && (
              <Link
                href="/admin"
                className={`block text-base font-medium font-montserrat ${isActive("/admin") ? "text-sky-500" : "text-gray-700"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Админка
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
