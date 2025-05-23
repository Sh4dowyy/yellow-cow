"use client"

import { useState } from "react"
import Header from "./header"
import CategorySidebar from "./category-sidebar"

export default function HeaderWithSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <>
      <Header onCategoryMenuToggle={handleToggleSidebar} />
      <CategorySidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
    </>
  )
} 