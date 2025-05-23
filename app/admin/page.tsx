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

const ProductForm = ({ onProductAdded }: { onProductAdded?: () => void }) => {
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
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
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

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
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
          alert('Failed to upload image');
          setIsUploading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('products')
        .insert([{ ...formData, image_url: imageUrl }]);

      if (error) {
        console.error("Error adding product:", error);
        alert('Failed to add product');
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
        alert('Product added successfully!');
        if (onProductAdded) {
          onProductAdded();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setIsUploading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="name">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="description">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="category_id">Category</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">Select a category</option>
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
        <label className="ml-2 block text-sm font-medium text-gray-700">Featured</label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="in_stock"
          checked={formData.in_stock}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm font-medium text-gray-700">In Stock</label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="image">Product Image</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {imageFile && (
          <p className="text-sm text-gray-600 mt-1">Selected: {imageFile.name}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="wb_url">WB URL</label>
        <input
          type="text"
          name="wb_url"
          value={formData.wb_url}
          onChange={handleChange}
          placeholder="Enter WB URL"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="ozon_url">Ozon URL</label>
        <input
          type="text"
          name="ozon_url"
          value={formData.ozon_url}
          onChange={handleChange}
          placeholder="Enter Ozon URL"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <button 
        type="submit" 
        disabled={isUploading}
        className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isUploading ? 'Adding Product...' : 'Add Product'}
      </button>
    </form>
  );
};

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
        .from('products')
        .select('id, name, description, image_url, category_id, is_featured, in_stock, wb_url, ozon_url')

      if (productsError) {
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
              <ProductForm onProductAdded={handleProductDeleted} />
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
      </Tabs>
    </div>
  )
}
