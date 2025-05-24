"use client"

import { useState, useEffect, useRef } from "react"
import { X, Mail, MessageCircle } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          message: ''
        })
        setTimeout(() => {
          setSubmitted(false)
          onClose()
        }, 2000)
      } else {
        alert('Произошла ошибка при отправке сообщения. Попробуйте еще раз.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Произошла ошибка при отправке сообщения. Попробуйте еще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[70vh] overflow-y-auto transform transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <h2 className="text-lg font-montserrat font-bold">Связаться с нами</h2>
          </div>
          <p className="text-blue-100 font-montserrat text-xs mt-1">
            Есть вопросы? Мы будем рады помочь!
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-montserrat font-bold text-gray-900 mb-2">
                Сообщение отправлено!
              </h3>
              <p className="text-gray-600 font-montserrat">
                Мы свяжемся с вами в ближайшее время.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-montserrat font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-montserrat"
                  placeholder="Ваше имя"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-montserrat font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-montserrat"
                  placeholder="ваш@email.com"
                />
              </div>



              <div>
                <label htmlFor="message" className="block text-sm font-montserrat font-medium text-gray-700 mb-1">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-montserrat resize-none"
                  placeholder="Ваше сообщение..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-montserrat font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Отправить сообщение
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 