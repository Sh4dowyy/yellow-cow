"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductForm from "@/components/product-form"
import ProductList from "@/components/product-list"
import { supabase } from "@/utils/supabase/supabaseClient"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category_id: string
  image_url: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push("/login")
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products') // Ensure this table name is correct
        .select('id, name, description, price, image_url, category_id')

      if (productsError) {
        console.error("Error fetching products:", productsError)
        setError("Failed to load products.")
      } else {
        setProducts(productsData as Product[]) // Cast to Product[]
      }
    }

    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Панель администратора</h1>
        <Button variant="outline" onClick={handleLogout}>
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="add">Добавить товар</TabsTrigger>
          <TabsTrigger value="manage">Управление товарами</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Добавить новый товар</CardTitle>
              <CardDescription>Заполните форму для добавления нового товара в каталог</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Управление товарами</CardTitle>
              <CardDescription>Просмотр, редактирование и удаление товаров</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductList products={products} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
