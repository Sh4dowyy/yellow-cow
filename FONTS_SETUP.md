# Настройка шрифтов для сайта Aria Toys

## Текущие шрифты

Сайт настроен для использования следующих шрифтов:

- **Montserrat** - основной шрифт для всего сайта
- **Neue Machina** - для заголовков (требует дополнительной настройки)

## Что уже настроено

✅ Montserrat подключен через Google Fonts  
✅ Tailwind CSS настроен для использования Montserrat  
✅ Созданы классы для разных типов текста  
✅ Подготовлена структура для добавления Neue Machina

## Как добавить Neue Machina

### Шаг 1: Получение шрифта

Neue Machina - это коммерческий шрифт от Pangram Pangram Foundry. Вы можете:

1. Купить лицензию на [pangrampangram.com](https://pangrampangram.com/products/neue-machina)
2. Или попробовать бесплатную версию для тестирования

### Шаг 2: Добавление файлов шрифта

1. Скачайте файлы шрифта (WOFF2 формат предпочтителен)
2. Поместите файлы в папку `public/fonts/`:
   - `NeueMachina-Light.woff2`
   - `NeueMachina-Regular.woff2`
   - `NeueMachina-Medium.woff2`
   - `NeueMachina-Bold.woff2`

### Шаг 3: Обновление layout.tsx

Раскомментируйте и обновите код в `app/layout.tsx`:

```typescript
import localFont from "next/font/local"

const neueMachina = localFont({
  src: [
    {
      path: "../public/fonts/NeueMachina-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMachina-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMachina-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMachina-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-machina",
  fallback: ["Montserrat", "Arial", "sans-serif"]
})

// В body добавить класс:
className={`${montserrat.variable} ${neueMachina.variable} bg-sky-50 font-montserrat`}
```

### Шаг 4: Обновление globals.css

Раскомментируйте и обновите стили для заголовков:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family:
    "Neue Machina", "Montserrat", "Helvetica Neue", "Arial", system-ui,
    sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.font-heading {
  font-family:
    "Neue Machina", "Montserrat", "Helvetica Neue", "Arial", system-ui,
    sans-serif;
  font-weight: 700;
  letter-spacing: -0.05em;
}
```

### Шаг 5: Обновление Tailwind config

Добавьте Neue Machina в `tailwind.config.ts`:

```typescript
fontFamily: {
  'neue-machina': ['var(--font-neue-machina)', 'Montserrat', 'Arial', 'sans-serif'],
  'montserrat': ['var(--font-montserrat)', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
  'sans': ['var(--font-montserrat)', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
  'heading': ['var(--font-neue-machina)', 'Montserrat', 'Arial', 'sans-serif'],
  // ... остальные
}
```

## Использование классов

После настройки вы сможете использовать следующие классы:

- `font-montserrat` - основной шрифт Montserrat
- `font-neue-machina` - шрифт Neue Machina (после настройки)
- `font-heading` - для заголовков (будет использовать Neue Machina или Montserrat)
- `font-display` - для больших заголовков
- `font-body` - для основного текста

## Альтернативы Neue Machina

Если не хотите покупать Neue Machina, можно использовать похожие бесплатные шрифты:

- **Space Grotesk** (Google Fonts)
- **Inter** (Google Fonts)
- **Work Sans** (Google Fonts)

Для их подключения просто замените Neue Machina на один из этих шрифтов в импорте Google Fonts.
