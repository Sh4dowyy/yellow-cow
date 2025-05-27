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
    category: "",
    mainImage: null as File | null,
    additionalImages: [] as File[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, mainImage: e.target.files![0] }))
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, additionalImages: files }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would upload the images and save the product data
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
        category: "",
        mainImage: null,
        additionalImages: [],
      })
      
      // Reset file inputs
      const mainImageInput = document.getElementById("mainImage") as HTMLInputElement
      const additionalImagesInput = document.getElementById("additionalImages") as HTMLInputElement
      if (mainImageInput) mainImageInput.value = ""
      if (additionalImagesInput) additionalImagesInput.value = ""
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
        <Label htmlFor="mainImage">Основное изображение (превью)</Label>
        <Input 
          id="mainImage" 
          type="file" 
          accept="image/*" 
          onChange={handleMainImageChange} 
          required 
        />
        <p className="text-sm text-gray-600">Это изображение будет отображаться в карточке товара</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="additionalImages">Дополнительные изображения</Label>
        <Input 
          id="additionalImages" 
          type="file" 
          accept="image/*" 
          multiple 
          onChange={handleAdditionalImagesChange}
        />
        <p className="text-sm text-gray-600">
          Эти изображения будут показываться только на странице товара (до 5 изображений)
        </p>
        {formData.additionalImages.length > 0 && (
          <p className="text-sm text-blue-600">
            Выбрано дополнительных изображений: {formData.additionalImages.length}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Добавление..." : "Добавить товар"}
      </Button>
    </form>
  )
}
