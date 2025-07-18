"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/utils/supabase/supabaseClient"; // Adjust the import path as necessary
import { useRouter } from "next/navigation";

interface Toy {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  image_urls?: string[];
  in_stock: boolean;
  sku?: string;
  age_range?: string;
  brand_id?: string;
  is_new?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
  image_url?: string;
}

function CatalogContent() {
  const [toys, setToys] = useState<Toy[]>([]);
  const [filteredToys, setFilteredToys] = useState<Toy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryFilter = searchParams.get('category');
  const brandFilter = searchParams.get('brand');

  const router = useRouter();

  // Восстановление позиции скролла при возврате
  useEffect(() => {
    if (!loading && toys.length > 0 && filteredToys.length >= 0) {
      const savedScrollPosition = sessionStorage.getItem('catalog-scroll-position');
      
      if (savedScrollPosition) {
        console.log('Восстанавливаем позицию скролла:', savedScrollPosition); // Для отладки
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScrollPosition),
            behavior: 'auto'
          });
          // Очищаем сохраненную позицию после восстановления
          sessionStorage.removeItem('catalog-scroll-position');
        }, 300);
      }
    }
  }, [loading, toys.length, filteredToys.length]);

  // Сохранение позиции скролла при переходе на страницу товара
  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href.includes('/product/')) {
        const scrollY = window.scrollY;
        console.log('Сохраняем позицию скролла:', scrollY); // Для отладки
        sessionStorage.setItem('catalog-scroll-position', scrollY.toString());
      }
    };

    // Сохраняем позицию при клике на ссылки товаров
    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  useEffect(() => {
    const fetchToysAndCategories = async () => {
      const { data: toysData, error: toysError } = await supabase
        .from('products')
        .select('id, name, description, category_id, image_url, image_urls, in_stock, sku, age_range, brand_id, is_new');

      if (toysError) {
        console.error("Error fetching toys:", toysError);
        setError("Failed to load toys.");
      } else {
        // Сортируем так, чтобы новинки были первыми
        const sortedData = toysData.sort((a: Toy, b: Toy) => {
          if (a.is_new && !b.is_new) return -1
          if (!a.is_new && b.is_new) return 1
          return 0
        })
        setToys(sortedData);
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

      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('id, name, image_url');

      if (brandsError) {
        console.error("Error fetching brands:", brandsError);
        setError("Failed to load brands.");
      } else {
        setBrands(brandsData);
      }

      setLoading(false);
    };

    fetchToysAndCategories();
  }, []);

  // Set selected brand from URL parameter for all categories
  useEffect(() => {
    if (brandFilter && brands.length > 0) {
      setSelectedBrand(brandFilter);
    }
  }, [brandFilter, brands]);

  useEffect(() => {
    if (!toys.length) return;

    let filtered = toys;

    // Фильтрация по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(toy => {
        const brandName = brands.find(brand => brand.id === toy.brand_id)?.name || '';
        return toy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        toy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (toy.sku && toy.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (toy.age_range && toy.age_range.toLowerCase().includes(searchQuery.toLowerCase())) ||
        brandName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Установка активной вкладки из URL - исправленная логика
    if (categoryFilter && categoryFilter !== "all") {
      // Если в URL есть категория, и она отличается от текущей активной вкладки
      if (activeTab !== categoryFilter) {
        setActiveTab(categoryFilter);
        return; // Выходим, чтобы позволить useEffect сработать снова с новым activeTab
      }
    } else if (!categoryFilter) {
      // Если в URL нет категории, но активная вкладка не "all"
      if (activeTab !== "all") {
        setActiveTab("all");
        return;
      }
    }
    
    // Фильтрация по выбранной вкладке
    if (activeTab !== "all") {
      filtered = filtered.filter(toy => toy.category_id === activeTab);
    }

    // Фильтрация по бренду (для всех категорий)
    if (selectedBrand !== "all") {
      filtered = filtered.filter(toy => toy.brand_id === selectedBrand);
    }

    setFilteredToys(filtered);
  }, [toys, searchQuery, categoryFilter, selectedBrand, brands, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Сохраняем выбранный бренд при смене категории
    
    // Обновляем URL для синхронизации только если нужно
    if (value === "all") {
      if (categoryFilter) {
        router.push('/catalog');
      }
    } else {
      if (categoryFilter !== value) {
        router.push(`/catalog?category=${value}`);
      }
    }
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    
    // Обновляем URL с учетом текущей категории и выбранного бренда
    if (brandId !== "all") {
      // Если выбран бренд, добавляем его в URL вместе с текущей категорией
      const params = new URLSearchParams();
      if (activeTab !== "all") {
        params.set('category', activeTab);
      }
      params.set('brand', brandId);
      router.push(`/catalog?${params.toString()}`);
    } else {
      // Если сбрасываем бренд, оставляем только категорию в URL
      if (activeTab !== "all") {
        router.push(`/catalog?category=${activeTab}`);
      } else {
        router.push('/catalog');
      }
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
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom,rgb(255, 255, 255),rgb(255, 255, 255))'}}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-5 right-10 text-sky-300 text-2xl">⭐</div>
          <div className="absolute bottom-8 right-1/4 text-sky-300 text-2xl">⭐</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-montserrat font-black text-white mb-4 tracking-tight">
              {searchQuery ? (
                <>Найдено: "{searchQuery}"</>
              ) : (
                <>Каталог</>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 font-montserrat font-medium mb-6">
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

      <div className="container mx-auto px-2 sm:px-4 py-12">

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-12">
        <div className="p-3 sm:p-4 mx-2 sm:mx-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-montserrat font-black text-blue-700 mb-4">Выберите категорию</h2>
          </div>
          <div className="flex justify-center mb-4 px-1">
            <TabsList className="inline-flex flex-wrap gap-2 sm:gap-3 justify-center bg-transparent border-0 p-1 max-w-full">
              <TabsTrigger
                value="all"
                className="border-2 border-blue-300 rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-sm hover:shadow-md text-blue-700 hover:bg-blue-100 hover:border-blue-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
              >
                Все игрушки
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="border-2 border-blue-300 rounded-lg px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-sm hover:shadow-md text-blue-700 hover:bg-blue-100 hover:border-blue-500 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-500 data-[state=active]:text-white data-[state=active]:border-blue-600"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Brand Filter - Separate Section */}
        <div className="mb-8 mt-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-200 p-6 mx-2 sm:mx-4 shadow-lg">
            <div className="flex flex-col gap-4 items-center">
              <h3 className="text-lg font-montserrat font-bold text-blue-800 text-center">
                Фильтр по бренду:
              </h3>
              <Select value={selectedBrand} onValueChange={handleBrandChange}>
                <SelectTrigger className="w-full sm:w-[280px] h-12 bg-white border-blue-300 hover:border-blue-500 transition-colors font-montserrat">
                  <SelectValue placeholder="Все бренды" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-montserrat">Все бренды</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id} className="font-montserrat">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content for "Все игрушки" */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {(searchQuery || categoryFilter || selectedBrand !== "all" ? filteredToys : toys).map((toy) => (
              <ProductCard 
                key={toy.id} 
                product={toy} 
                width="max-w-[180px] sm:max-w-[240px]"
                brandName={brands.find(brand => brand.id === toy.brand_id)?.name}
              />
            ))}
          </div>
          {(searchQuery || categoryFilter || selectedBrand !== "all" ? filteredToys : toys).length === 0 && (
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {filteredToys.map((toy) => (
                              <ProductCard 
                key={toy.id} 
                product={toy} 
                width="max-w-[180px] sm:max-w-[240px]"
                brandName={brands.find(brand => brand.id === toy.brand_id)?.name}
              />
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
    </div>
  )
}

function CatalogFallback() {
  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom, #EDF1FD, #DBE3FA)'}}>
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
