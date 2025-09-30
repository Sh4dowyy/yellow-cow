"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [patronymic, setPatronymic] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setEmail(user.email ?? null)
      // load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, patronymic, phone, avatar_url')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFirstName(profile.first_name || "")
        setLastName(profile.last_name || "")
        setPatronymic(profile.patronymic || "")
        setPhone(profile.phone || "")
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // upsert profile
    await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName || null,
      last_name: lastName || null,
      patronymic: patronymic || null,
      phone: phone || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setError(null)
    setUploading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("Пользователь не авторизован")
        return
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
      console.log("Uploading file:", fileName, "to bucket: avatars")
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      
      if (uploadError) {
        console.error("Upload error:", uploadError)
        setError(`Ошибка загрузки: ${uploadError.message}`)
        return
      }
      
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      console.log("Upload successful, public URL:", urlData?.publicUrl)
      setAvatarUrl(urlData?.publicUrl ?? null)
      // persist avatar_url into profiles table
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: urlData?.publicUrl ?? null,
      })
      
    } catch (err) {
      console.error("Avatar upload error:", err)
      setError("Произошла ошибка при загрузке файла")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12" />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="font-montserrat">Личный кабинет</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-gray-700 font-montserrat">Вы вошли как: {email}</div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded font-montserrat text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm font-montserrat">Нет фото</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="avatar" className="font-montserrat">Фото</Label>
                  <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    disabled={uploading}
                    className="font-montserrat" 
                  />
                  {uploading && (
                    <p className="text-sm text-gray-500 font-montserrat mt-1">Загрузка...</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-montserrat">Имя</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="font-montserrat" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-montserrat">Фамилия</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="font-montserrat" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patronymic" className="font-montserrat">Отчество</Label>
                  <Input id="patronymic" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} className="font-montserrat" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-montserrat">Телефон</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-montserrat" />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="font-montserrat">{saving ? 'Сохранение...' : 'Сохранить'}</Button>
                <Button type="button" onClick={handleSignOut} variant="default" className="font-montserrat">Выйти</Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


