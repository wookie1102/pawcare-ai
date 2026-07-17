'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, MessageCircle, Pill, MapPin, User } from 'lucide-react'

const navItems = [
  { href: '/home', icon: Home, label: '홈' },
  { href: '/health', icon: ClipboardList, label: '건강일지' },
  { href: '/history', icon: MessageCircle, label: '상담기록' },
  { href: '/prescription', icon: Pill, label: '처방전' },
  { href: '/hospitals', icon: MapPin, label: '병원찾기' },
  { href: '/profile', icon: User, label: '내정보' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-1 pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[9px] font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
