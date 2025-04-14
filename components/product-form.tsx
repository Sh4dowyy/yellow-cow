"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function ProductForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    ageRecommendation: "",
    material: "",
    image: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would upload the image and save the product data
      // For demo purposes, we'll just simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      toast({
        title: "Товар добавлен",
        description: `Товар "${formData.name}" успешно добавлен в каталог.`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        ageRecommendation: "",
        material: "",
        image: null,
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Название товара</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="price">Цена (₽)</Label>
        <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} min="0" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Категория</Label>
        <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plush">Мягкие игрушки</SelectItem>
            <SelectItem value="construction">Конструкторы</SelectItem>
            <SelectItem value="dolls">Куклы</SelectItem>
            <SelectItem value="vehicles">Транспорт</SelectItem>
            <SelectItem value="roleplay">Ролевые игры</SelectItem>
            <SelectItem value="puzzles">Пазлы</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ageRecommendation">Рекомендуемый возраст</Label>
        <Select
          value={formData.ageRecommendation}
          onValueChange={(value) => handleSelectChange("ageRecommendation", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите возраст" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0+">0+</SelectItem>
            <SelectItem value="1+">1+</SelectItem>
            <SelectItem value="3+">3+</SelectItem>
            <SelectItem value="5+">5+</SelectItem>
            <SelectItem value="7+">7+</SelectItem>
            <SelectItem value="10+">10+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="material">Материал</Label>
        <Input id="material" name="material" value={formData.material} onChange={handleChange} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image">Изображение товара</Label>
        <Input id="image" type="file" accept="image/*" onChange={handleFileChange} required />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Добавление..." : "Добавить товар"}
      </Button>
    </form>
  )
}
