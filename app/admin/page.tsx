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
  image_urls?: string[]
  is_featured: boolean
  in_stock: boolean
  wb_url: string
  ozon_url: string
  video_url?: string
  sku?: string
  age_range?: string
  brand_id?: string
  gender?: string
  is_new?: boolean
  height?: string
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


interface BlogPost {
  id: string
  title: string
  category: string
  cover_url: string
  excerpt: string | null
  content: string | null
  published: boolean
  created_at: string
}



const ProductForm = ({ onProductAdded, refreshCategories, refreshBrands }: { onProductAdded?: () => void, refreshCategories?: () => void, refreshBrands?: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    is_featured: false,
    in_stock: false,
    wb_url: '',
    ozon_url: '',
    video_url: '',
    sku: '',
    age_range: '',
    brand_id: '',
    gender: 'all',
    is_new: false,
    height: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [refreshCategories, refreshBrands]);

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

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, image_url')
      .order('name');

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching brands:", error);
    } else {
      setBrands(data || []);
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

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        alert('Можно выбрать максимум 5 дополнительных изображений');
        // Сбрасываем значение input
        e.target.value = '';
        return;
      }
      setAdditionalImageFiles(filesArray);
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
    
    if (!imageFile) {
      alert('Пожалуйста, выберите основное изображение');
      return;
    }

    setIsUploading(true);

    const extractIframeSrc = (value: string) => {
      if (!value) return '';
      const trimmed = value.trim();
      if (/^<iframe/i.test(trimmed)) {
        const match = trimmed.match(/src\s*=\s*"([^"]+)"|src\s*=\s*'([^']+)'/i);
        return match ? (match[1] || match[2] || '') : '';
      }
      return trimmed;
    };

    try {
      // Upload main image
      const imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        alert('Не удалось загрузить основное изображение. Проверьте настройки Supabase Storage.');
        setIsUploading(false);
        return;
      }

      // Upload additional images
      let additionalImageUrls: string[] = [];
      if (additionalImageFiles.length > 0) {
        for (const file of additionalImageFiles) {
          const uploadedUrl = await uploadImage(file);
          if (uploadedUrl) {
            additionalImageUrls.push(uploadedUrl);
          }
        }
      }

      const { error } = await supabase
        .from('products')
        .insert([{ 
          ...formData, 
          video_url: extractIframeSrc(formData.video_url),
          image_url: imageUrl,
          image_urls: additionalImageUrls.length > 0 ? additionalImageUrls : null
        }]);

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
          wb_url: '',
          ozon_url: '',
          video_url: '',
          sku: '',
          age_range: '',
          brand_id: '',
          gender: 'all',
          is_new: false,
          height: '',
        });
        setImageFile(null);
        setAdditionalImageFiles([]);
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
      <div className="flex items-center">
        <input
          type="checkbox"
          name="is_new"
          checked={formData.is_new}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm font-medium text-gray-700">Новинка</label>
      </div>

      {/* Main Image Upload */}
      <div className="border-t pt-4">
        <h3 className="text-md font-medium text-gray-700 mb-3">Изображения</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="image">
            Основное изображение <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {imageFile && (
            <p className="text-sm text-gray-600 mt-1">Выбрано: {imageFile.name}</p>
          )}
        </div>

        {/* Additional Images Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="additional_images">
            Дополнительные изображения (максимум 5, необязательно)
          </label>
          <input
            type="file"
            multiple
            onChange={handleAdditionalFilesChange}
            accept="image/*"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Выберите до 5 дополнительных изображений для создания галереи
          </p>
          {additionalImageFiles.length > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              <div className="flex justify-between items-center mb-1">
                <span>Выбрано файлов: {additionalImageFiles.length}/5</span>
                <button
                  type="button"
                  onClick={() => setAdditionalImageFiles([])}
                  className="text-red-500 hover:text-red-700 text-xs underline"
                >
                  Очистить все
                </button>
              </div>
              <div className="bg-gray-50 rounded p-2 max-h-24 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  {Array.from(additionalImageFiles).map((file, index) => (
                    <li key={index} className="text-xs truncate">{file.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
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
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="video_url">Видео (URL)</label>
        <input
          type="text"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="sku">Артикул</label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Введите артикул товара"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="age_range">Возраст</label>
        <input
          type="text"
          name="age_range"
          value={formData.age_range}
          onChange={handleChange}
          placeholder="Например: 3-7 лет"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="brand_id">Бренд</label>
        <select
          name="brand_id"
          value={formData.brand_id}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
        <label className="block text-sm font-medium text-gray-700" htmlFor="gender">Пол</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="all">Для всех</option>
          <option value="boys">Мальчики</option>
          <option value="girls">Девочки</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="height">Высота игрушки</label>
        <input
          type="text"
          name="height"
          value={formData.height}
          onChange={handleChange}
          placeholder="Например: 12см"
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) {
      alert('Название категории не может быть пустым');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editingName.trim() })
        .eq('id', id);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error updating category:", error);
        alert('Не удалось обновить категорию');
      } else {
        alert('Категория успешно обновлена!');
        setEditingId(null);
        setEditingName('');
        fetchCategories(); // Refresh the list
        if (onCategoryChanged) {
          onCategoryChanged();
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      alert('Произошла ошибка при обновлении категории');
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
                    <div className="flex-1 mr-4">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 font-montserrat font-semibold text-gray-800"
                          autoFocus
                        />
                      ) : (
                        <h4 className="font-montserrat font-semibold text-gray-800">{category.name}</h4>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === category.id ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateCategory(category.id)}
                            className="font-montserrat"
                          >
                            Сохранить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="font-montserrat"
                          >
                            Отмена
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category.id, category.name)}
                            className="font-montserrat"
                          >
                            Изменить
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name)}
                            className="font-montserrat"
                          >
                            Удалить
                          </Button>
                        </>
                      )}
                    </div>
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

const BrandManagement = ({ onBrandChanged }: { onBrandChanged?: () => void }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState('');
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, image_url')
      .order('name');

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching brands:", error);
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  const uploadBrandImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `brand-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `brands/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading brand image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Unexpected error during brand image upload:', error);
      return null;
    }
  };

  const handleAddBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      // Upload image if provided
      if (brandImageFile) {
        imageUrl = await uploadBrandImage(brandImageFile);
        if (!imageUrl) {
          alert('Не удалось загрузить изображение бренда');
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase
        .from('brands')
        .insert([{ name: brandName, image_url: imageUrl }]);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error adding brand:", error);
        alert('Не удалось добавить бренд');
      } else {
        setBrandName('');
        setBrandImageFile(null);
        alert('Бренд успешно добавлен!');
        fetchBrands(); // Refresh the list
        if (onBrandChanged) {
          onBrandChanged();
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

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingImageFile(null);
  };

  const handleUpdateBrand = async (id: string) => {
    if (!editingName.trim()) {
      alert('Название бренда не может быть пустым');
      return;
    }

    try {
      let updateData: { name: string; image_url?: string } = { name: editingName.trim() };
      
      // Upload new image if provided
      if (editingImageFile) {
        const imageUrl = await uploadBrandImage(editingImageFile);
        if (!imageUrl) {
          alert('Не удалось загрузить изображение бренда');
          return;
        }
        updateData.image_url = imageUrl;
      }

      const { error } = await supabase
        .from('brands')
        .update(updateData)
        .eq('id', id);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error updating brand:", error);
        alert('Не удалось обновить бренд');
      } else {
        alert('Бренд успешно обновлен!');
        setEditingId(null);
        setEditingName('');
        setEditingImageFile(null);
        fetchBrands(); // Refresh the list
        if (onBrandChanged) {
          onBrandChanged();
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      alert('Произошла ошибка при обновлении бренда');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить бренд "${name}"? Это действие нельзя отменить.`)) {
      try {
        const { error } = await supabase
          .from('brands')
          .delete()
          .eq('id', id);

        if (error) {
          // eslint-disable-next-line no-console
          console.error("Error deleting brand:", error);
          alert('Не удалось удалить бренд. Возможно, к нему привязаны товары.');
        } else {
          alert('Бренд успешно удален!');
          fetchBrands(); // Refresh the list
          if (onBrandChanged) {
            onBrandChanged();
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error:', error);
        alert('Произошла ошибка при удалении бренда');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Brand Form */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4">
          ➕ Добавить новый бренд
        </h3>
        <form onSubmit={handleAddBrand} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="brandName">
              Название бренда
            </label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Введите название бренда"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="brandImage">
              Изображение бренда
            </label>
            <input
              type="file"
              id="brandImage"
              onChange={(e) => setBrandImageFile(e.target.files ? e.target.files[0] : null)}
              accept="image/*"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <p className="text-xs text-gray-500 mt-1">Рекомендуется квадратное изображение (например, 400x400px)</p>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !brandName.trim()}
            className="w-full bg-green-600 text-white font-montserrat font-bold py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Добавление бренда...' : 'Добавить бренд'}
          </button>
        </form>
      </div>

      {/* Brands List */}
      <div>
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4">
          📋 Существующие бренды
        </h3>
        {loading ? (
          <div className="text-center py-4">Загрузка брендов...</div>
        ) : (
          <div className="space-y-4">
            {brands.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="font-montserrat">Бренды не найдены</p>
                <p className="text-sm mt-1">Добавьте первый бренд выше</p>
              </div>
            ) : (
              <div className="space-y-2">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center flex-1 mr-4">
                      {/* Brand Image */}
                      <div className="w-12 h-12 mr-4 flex-shrink-0">
                        {brand.image_url ? (
                          <img 
                            src={brand.image_url} 
                            alt={brand.name}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Нет фото</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Brand Name */}
                      <div className="flex-1">
                        {editingId === brand.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="w-full border border-gray-300 rounded-md shadow-sm p-2 font-montserrat font-semibold text-gray-800"
                              autoFocus
                            />
                            <input
                              type="file"
                              onChange={(e) => setEditingImageFile(e.target.files ? e.target.files[0] : null)}
                              accept="image/*"
                              className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                            />
                          </div>
                        ) : (
                          <h4 className="font-montserrat font-semibold text-gray-800">{brand.name}</h4>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingId === brand.id ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateBrand(brand.id)}
                            className="font-montserrat"
                          >
                            Сохранить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="font-montserrat"
                          >
                            Отмена
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(brand.id, brand.name)}
                            className="font-montserrat"
                          >
                            Изменить
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(brand.id, brand.name)}
                            className="font-montserrat"
                          >
                            Удалить
                          </Button>
                        </>
                      )}
                    </div>
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
        .select('id, name, description, image_url, image_urls, category_id, is_featured, in_stock, wb_url, ozon_url, video_url, sku, age_range, brand_id, gender, is_new, height')

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
      .select('id, name, description, image_url, image_urls, category_id, is_featured, in_stock, wb_url, ozon_url, video_url, sku, age_range, brand_id, gender, is_new, height')

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
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="add">Добавить товар</TabsTrigger>
          <TabsTrigger value="manage">Управление товарами</TabsTrigger>
          <TabsTrigger value="categories">Управление категориями</TabsTrigger>
          <TabsTrigger value="brands">Управление брендами</TabsTrigger>
          <TabsTrigger value="blog">Блог</TabsTrigger>
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
                refreshBrands={() => setRefreshKey(prev => prev + 1)}
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

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Управление брендами</CardTitle>
              <CardDescription>Добавление новых брендов и управление существующими</CardDescription>
            </CardHeader>
            <CardContent>
              <BrandManagement onBrandChanged={() => {
                setRefreshKey(prev => prev + 1);
              }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle>Управление блогом</CardTitle>
              <CardDescription>Создание, редактирование и удаление постов</CardDescription>
            </CardHeader>
            <CardContent>
              <BlogManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Blog")
  const [coverUrl, setCoverUrl] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [published, setPublished] = useState(true)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<BlogPost>>({})
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, category, cover_url, excerpt, content, published, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching blog posts:', error)
      setError('Не удалось загрузить посты блога')
    } else {
      setPosts((data || []) as BlogPost[])
    }
    setLoading(false)
  }

  const uploadBlogImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `blog-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `covers/${fileName}`
    try {
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file)
      if (uploadError) {
        // eslint-disable-next-line no-console
        console.error('Error uploading cover:', uploadError)
        return null
      }
      const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath)
      return data.publicUrl
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Unexpected upload error:', e)
      return null
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let finalCoverUrl = coverUrl
      if (!finalCoverUrl && coverFile) {
        const uploaded = await uploadBlogImage(coverFile)
        if (!uploaded) {
          alert('Не удалось загрузить обложку')
          setSubmitting(false)
          return
        }
        finalCoverUrl = uploaded
      }

      const { error } = await supabase.from('blog_posts').insert({
        title,
        category,
        cover_url: finalCoverUrl,
        excerpt: excerpt || null,
        content: content || null,
        published,
      })
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error creating post:', error)
        alert('Не удалось создать пост')
      } else {
        setTitle("")
        setCategory('Blog')
        setCoverUrl("")
        setExcerpt("")
        setContent("")
        setPublished(true)
        setCoverFile(null)
        await fetchPosts()
        alert('Пост создан')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setEditValues({ ...post })
    setEditCoverFile(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
    setEditCoverFile(null)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const updates: any = { ...editValues }
    delete updates.id
    delete updates.created_at
    if (editCoverFile) {
      const uploaded = await uploadBlogImage(editCoverFile)
      if (!uploaded) {
        alert('Не удалось загрузить новую обложку')
        return
      }
      updates.cover_url = uploaded
    }
    const { error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', editingId)
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating post:', error)
      alert('Не удалось обновить пост')
    } else {
      await fetchPosts()
      cancelEdit()
      alert('Пост обновлён')
    }
  }

  const deletePost = async (post: BlogPost) => {
    if (!confirm(`Удалить пост "${post.title}"?`)) return
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', post.id)
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting post:', error)
      alert('Не удалось удалить пост')
    } else {
      await fetchPosts()
      alert('Пост удалён')
    }
  }

  return (
    <div className="space-y-10">
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4">➕ Создать пост</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Заголовок</label>
            <input className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Категория</label>
            <input className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Обложка (URL или загрузка файла)</label>
            <input className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2" placeholder="https://..." value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Краткое описание</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Контент</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <label htmlFor="published" className="text-sm text-gray-700">Опубликовано</label>
          </div>
          <Button disabled={submitting} type="submit">{submitting ? 'Сохранение...' : 'Создать пост'}</Button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-montserrat font-semibold text-gray-800 mb-4">📋 Посты</h3>
        {loading ? (
          <div className="text-center py-4">Загрузка постов...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">Пока нет постов</div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                {editingId === post.id ? (
                  <div className="space-y-3">
                    <input className="w-full border border-gray-300 rounded-md shadow-sm p-2" value={editValues.title || ''} onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))} />
                    <input className="w-full border border-gray-300 rounded-md shadow-sm p-2" value={editValues.category || ''} onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))} />
                    <input className="w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Обложка URL" value={editValues.cover_url || ''} onChange={(e) => setEditValues((v) => ({ ...v, cover_url: e.target.value }))} />
                    <input type="file" accept="image/*" onChange={(e) => setEditCoverFile(e.target.files ? e.target.files[0] : null)} />
                    <textarea className="w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Краткое" value={editValues.excerpt || ''} onChange={(e) => setEditValues((v) => ({ ...v, excerpt: e.target.value }))} />
                    <textarea className="w-full border border-gray-300 rounded-md shadow-sm p-2" rows={5} placeholder="Контент" value={editValues.content || ''} onChange={(e) => setEditValues((v) => ({ ...v, content: e.target.value }))} />
                    <div className="flex items-center gap-2">
                      <input id={`pub-${post.id}`} type="checkbox" checked={!!editValues.published} onChange={(e) => setEditValues((v) => ({ ...v, published: e.target.checked }))} />
                      <label htmlFor={`pub-${post.id}`} className="text-sm text-gray-700">Опубликовано</label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEdit}>Сохранить</Button>
                      <Button variant="outline" onClick={cancelEdit}>Отмена</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {post.cover_url ? (
                        <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Нет обложки</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-montserrat font-semibold text-gray-800">{post.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 border text-gray-600">{post.category}</span>
                        {!post.published && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 border text-yellow-700">Черновик</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>
                      <div className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => startEdit(post)}>Изменить</Button>
                      <Button variant="destructive" onClick={() => deletePost(post)}>Удалить</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
