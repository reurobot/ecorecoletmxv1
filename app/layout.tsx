import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EcoRecolectMexico",
  description: "Sistema de Gestión de Recolección de Basura",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
 <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
 {children}
 </ThemeProvider>
 </AuthProvider>
      </body>
    </html>
  )
}
