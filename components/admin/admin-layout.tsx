"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  BarChart3,
  Calendar,
  Camera,
  FileText,
  Home,
  LogOut,
  Menu,
  Mountain,

  Users,
  MapPin,
  Bell,
  MessageSquare,
  Mail,
  Send,
  Database,
} from "lucide-react"

// Define navigation type for better type safety
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}
interface NavSection {
  section: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  { section: "Dashboard", items: [
    { name: "Dashboard", href: "/admin", icon: Home },
  ]},
  { section: "Content", items: [
    { name: "Tours", href: "/admin/tours", icon: MapPin },
    { name: "Gallery", href: "/admin/gallery", icon: Camera },
    { name: "Blog", href: "/admin/blog", icon: FileText },
    { name: "Comments", href: "/admin/comments", icon: MessageSquare },
    { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  ]},
  { section: "Operations", items: [
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Email", href: "/admin/email", icon: Send },
    { name: "Contact", href: "/admin/contact", icon: MessageSquare },
  ]},
  { section: "Analytics & Reports", items: [
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  ]},
  { section: "System", items: [
    { name: "User Management", href: "/admin/users", icon: Users },
  
    
  ]},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  // Persist sidebar scroll position
  useEffect(() => {
    const ref = sidebarScrollRef.current
    if (!ref) return
    // Restore scroll position
    const saved = localStorage.getItem("adminSidebarScroll")
    if (saved) ref.scrollTop = parseInt(saved, 10)
    // Save on scroll
    const handler = () => localStorage.setItem("adminSidebarScroll", ref.scrollTop.toString())
    ref.addEventListener("scroll", handler)
    return () => ref.removeEventListener("scroll", handler)
  }, [pathname])

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      window.location.href = "/signin"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo - Fixed */}
      <div className="flex-shrink-0 flex items-center px-6 py-6 border-b border-gray-200">
        <img src="/logo/samba tours-01.png" alt="Samba Tours Logo" className="h-12 w-auto mr-3" />
        <span className="text-xl font-bold text-gray-900 tracking-wide">SambaTours</span>
      </div>

      {/* Navigation Container - Scrollable */}
      <div className="flex-1 min-h-0">
        <div
          ref={sidebarScrollRef}
          className="h-full overflow-y-auto px-4 py-6 space-y-2"
          style={{
            maxHeight: 'calc(100vh - 200px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(16, 185, 129, 0.3) transparent'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: rgba(16, 185, 129, 0.3);
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: rgba(16, 185, 129, 0.5);
            }
          `}</style>
          {navigation.map((section) => (
            <div key={section.section}>
              <div className="mt-6 mb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {section.section}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => mobile && setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* User Info - Fixed */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-emerald-500 text-white text-xs">A</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">admin@sambatours.com</p>
          </div>
        </div>
      </div>
    </div>
  )

  // In the header, show the current page name
  const allNavItems = navigation.flatMap(section => section.items)
  const currentNavItem = allNavItems.find(i => i.href === pathname)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-1 bg-white">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-white">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content Area - With offset for fixed sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header - Fixed */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentNavItem?.name || "Admin Panel"}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Power/Logout Button with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out? You will need to sign in again to access the admin panel.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSignOut}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-emerald-500 text-white">A</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin</p>
                      <p className="text-xs leading-none text-muted-foreground">admin@sambatours.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      View Site
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
