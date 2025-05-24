"use client"

import { useEffect, useState } from "react";
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ContactButton from "@/components/contact-button"
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Package, CheckCircle, XCircle } from "lucide-react";

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
    // Прокрутка к верху страницы при загрузке
    window.scrollTo(0, 0);

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
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          <p className="font-montserrat text-gray-600">Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-montserrat font-bold mb-4 text-gray-800">Ошибка</h1>
          <p className="font-montserrat text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.back()} className="font-montserrat">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-montserrat font-bold mb-4 text-gray-800">Товар не найден</h1>
          <p className="font-montserrat text-gray-600 mb-6">К сожалению, запрашиваемый товар не существует</p>
          <Button onClick={() => router.back()} className="font-montserrat">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="font-montserrat text-gray-600 hover:text-blue-600 pl-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image Section */}
          <div className="space-y-4">
            <Card className="p-2 bg-white shadow-lg border-0">
              <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-gray-50 to-white rounded-lg overflow-hidden">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain p-6 hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </Card>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Category and Article Badges */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-montserrat">{product.category_name}</Badge>
            </div>

            {/* Product Title */}
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-montserrat font-bold text-gray-800 leading-tight">
                {product.name}
              </h1>
              
              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.in_stock ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-montserrat">
                      В наличии
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <Badge variant="secondary" className="bg-red-100 text-red-700 font-montserrat">
                      Нет в наличии
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <Card className="p-6 bg-white shadow-md border-0">
              <h2 className="text-xl font-montserrat font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                Описание товара
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="font-montserrat text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            </Card>

            {/* Purchase Options */}
                          <Card className="p-6 bg-gradient-to-r from-blue-50 to-sky-50 shadow-md border border-blue-200">
              <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                Где купить
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.wb_url && (
                  <a
                    href={product.wb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-montserrat py-3 px-4 text-sm shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                      <Image 
                        src="/logos/wildberries-logo.svg" 
                        alt="Wildberries" 
                        width={32} 
                        height={32}
                        className="object-contain bg-white rounded p-1 mr-3"
                      />
                      Wildberries
                    </Button>
                  </a>
                )}
                {product.ozon_url && (
                  <a
                    href={product.ozon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-montserrat py-3 px-4 text-sm shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                      <Image 
                        src="/logos/ozon-logo.svg" 
                        alt="Ozon" 
                        width={32} 
                        height={32}
                        className="object-contain bg-white rounded p-1 mr-3"
                      />
                      Ozon
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <ContactButton />
    </div>
  )
}
