"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryFilter = searchParams.get('category');
  const brandFilter = searchParams.get('brand');

  const router = useRouter();

  // Подсчет товаров по брендам
  const getBrandCounts = () => {
    const counts: { [key: string]: number } = {};
    const toysToCount = activeTab === "all" ? toys : toys.filter(toy => toy.category_id === activeTab);
    
    toysToCount.forEach(toy => {
      if (toy.brand_id) {
        counts[toy.brand_id] = (counts[toy.brand_id] || 0) + 1;
      }
    });
    
    return brands
      .map(brand => ({
        ...brand,
        count: counts[brand.id] || 0
      }))
      .filter(brand => brand.count > 0) // Показываем только бренды с товарами
      .sort((a, b) => b.count - a.count); // Сортируем по количеству товаров
  };

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

  // Set selected brands from URL parameter
  useEffect(() => {
    if (brandFilter && brands.length > 0) {
      setSelectedBrands(brandFilter.split(',').filter(id => brands.some(brand => brand.id === id)));
    } else {
      setSelectedBrands([]);
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
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(toy => selectedBrands.includes(toy.brand_id || ''));
    }

    setFilteredToys(filtered);
  }, [toys, searchQuery, categoryFilter, selectedBrands, brands, activeTab]);

  const handleTabChange = (value: string) => {
    // Сохраняем текущую позицию скролла
    const currentScrollY = window.scrollY;
    
    setActiveTab(value);
    // НЕ сбрасываем бренды - они должны работать вместе с категориями
    
    // Обновляем URL для синхронизации
    const params = new URLSearchParams();
    if (value !== "all") {
      params.set('category', value);
    }
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','));
    }
    
    const url = params.toString() ? `/catalog?${params.toString()}` : '/catalog';
    
    // Используем replace чтобы избежать добавления в историю и сохраняем скролл
    window.history.replaceState(null, '', url);
    
    // Восстанавливаем позицию скролла после короткой задержки
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  const handleBrandChange = (brandId: string) => {
    // Сохраняем текущую позицию скролла
    const currentScrollY = window.scrollY;
    
    const newSelected = selectedBrands.includes(brandId) 
      ? selectedBrands.filter(id => id !== brandId) 
      : [...selectedBrands, brandId];
    
    setSelectedBrands(newSelected);
    
    // Обновляем URL с учетом текущей категории и выбранных брендов
    const params = new URLSearchParams();
    if (activeTab !== "all") {
      params.set('category', activeTab);
    }
    if (newSelected.length > 0) {
      params.set('brand', newSelected.join(','));
    }
    
    const url = params.toString() ? `/catalog?${params.toString()}` : '/catalog';
    
    // Используем replace чтобы избежать добавления в историю и сохраняем скролл
    window.history.replaceState(null, '', url);
    
    // Восстанавливаем позицию скролла после короткой задержки
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  // Блокировка скролла при открытой боковой панели
  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup при размонтировании компонента
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileFiltersOpen]);

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
      {/* Mobile Filter Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileFiltersOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-montserrat font-bold text-blue-700">
                Фильтры
              </h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Brand Filters */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-lg font-montserrat font-semibold text-blue-700 mb-4">
                Фильтр по бренду
              </h3>
              
              <div className="space-y-2">
                {getBrandCounts().map((brand) => (
                  <label
                    key={brand.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => {
                          handleBrandChange(brand.id);
                          // Закрываем панель на мобильной версии с небольшой задержкой для визуального feedback
                          setTimeout(() => {
                            setIsMobileFiltersOpen(false);
                          }, 150);
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-montserrat text-gray-800 group-hover:text-blue-700 font-medium">
                        {brand.name}
                      </span>
                    </div>
                    <span className="text-sm font-montserrat font-bold text-gray-600 bg-gray-200 group-hover:bg-blue-100 px-2 py-1 rounded-full min-w-[28px] text-center">
                      {brand.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Footer with Clear Button */}
            {selectedBrands.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // Сохраняем текущую позицию скролла
                    const currentScrollY = window.scrollY;
                    
                    setSelectedBrands([]);
                    const params = new URLSearchParams();
                    if (activeTab !== "all") {
                      params.set('category', activeTab);
                    }
                    const url = params.toString() ? `/catalog?${params.toString()}` : '/catalog';
                    
                    // Используем replace и сохраняем скролл
                    window.history.replaceState(null, '', url);
                    setTimeout(() => {
                      window.scrollTo(0, currentScrollY);
                    }, 0);
                  }}
                  className="w-full text-sm text-red-600 hover:text-red-800 font-montserrat underline hover:bg-red-50 py-2 rounded-lg transition-colors"
                >
                  Очистить фильтры ({selectedBrands.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
        <div className="flex gap-8">
          {/* Sidebar with Brand Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 shadow-sm sticky top-4">
              <h3 className="text-xl font-montserrat font-bold text-blue-700 mb-4 text-center">
                Фильтр по бренду
              </h3>
              
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {getBrandCounts().map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.id)}
                          onChange={() => handleBrandChange(brand.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-montserrat text-gray-800 group-hover:text-blue-700 font-medium">
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-sm font-montserrat font-bold text-gray-600 bg-gray-200 group-hover:bg-blue-100 px-2 py-1 rounded-full min-w-[28px] text-center">
                        {brand.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {selectedBrands.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-300">
                  <button
                    onClick={() => {
                      // Сохраняем текущую позицию скролла
                      const currentScrollY = window.scrollY;
                      
                      setSelectedBrands([]);
                      const params = new URLSearchParams();
                      if (activeTab !== "all") {
                        params.set('category', activeTab);
                      }
                      const url = params.toString() ? `/catalog?${params.toString()}` : '/catalog';
                      
                      // Используем replace и сохраняем скролл
                      window.history.replaceState(null, '', url);
                      setTimeout(() => {
                        window.scrollTo(0, currentScrollY);
                      }, 0);
                    }}
                    className="w-full text-sm text-red-600 hover:text-red-800 font-montserrat underline hover:bg-red-50 py-2 rounded-lg transition-colors"
                  >
                    Очистить фильтры ({selectedBrands.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-12">
              <div className="hidden lg:block bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-montserrat font-black text-blue-700 mb-4">Выберите категорию</h2>
                </div>
                <div className="flex justify-center mb-6 px-4">
                  <TabsList className="inline-flex flex-wrap gap-3 sm:gap-2 justify-center bg-transparent border-0 p-0">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:border-blue-300 data-[state=inactive]:hover:border-blue-500 border-2 rounded-xl px-4 sm:px-4 py-1 sm:py-1 font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-sm hover:shadow-md"
                    >
                      Все игрушки
                    </TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-500 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=inactive]:text-blue-700 data-[state=inactive]:hover:bg-blue-100 data-[state=inactive]:border-blue-300 data-[state=inactive]:hover:border-blue-500 border-2 rounded-xl px-4 sm:px-4 py-1 sm:py-1 font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-sm hover:shadow-md"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            
            {/* Mobile Filter Button - Outside Categories Container */}
            <div className="lg:hidden mt-3 w-full">
              <div className="flex justify-center items-center w-full">
                <button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-montserrat font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  Фильтры
                  {selectedBrands.length > 0 && (
                    <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-sm font-bold">
                      {selectedBrands.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

              {/* Content for "Все игрушки" */}
              <TabsContent value="all" className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6">
                  {(searchQuery || categoryFilter || selectedBrands.length > 0 ? filteredToys : toys).map((toy) => (
                    <ProductCard 
                      key={toy.id} 
                      product={toy} 
                      width="max-w-[200px] sm:max-w-[280px]"
                      brandName={brands.find(brand => brand.id === toy.brand_id)?.name}
                    />
                  ))}
                </div>
                {(searchQuery || categoryFilter || selectedBrands.length > 0 ? filteredToys : toys).length === 0 && (
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
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6">
                    {filteredToys.map((toy) => (
                      <ProductCard 
                        key={toy.id} 
                        product={toy} 
                        width="max-w-[200px] sm:max-w-[280px]"
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
