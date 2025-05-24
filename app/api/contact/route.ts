import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // For development - just log the message
    console.log('=== НОВОЕ СООБЩЕНИЕ С САЙТА ===')
    console.log('Имя:', name)
    console.log('Email:', email) 
    console.log('Сообщение:', message)
    console.log('Время:', new Date().toLocaleString('ru-RU'))
    console.log('===============================')

    // If email credentials are configured, send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: 'silversea2267@gmail.com',
          subject: `Сообщение с сайта ARIA TOYS от ${name}`,
          html: `
            <h2>Новое сообщение с сайта ARIA TOYS</h2>
            <p><strong>Имя отправителя:</strong> ${name}</p>
            <p><strong>Email отправителя:</strong> ${email}</p>
            <p><strong>Сообщение:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr>
            <p style="color: #666; font-size: 12px;">
              <em>Отправлено ${new Date().toLocaleString('ru-RU')} через форму обратной связи сайта ARIA TOYS</em>
            </p>
          `,
        }

        await transporter.sendMail(mailOptions)
        console.log('Email отправлен успешно!')
      } catch (emailError) {
        console.error('Ошибка отправки email:', emailError)
      }
    } else {
      console.log('Email не настроен - сообщение только в логах')
    }

    return NextResponse.json({ message: 'Сообщение успешно отправлено' })
  } catch (error) {
    console.error('Общая ошибка:', error)
    return NextResponse.json(
      { error: 'Ошибка при отправке сообщения' },
      { status: 500 }
    )
  }
} 