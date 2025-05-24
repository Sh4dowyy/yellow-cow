"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductList from "@/components/product-list"
import { supabase } from "@/utils/supabase/supabaseClient"

interface Product {
  id: string
  name: string
  description: string
  category_id: string
  image_url: string
  is_featured: boolean
  in_stock: boolean
  wb_url: string
  ozon_url: string
}

interface Category {
  id: string
  name: string
}



const ProductForm = ({ onProductAdded, refreshCategories }: { onProductAdded?: () => void, refreshCategories?: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    is_featured: false,
    in_stock: false,
    image_url: '',
    wb_url: '',
    ozon_url: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [refreshCategories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        // eslint-disable-next-line no-console
        console.error('Error uploading image:', uploadError);
        // eslint-disable-next-line no-console
        console.error('Upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          stack: uploadError.stack
        });
        return null;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Unexpected error during upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert('Не удалось загрузить изображение. Проверьте настройки Supabase Storage или используйте URL изображения.');
          setIsUploading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('products')
        .insert([{ ...formData, image_url: imageUrl }]);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error adding product:", error);
        alert('Не удалось добавить игрушку');
      } else {
        // Reset form or handle success
        setFormData({
          name: '',
          description: '',
          category_id: '',
          is_featured: false,
          in_stock: false,
          image_url: '',
          wb_url: '',
          ozon_url: '',
        });
        setImageFile(null);
        alert('Игрушка успешно добавлена!');
        if (onProductAdded) {
          onProductAdded();
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      alert('Произошла ошибка');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="name">Название игрушки</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Введите название игрушки"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="description">Описание</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Введите описание игрушки"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="category_id">Категория</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
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
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_featured"
          checked={formData.is_featured}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm font-medium text-gray-700">Рекомендуемая</label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="in_stock"
          checked={formData.in_stock}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm font-medium text-gray-700">В наличии</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="image_url">URL изображения</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="Введите URL изображения (например, с Unsplash)"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        <p className="text-xs text-gray-500 mt-1">Или загрузите файл:</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="image">Загрузить изображение</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {imageFile && (
          <p className="text-sm text-gray-600 mt-1">Выбрано: {imageFile.name}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Загруженный файл имеет приоритет над URL</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="wb_url">Ссылка на Wildberries</label>
        <input
          type="text"
          name="wb_url"
          value={formData.wb_url}
          onChange={handleChange}
          placeholder="Введите ссылку на Wildberries"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="ozon_url">Ссылка на Ozon</label>
        <input
          type="text"
          name="ozon_url"
          value={formData.ozon_url}
          onChange={handleChange}
          placeholder="Введите ссылку на Ozon"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <button 
        type="submit" 
        disabled={isUploading}
                    className="w-full bg-blue-600 text-white font-montserrat font-bold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isUploading ? 'Добавление игрушки...' : 'Добавить игрушку'}
      </button>
    </form>
  );
};

const CategoryManagement = ({ onCategoryChanged }: { onCategoryChanged?: () => void }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: categoryName }]);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error adding category:", error);
        alert('Не удалось добавить категорию');
      } else {
        setCategoryName('');
        alert('Категория успешно добавлена!');
        fetchCategories(); // Refresh the list
        if (onCategoryChanged) {
          onCategoryChanged();
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      alert('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить категорию "${name}"? Это действие нельзя отменить.`)) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) {
          // eslint-disable-next-line no-console
          console.error("Error deleting category:", error);
          alert('Не удалось удалить категорию. Возможно, к ней привязаны товары.');
        } else {
          alert('Категория успешно удалена!');
          fetchCategories(); // Refresh the list
          if (onCategoryChanged) {
            onCategoryChanged();
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
        alert('Произошла ошибка при удалении категории');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Category Form */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4">
          ➕ Добавить новую категорию
        </h3>
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="categoryName">
              Название категории
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Введите название категории"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !categoryName.trim()}
            className="w-full bg-green-600 text-white font-montserrat font-bold py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Добавление категории...' : 'Добавить категорию'}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div>
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4">
          📋 Существующие категории
        </h3>
        {loading ? (
          <div className="text-center py-4">Загрузка категорий...</div>
        ) : (
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="font-montserrat">Категории не найдены</p>
                <p className="text-sm mt-1">Добавьте первую категорию выше</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div>
                      <h4 className="font-montserrat font-semibold text-gray-800">{category.name}</h4>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
                      className="font-montserrat"
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
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
        .from('products')
        .select('id, name, description, image_url, category_id, is_featured, in_stock, wb_url, ozon_url')

      if (productsError) {
        // eslint-disable-next-line no-console
        console.error("Error fetching products:", productsError)
        setError("Failed to load products.")
      } else {
        setProducts(productsData as Product[])
      }
    }

    if (isAuthenticated) {
      fetchProducts()
    }
  }, [isAuthenticated])

  const handleProductDeleted = async () => {
    // Refetch products after deletion
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, image_url, category_id, is_featured, in_stock, wb_url, ozon_url')

    if (productsError) {
      // eslint-disable-next-line no-console
      console.error("Error fetching products:", productsError)
      setError("Failed to load products.")
    } else {
      setProducts(productsData as Product[])
    }
  }

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
        <h1 className="text-3xl font-montserrat font-bold text-gray-800">Панель администратора</h1>
        <Button variant="outline" onClick={handleLogout}>
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="add">Добавить товар</TabsTrigger>
          <TabsTrigger value="manage">Управление товарами</TabsTrigger>
          <TabsTrigger value="categories">Управление категориями</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Добавить новый товар</CardTitle>
              <CardDescription>Заполните форму для добавления нового товара в каталог</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm 
                onProductAdded={handleProductDeleted} 
                refreshCategories={() => setRefreshKey(prev => prev + 1)}
              />
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
              <ProductList products={products} onProductDeleted={handleProductDeleted} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Управление категориями</CardTitle>
              <CardDescription>Добавление новых категорий и управление существующими</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement onCategoryChanged={() => {
                setRefreshKey(prev => prev + 1);
              }} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
