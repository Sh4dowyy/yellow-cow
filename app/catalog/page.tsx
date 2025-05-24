"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card"
import ContactButton from "@/components/contact-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/utils/supabase/supabaseClient"; // Adjust the import path as necessary

interface Toy {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  in_stock: boolean;
}

interface Category {
  id: string;
  name: string;
}

function CatalogContent() {
  const [toys, setToys] = useState<Toy[]>([]);
  const [filteredToys, setFilteredToys] = useState<Toy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchToysAndCategories = async () => {
      const { data: toysData, error: toysError } = await supabase
        .from('products')
        .select('id, name, description, category_id, image_url, in_stock');

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

  useEffect(() => {
    if (!toys.length) return;

    let filtered = toys;

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(toy => 
        toy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        toy.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтрация по категории (если указана в URL)
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(toy => toy.category_id === categoryFilter);
      setActiveTab(categoryFilter);
    } else if (searchQuery) {
      setActiveTab("all");
    }

    setFilteredToys(filtered);
  }, [toys, searchQuery, categoryFilter]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      setFilteredToys(toys);
    } else {
      const filtered = toys.filter(toy => toy.category_id === value);
      setFilteredToys(filtered);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg font-montserrat">Загрузка...</div>
    </div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-montserrat font-bold mb-4">Ошибка</h1>
      <p className="text-red-500 font-montserrat">{error}</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-5 right-10 text-sky-300 text-2xl">⭐</div>
          <div className="absolute bottom-8 right-1/4 text-sky-300 text-2xl">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-montserrat font-black text-white mb-4 tracking-tight">
              {searchQuery ? (
                <>Найдено: "{searchQuery}"</>
              ) : (
                <>Каталог ARIA TOYS</>
              )}
            </h1>
            <p className="text-xl text-blue-100 font-montserrat font-medium mb-6">
              {searchQuery ? 'Результаты вашего поиска' : 'Выберите идеальную игрушку для вашего малыша!'}
            </p>

            {searchQuery && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
                <p className="text-white font-montserrat font-bold">
                  Найдено товаров: <span className="text-sky-300">{filteredToys.length}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-montserrat font-black text-blue-700 mb-6">Выберите категорию</h2>
        </div>
        <div className="flex justify-center mb-8">
          <TabsList className="inline-flex flex-wrap gap-1 bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-lg">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 rounded-xl px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105"
          >
            Все игрушки
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-500 data-[state=active]:text-white data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 rounded-xl px-4 py-2 font-bold transition-all duration-300 transform hover:scale-105"
            >
              {category.name}
            </TabsTrigger>
          ))}
          </TabsList>
        </div>

        {/* Content for "Все игрушки" */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(searchQuery || categoryFilter ? filteredToys : toys).map((toy) => (
              <ProductCard key={toy.id} product={toy} />
            ))}
          </div>
          {(searchQuery || categoryFilter ? filteredToys : toys).length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-2xl font-montserrat font-bold text-blue-700 mb-3">
                {searchQuery ? "Ничего не найдено" : "Товары скоро появятся"}
              </h3>
              <p className="text-blue-600 font-montserrat text-lg">
                {searchQuery ? "Попробуйте изменить поисковый запрос" : "Мы работаем над пополнением ассортимента"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Content for each category */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredToys.map((toy) => (
                <ProductCard key={toy.id} product={toy} />
              ))}
            </div>
            {filteredToys.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-montserrat font-bold text-blue-700 mb-3">В этой категории пока пусто</h3>
                <p className="text-blue-600 font-montserrat text-lg">Скоро здесь появятся замечательные игрушки!</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      </div>

      {/* Contact Button */}
      <ContactButton />
    </div>
  )
}

function CatalogFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-sky-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-montserrat font-black text-white mb-4 tracking-tight">
              Каталог ARIA TOYS
            </h1>
            <p className="text-xl text-blue-100 font-montserrat font-medium mb-6">
              Загрузка...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogContent />
    </Suspense>
  )
}
