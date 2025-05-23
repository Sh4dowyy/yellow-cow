import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-sky-500 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">Aria Toys</h3>
            <p className="text-sky-100 font-body leading-relaxed">Качественные игрушки для развития и радости вашего ребенка</p>
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sky-100 hover:text-white font-montserrat font-medium transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-sky-100 hover:text-white font-montserrat font-medium transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sky-100 hover:text-white font-montserrat font-medium transition-colors">
                  О нас
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sky-100 font-body">
              <li>Телефон: +7 (123) 456-78-90</li>
              <li>Email: info@ariatoys.ru</li>
              <li>Адрес: г. Москва, ул. Игрушечная, 123</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-sky-400 text-center text-sky-100">
          <p className="font-body">&copy; {new Date().getFullYear()} Aria Toys. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
