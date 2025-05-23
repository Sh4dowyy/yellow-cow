"use client"

import { useEffect, useState } from "react";
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  in_stock: boolean;
  image_url: string;
  wb_url: string;
  ozon_url: string;
  category_name?: string;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      const { id } = await params;
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          category_id,
          in_stock,
          image_url,
          wb_url,
          ozon_url,
          categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product.");
      } else {
        // Set the product data with category name
        setProduct({
          ...data,
          category_name: (data.categories as any)?.name || "Неизвестная категория"
        });
      }
      setLoading(false);
    };

    fetchProduct();
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
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.name}</h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Описание</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <Card className="mb-6 p-4 bg-sky-50 border-sky-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Категория</h3>
                <p className="text-gray-800">{product.category_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Наличие</h3>
                <p className={product.in_stock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {product.in_stock ? "В наличии" : "Нет в наличии"}
                </p>
              </div>
            </div>
          </Card>

          {/* External Store Links */}
          <div className="mb-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Купить в магазинах</h3>
            <div className="flex gap-2 flex-wrap">
              {product.wb_url && (
                <a
                  href={product.wb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 text-xs flex items-center justify-center gap-1">
                    <Image 
                      src="/logos/wildberries-logo.svg" 
                      alt="Wildberries" 
                      width={50} 
                      height={16}
                      className="object-contain bg-white rounded-sm"
                    />
                    Купить на Wildberries
                  </Button>
                </a>
              )}
              {product.ozon_url && (
                <a
                  href={product.ozon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 text-xs flex items-center justify-center gap-1">
                    <Image 
                      src="/logos/ozon-logo.svg" 
                      alt="Ozon" 
                      width={50} 
                      height={16}
                      className="object-contain bg-white rounded-sm"
                    />
                    Купить на Ozon
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
