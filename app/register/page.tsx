"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/utils/supabase/supabaseClient"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Error registering:", error)
        setError("Ошибка регистрации. Попробуйте еще раз.")
      } else {
        // Successful registration
        setError(null)
        router.push("/login?message=Проверьте вашу почту для подтверждения регистрации")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Произошла ошибка. Попробуйте еще раз.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-montserrat">Регистрация</CardTitle>
          <CardDescription className="text-center font-montserrat">
            Создайте аккаунт для доступа к личному кабинету
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-montserrat">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-montserrat">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-montserrat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-montserrat">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-montserrat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-montserrat">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="font-montserrat"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full font-montserrat" 
              disabled={isLoading}
            >
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
            <div className="text-center">
              <span className="text-sm text-gray-600 font-montserrat">
                Уже есть аккаунт?{" "}
              </span>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-sm text-sky-600 hover:text-sky-500 font-montserrat underline"
              >
                Войти
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
