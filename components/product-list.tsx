"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2, Search, X, GripVertical } from "lucide-react"
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
  brand_id?: string
  gender?: string
  is_new?: boolean
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
  image_url?: string
}

interface ProductListProps {
  products: Product[]
  onProductDeleted?: () => void
}

export default function ProductList({ products, onProductDeleted }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
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
    brand_id: '',
    gender: '',
    is_new: false,
  })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editAdditionalImageFiles, setEditAdditionalImageFiles] = useState<File[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  useEffect(() => {
    const filtered = products.filter(product => {
      const brandName = brands.find(brand => brand.id === product.brand_id)?.name || '';
      return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.age_range && product.age_range.toLowerCase().includes(searchTerm.toLowerCase())) ||
      brandName.toLowerCase().includes(searchTerm.toLowerCase())
    })
    
    // Сортируем так, чтобы новинки были первыми
    const sorted = filtered.sort((a, b) => {
      if (a.is_new && !b.is_new) return -1
      if (!a.is_new && b.is_new) return 1
      return 0
    })
    
    setFilteredProducts(sorted)
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

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, image_url')

    if (error) {
      console.error("Error fetching brands:", error)
    } else {
      setBrands(data || [])
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
      brand_id: product.brand_id || '',
      gender: product.gender || '',
      is_new: product.is_new || false,
    })
    setEditImageFile(null)
    setEditAdditionalImageFiles([])
    setExistingAdditionalImages(product.image_urls || [])
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

  const handleEditAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      if (filesArray.length > 5) {
        alert('Можно выбрать максимум 5 дополнительных изображений')
        e.target.value = ''
        return
      }
      setEditAdditionalImageFiles(filesArray)
    }
  }

  const removeExistingImage = (index: number) => {
    if (confirm('Вы уверены, что хотите удалить это изображение?')) {
      const newImages = [...existingAdditionalImages]
      newImages.splice(index, 1)
      setExistingAdditionalImages(newImages)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newImages = [...existingAdditionalImages]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)
    
    setExistingAdditionalImages(newImages)
    setDraggedIndex(null)
  }

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newImages = [...existingAdditionalImages]
    const temp = newImages[index]
    newImages[index] = newImages[index - 1]
    newImages[index - 1] = temp
    setExistingAdditionalImages(newImages)
  }

  const moveImageDown = (index: number) => {
    if (index === existingAdditionalImages.length - 1) return
    const newImages = [...existingAdditionalImages]
    const temp = newImages[index]
    newImages[index] = newImages[index + 1]
    newImages[index + 1] = temp
    setExistingAdditionalImages(newImages)
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
      let additionalImageUrls = editingProduct.image_urls || []

      // Upload new main image if selected
      if (editImageFile) {
        const uploadedUrl = await uploadImage(editImageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          alert('Failed to upload main image')
          setIsUpdating(false)
          return
        }
      }

      // Upload new additional images if selected
      if (editAdditionalImageFiles.length > 0) {
        const newAdditionalUrls: string[] = []
        for (const file of editAdditionalImageFiles) {
          const uploadedUrl = await uploadImage(file)
          if (uploadedUrl) {
            newAdditionalUrls.push(uploadedUrl)
          }
        }
        additionalImageUrls = [...existingAdditionalImages, ...newAdditionalUrls]
      } else {
        additionalImageUrls = existingAdditionalImages
      }

      // Ensure we don't exceed 5 additional images
      if (additionalImageUrls.length > 5) {
        additionalImageUrls = additionalImageUrls.slice(0, 5)
      }

      const { error } = await supabase
        .from('products')
        .update({ 
          ...editFormData, 
          image_url: imageUrl,
          image_urls: additionalImageUrls.length > 0 ? additionalImageUrls : null
        })
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
                  {product.is_new && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Новинка
                    </div>
                  )}
                  
                  {!product.in_stock && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto text-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Редактировать товар</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-name">
                Название товара
              </label>
              <Input
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                placeholder="Введите название товара"
                required
                className="text-lg h-12"
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-description">
                Описание
              </label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                placeholder="Введите описание товара"
                required
                className="min-h-[120px] text-lg"
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-category">
                Категория
              </label>
              <select
                id="edit-category"
                name="category_id"
                value={editFormData.category_id}
                onChange={handleEditFormChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-4 text-lg h-12"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-8">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-featured"
                  name="is_featured"
                  checked={editFormData.is_featured}
                  onChange={handleEditFormChange}
                  className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-featured" className="ml-4 block text-lg font-medium text-gray-700">
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
                  className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-in-stock" className="ml-4 block text-lg font-medium text-gray-700">
                  В наличии
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-is-new"
                  name="is_new"
                  checked={editFormData.is_new}
                  onChange={handleEditFormChange}
                  className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-is-new" className="ml-4 block text-lg font-medium text-gray-700">
                  Новинка
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-image">
                Основное изображение (превью)
              </label>
              <input
                type="file"
                id="edit-image"
                onChange={handleEditFileChange}
                accept="image/*"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-4 text-lg"
              />
              <p className="text-base text-gray-500 mt-3">Это изображение будет отображаться в карточке товара</p>
              {editImageFile && (
                <p className="text-lg text-gray-600 mt-3">Выбрано: {editImageFile.name}</p>
              )}
              {editFormData.image_url && !editImageFile && (
                <div className="mt-4">
                  <p className="text-lg text-gray-600 mb-3">Текущее основное изображение:</p>
                  <div className="relative h-20 w-20 bg-gray-100 rounded">
                    <Image
                      src={editFormData.image_url}
                      alt="Current main image"
                      fill
                      className="object-contain p-1 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-additional-images">
                Дополнительные изображения
              </label>
              
              {/* Existing additional images */}
              {existingAdditionalImages.length > 0 && (
                <div className="mb-6">
                  <p className="text-lg text-gray-600 mb-4">
                    Текущие изображения ({existingAdditionalImages.length}):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {existingAdditionalImages.map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="relative group bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={url}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="object-contain p-2"
                          />
                          
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Удалить изображение"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          
                          {/* Drag handle */}
                          <div className="absolute top-1 left-1 bg-gray-600 bg-opacity-75 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-3 w-3" />
                          </div>
                          
                          {/* Position indicator */}
                          <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Move buttons for mobile */}
                        <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImageUp(index)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-1 py-0.5 rounded"
                              title="Переместить влево"
                            >
                              ←
                            </button>
                          )}
                          {index < existingAdditionalImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImageDown(index)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-1 py-0.5 rounded"
                              title="Переместить вправо"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-base text-gray-500 mt-3">
                    💡 Перетащите изображения для изменения порядка или используйте стрелки на мобильных устройствах
                  </p>
                </div>
              )}
              
              {/* Add new additional images */}
              <input
                type="file"
                id="edit-additional-images"
                multiple
                onChange={handleEditAdditionalFilesChange}
                accept="image/*"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-4 text-lg"
              />
              <p className="text-base text-gray-500 mt-3">
                Добавить новые изображения (максимум 5 общее количество)
              </p>
              {editAdditionalImageFiles.length > 0 && (
                <div className="text-lg text-gray-600 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span>Новых файлов: {editAdditionalImageFiles.length}</span>
                    <button
                      type="button"
                      onClick={() => setEditAdditionalImageFiles([])}
                      className="text-red-500 hover:text-red-700 text-base underline"
                    >
                      Очистить новые
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded p-4 max-h-28 overflow-y-auto">
                    <ul className="list-disc list-inside space-y-2">
                      {Array.from(editAdditionalImageFiles).map((file, index) => (
                        <li key={index} className="text-base truncate">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Total count warning */}
              {(existingAdditionalImages.length + editAdditionalImageFiles.length) > 5 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-lg text-red-600">
                  ⚠️ Общее количество изображений превышает 5. Будут сохранены только первые 5.
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-wb-url">
                Wildberries URL
              </label>
              <Input
                id="edit-wb-url"
                name="wb_url"
                value={editFormData.wb_url}
                onChange={handleEditFormChange}
                placeholder="Введите ссылку на Wildberries"
                className="text-lg h-12"
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-ozon-url">
                Ozon URL
              </label>
              <Input
                id="edit-ozon-url"
                name="ozon_url"
                value={editFormData.ozon_url}
                onChange={handleEditFormChange}
                placeholder="Введите ссылку на Ozon"
                className="text-lg h-12"
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-sku">
                Артикул
              </label>
              <Input
                id="edit-sku"
                name="sku"
                value={editFormData.sku}
                onChange={handleEditFormChange}
                placeholder="Введите артикул товара"
                className="text-lg h-12"
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-age-range">
                Возраст
              </label>
              <Input
                id="edit-age-range"
                name="age_range"
                value={editFormData.age_range}
                onChange={handleEditFormChange}
                placeholder="Например: 3-7 лет"
                className="text-lg h-12"
              />
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-brand">
                Бренд
              </label>
              <select
                id="edit-brand"
                name="brand_id"
                value={editFormData.brand_id}
                onChange={handleEditFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-4 text-lg h-12"
              >
                <option value="">Выберите бренд</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3" htmlFor="edit-gender">
                Пол
              </label>
              <select
                id="edit-gender"
                name="gender"
                value={editFormData.gender}
                onChange={handleEditFormChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-4 text-lg h-12"
              >
                <option value="all">Для всех</option>
                <option value="boys">Мальчики</option>
                <option value="girls">Девочки</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
                className="text-lg px-8 py-4 h-12"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-12"
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
