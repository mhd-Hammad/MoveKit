import { Navbar } from "@/components/shared/navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="md:ml-52 px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
