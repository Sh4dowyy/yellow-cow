"use client"

import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/utils/supabase/supabaseClient"; // Adjust the import path as necessary

interface Toy {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Catalog() {
  const [toys, setToys] = useState<Toy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToysAndCategories = async () => {
      const { data: toysData, error: toysError } = await supabase
        .from('products')
        .select('id, name, description, category_id, image_url');

      if (toysError) {
        console.error("Error fetching toys:", toysError);
        setError("Failed to load toys.");
      } else {
        setToys(toysData);
      }

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        setError("Failed to load categories.");
      } else {
        setCategories(categoriesData);
      }

      setLoading(false);
    };

    fetchToysAndCategories();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-montserrat">Загрузка...</div>
    </div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-heading font-bold mb-4">Ошибка</h1>
      <p className="text-red-500 font-body">{error}</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8 text-center text-gray-800 tracking-tight">Каталог игрушек</h1>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="flex flex-wrap justify-center mb-8 bg-transparent">
          <TabsTrigger
            key="all"
            value="all"
            className="data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-full px-6 py-2 m-1 font-montserrat font-medium transition-colors"
          >
            Все игрушки
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-full px-6 py-2 m-1 font-montserrat font-medium transition-colors"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content for "Все игрушки" */}
        <TabsContent key="all" value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {toys.map((toy) => (
              <ProductCard key={toy.id} product={toy} />
            ))}
          </div>
        </TabsContent>

        {/* Content for each category */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {toys
                .filter((toy) => toy.category_id === category.id)
                .map((toy) => (
                  <ProductCard key={toy.id} product={toy} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
