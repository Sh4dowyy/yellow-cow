"use client"

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    ymaps: any
  }
}

interface YandexMapProps {
  address: string
  className?: string
}

export default function YandexMap({ address, className = "" }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadYandexMaps = () => {
      if (window.ymaps && mapRef.current) {
        window.ymaps.ready(() => {
          const map = new window.ymaps.Map(mapRef.current, {
            center: [59.944319, 30.560183], // Координаты Янино-1, Шоссейная ул., 48Ес2
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
          })

          // Добавляем метку на карту
          const placemark = new window.ymaps.Placemark([59.944319, 30.560183], {
            balloonContent: `
              <div style="padding: 10px;">
                <strong>ARIA TOYS</strong><br/>
                ${address}<br/>
                <small>Магазин детских игрушек</small>
              </div>
            `,
            hintContent: 'ARIA TOYS - Магазин детских игрушек'
          }, {
            iconLayout: 'default#image',
            iconImageHref: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconImageSize: [32, 32],
            iconImageOffset: [-16, -32]
          })

          map.geoObjects.add(placemark)
        })
      }
    }

    // Загружаем Yandex Maps API если еще не загружен
    if (!window.ymaps) {
      const script = document.createElement('script')
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU'
      script.onload = loadYandexMaps
      document.head.appendChild(script)
    } else {
      loadYandexMaps()
    }
  }, [address])

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '250px' }}
    />
  )
} 