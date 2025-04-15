"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  image_url: string
  category_id: string
}

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const { toast } = useToast()

  const getCategoryName = (categoryId: string) => {
    const categories: Record<string, string> = {
      plush: "Мягкие игрушки",
      construction: "Конструкторы",
      dolls: "Куклы",
      vehicles: "Транспорт",
      roleplay: "Ролевые игры",
      puzzles: "Пазлы",
    }
    return categories[categoryId] || categoryId
  }

  const handleDelete = (id: string) => {
    // In a real app, you would call an API to delete the product
    const productToDelete = products.find((product) => product.id === id)

    if (confirm(`Вы уверены, что хотите удалить товар "${productToDelete?.name}"?`)) {
      // Here you would typically call an API to delete the product
      toast({
        title: "Товар удален",
        description: `Товар "${productToDelete?.name}" был успешно удален.`,
      })
    }
  }

  const handleEdit = (id: string) => {
    // In a real app, you would navigate to an edit page or open a modal
    toast({
      title: "Редактирование",
      description: "Функция редактирования будет доступна в следующей версии.",
    })
  }

  return (
    <div>
      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Нет товаров в каталоге</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Фото</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead className="text-right">Цена</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-12 w-12 rounded overflow-hidden">
                    <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{getCategoryName(product.category_id)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(product.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
