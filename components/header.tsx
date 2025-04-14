"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { supabase } from "@/utils/supabase/supabaseClient"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

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
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-sky-500">Aria Toys</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/catalog"
              className={`text-base font-medium ${isActive("/catalog") ? "text-yellow-500" : "text-gray-700 hover:text-sky-500"}`}
            >
              Каталог
            </Link>
            <Link
              href="/about"
              className={`text-base font-medium ${isActive("/about") ? "text-yellow-500" : "text-gray-700 hover:text-sky-500"}`}
            >
              О нас
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/admin" className="text-base font-medium text-gray-700 hover:text-sky-500">Админка</Link>
                <Button variant="outline" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white">
                  Войти
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-sky-500 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              href="/"
              className={`block text-base font-medium ${isActive("/") ? "text-yellow-500" : "text-gray-700"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Главная
            </Link>
            <Link
              href="/catalog"
              className={`block text-base font-medium ${isActive("/catalog") ? "text-yellow-500" : "text-gray-700"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link
              href="/about"
              className={`block text-base font-medium ${isActive("/about") ? "text-yellow-500" : "text-gray-700"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              О нас
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/admin" className="block text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>Админка</Link>
                <Button
                  variant="outline"
                  className="w-full border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
                >
                  Войти
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
