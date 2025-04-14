"use client"

import { useEffect, useState } from "react";
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/utils/supabase/supabaseClient"; // Adjust the import path as necessary
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  in_stock: boolean;
  image_url: string; // Keep this for the single image URL
  category_name?: string; // Optional category name
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params; // Unwrap params using React.use()
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          category_id,
          in_stock,
          image_url
        `)
        .eq('id', id)
        .single(); // Fetch a single product

      if (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product.");
      } else {
        // Set the product data
        setProduct(data);
      }
      setLoading(false);
    };

    const fetchCategoryName = async (category_id: string) => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', category_id)
        .single(); // Fetch the category name

      if (error) {
        console.error("Error fetching category:", error);
        return "Неизвестная категория"; // Default value if there's an error
      }
      return data?.name || "Неизвестная категория"; // Return the category name or default
    };

    fetchProduct().then(() => {
      if (product) {
        fetchCategoryName(product.category_id).then((categoryName) => {
          setProduct((prev) => prev ? { ...prev, category_name: categoryName } : null);
        });
      }
    });
  }, [params]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Ошибка</h1>
        <p>{error}</p>
        <Button onClick={() => router.back()}>Вернуться назад</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Товар не найден</h1>
        <Button onClick={() => router.back()}>Вернуться назад</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative h-80 md:h-96 bg-white rounded-lg overflow-hidden border">
            <Image
              src={product.image_url || "/placeholder.svg"} // Use image_url directly
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </div>
          {/* If you have additional images, you can handle them here */}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.name}</h1>
          <p className="text-2xl font-bold text-sky-600 mb-6">{product.price} ₽</p>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Описание</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <Card className="mb-6 p-4 bg-sky-50 border-sky-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Категория</h3>
                <p className="text-gray-800">{product.category_name || "Неизвестная категория"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Наличие</h3>
                <p className={product.in_stock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {product.in_stock ? "В наличии" : "Нет в наличии"}
                </p>
              </div>
            </div>
          </Card>

          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 text-lg mb-4">
            Добавить в корзину
          </Button>

          <p className="text-sm text-gray-500 text-center">
            * Функция добавления в корзину будет доступна в следующей версии
          </p>
        </div>
      </div>
    </div>
  )
}
