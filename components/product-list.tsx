"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Search } from "lucide-react"
import { supabase } from "@/utils/supabase/supabaseClient"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  image_urls?: string[]
  category_id: string
  is_featured: boolean
  in_stock: boolean
  wb_url: string
  ozon_url: string
  sku?: string
  age_range?: string
  manufacturer?: string
}

interface Category {
  id: string
  name: string
}

interface ProductListProps {
  products: Product[]
  onProductDeleted?: () => void
}

export default function ProductList({ products, onProductDeleted }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    is_featured: false,
    in_stock: false,
    image_url: '',
    wb_url: '',
    ozon_url: '',
    sku: '',
    age_range: '',
    manufacturer: '',
  })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.manufacturer && product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.age_range && product.age_range.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')

    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data || [])
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || "Неизвестная категория"
  }

  const handleDelete = async (id: string) => {
    const productToDelete = products.find((product) => product.id === id)

    if (confirm(`Вы уверены, что хотите удалить товар "${productToDelete?.name}"?`)) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error("Error deleting product:", error)
        alert('Ошибка при удалении товара')
      } else {
        alert('Товар успешно удален')
        if (onProductDeleted) {
          onProductDeleted()
        }
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditFormData({
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      is_featured: product.is_featured,
      in_stock: product.in_stock,
      image_url: product.image_url,
      wb_url: product.wb_url || '',
      ozon_url: product.ozon_url || '',
      sku: product.sku || '',
      age_range: product.age_range || '',
      manufacturer: product.manufacturer || '',
    })
    setEditImageFile(null)
    setIsEditDialogOpen(true)
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type, checked } = target
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0])
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsUpdating(true)

    try {
      let imageUrl = editFormData.image_url

      if (editImageFile) {
        const uploadedUrl = await uploadImage(editImageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          alert('Failed to upload image')
          setIsUpdating(false)
          return
        }
      }

      const { error } = await supabase
        .from('products')
        .update({ ...editFormData, image_url: imageUrl })
        .eq('id', editingProduct.id)

      if (error) {
        console.error("Error updating product:", error)
        alert('Ошибка при обновлении товара')
      } else {
        alert('Товар успешно обновлен')
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        if (onProductDeleted) {
          onProductDeleted() // Reuse the same callback to refresh the list
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Произошла ошибка')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Поиск по названию, артикулу, производителю..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? "Товары не найдены" : "Нет товаров в каталоге"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <div className="overflow-hidden transition-all duration-300 hover:shadow-lg max-w-xs mx-auto bg-white rounded-lg">
                <div className="relative h-56 bg-white">
                  <Image 
                    src={product.image_url || "/placeholder.svg"} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-4" 
                  />
                  {product.is_featured && (
                    <div className="absolute top-2 right-2 bg-sky-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Популярное
                    </div>
                  )}
                  {!product.in_stock && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Нет в наличии
                    </div>
                  )}
                </div>
                
                <div className="p-4 pb-2 bg-sky-100">
                  <div className="text-left mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 bg-white/50 px-2 py-1 rounded-full inline-block">
                      {getCategoryName(product.category_id)}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 pt-0 pb-4 flex justify-between gap-2 bg-sky-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Редактировать
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-name">
                Название товара
              </label>
              <Input
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                placeholder="Введите название товара"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-description">
                Описание
              </label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                placeholder="Введите описание товара"
                required
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-category">
                Категория
              </label>
              <select
                id="edit-category"
                name="category_id"
                value={editFormData.category_id}
                onChange={handleEditFormChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-featured"
                  name="is_featured"
                  checked={editFormData.is_featured}
                  onChange={handleEditFormChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-featured" className="ml-2 block text-sm font-medium text-gray-700">
                  Популярное
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-in-stock"
                  name="in_stock"
                  checked={editFormData.in_stock}
                  onChange={handleEditFormChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-in-stock" className="ml-2 block text-sm font-medium text-gray-700">
                  В наличии
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-image">
                Изображение товара
              </label>
              <input
                type="file"
                id="edit-image"
                onChange={handleEditFileChange}
                accept="image/*"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
              {editImageFile && (
                <p className="text-sm text-gray-600 mt-1">Выбрано: {editImageFile.name}</p>
              )}
              {editFormData.image_url && !editImageFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Текущее изображение:</p>
                  <div className="relative h-20 w-20 bg-gray-100 rounded">
                    <Image
                      src={editFormData.image_url}
                      alt="Current image"
                      fill
                      className="object-contain p-1 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-wb-url">
                Wildberries URL
              </label>
              <Input
                id="edit-wb-url"
                name="wb_url"
                value={editFormData.wb_url}
                onChange={handleEditFormChange}
                placeholder="Введите ссылку на Wildberries"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-ozon-url">
                Ozon URL
              </label>
              <Input
                id="edit-ozon-url"
                name="ozon_url"
                value={editFormData.ozon_url}
                onChange={handleEditFormChange}
                placeholder="Введите ссылку на Ozon"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-sku">
                Артикул
              </label>
              <Input
                id="edit-sku"
                name="sku"
                value={editFormData.sku}
                onChange={handleEditFormChange}
                placeholder="Введите артикул товара"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-age-range">
                Возраст
              </label>
              <Input
                id="edit-age-range"
                name="age_range"
                value={editFormData.age_range}
                onChange={handleEditFormChange}
                placeholder="Например: 3-7 лет"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="edit-manufacturer">
                Производитель
              </label>
              <Input
                id="edit-manufacturer"
                name="manufacturer"
                value={editFormData.manufacturer}
                onChange={handleEditFormChange}
                placeholder="Введите название производителя"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? 'Обновление...' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
