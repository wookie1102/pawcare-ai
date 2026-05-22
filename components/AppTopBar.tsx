'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Plus, Check } from 'lucide-react'
import { getPets, getActivePetId, setActivePetId, type PetProfile } from '@/lib/storage'

const PET_EMOJIS: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' }

export default function AppTopBar() {
  const [pets, setPets] = useState<PetProfile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  function refresh() {
    setPets(getPets())
    setActiveId(getActivePetId())
  }

  useEffect(() => {
    refresh()
    const handler = () => refresh()
    window.addEventListener('storage', handler)
    window.addEventListener('pawcare_pet_updated', handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener('pawcare_pet_updated', handler)
    }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function switchPet(id: string) {
    setActivePetId(id)
    setActiveId(id)
    setOpen(false)
    window.dispatchEvent(new Event('pawcare_pet_updated'))
  }

  const activePet = pets.find(p => p.id === activeId) || pets[0]

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-12">
      <div className="max-w-md mx-auto h-full flex items-center justify-between px-4">
        {/* 브랜딩 */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🐾</span>
          <span className="text-base font-bold text-green-700 tracking-tight">PawCare AI</span>
        </div>

        {/* 반려동물 전환 */}
        <div className="relative" ref={ref}>
          {pets.length === 0 ? (
            <a href="/profile" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-600 transition-colors">
              <Plus size={13} />
              반려동물 등록
            </a>
          ) : (
            <>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full px-3 py-1 transition-colors"
              >
                <span className="text-sm">{activePet ? (activePet.emoji || PET_EMOJIS[activePet.species]) : '🐾'}</span>
                <span className="text-xs font-semibold text-green-700 max-w-[60px] truncate">
                  {activePet?.name || '선택'}
                </span>
                <ChevronDown size={12} className="text-green-500" />
              </button>

              {open && (
                <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 min-w-[160px] z-50">
                  {pets.map(pet => (
                    <button
                      key={pet.id}
                      onClick={() => switchPet(pet.id)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-base">{pet.emoji || PET_EMOJIS[pet.species]}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">{pet.name}</p>
                        <p className="text-[10px] text-gray-400">{pet.breed}</p>
                      </div>
                      {pet.id === activeId && <Check size={13} className="text-green-500" />}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <a
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Plus size={12} />
                      반려동물 추가
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
