'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { getPets, savePet, deletePet, setActivePetId, getActivePetId, type PetProfile } from '@/lib/storage'
import LegalDisclaimer from '@/components/LegalDisclaimer'

const CONDITIONS = ['심장병', '신부전', '당뇨', '관절염', '갑상선 질환', '쿠싱 증후군', '간 질환', '기타']
const SPECIES_LABELS: Record<string, string> = { dog: '강아지', cat: '고양이', other: '기타' }
const SPECIES_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱', other: '🐾' }
const PET_EMOJIS = ['🐶', '🐱', '🐰', '🐹', '🐦', '🦜', '🐠', '🐢', '🐾']

function emptyPet(): PetProfile {
  return { id: '', name: '', species: 'dog', breed: '', ageYears: '', ageMonths: '', weight: '', conditions: [], notes: '', emoji: '' }
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [pets, setPets] = useState<PetProfile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  function refresh() {
    setPets(getPets())
    setActiveId(getActivePetId())
  }

  useEffect(() => { refresh() }, [])

  function openNew() {
    setEditingPet(emptyPet())
    setIsNew(true)
  }

  function openEdit(pet: PetProfile) {
    setEditingPet({ ...pet })
    setIsNew(false)
  }

  function closeEdit() {
    setEditingPet(null)
  }

  function toggleCondition(c: string) {
    if (!editingPet) return
    setEditingPet(p => ({
      ...p!,
      conditions: p!.conditions.includes(c) ? p!.conditions.filter(x => x !== c) : [...p!.conditions, c],
    }))
  }

  function handleSave() {
    if (!editingPet || !editingPet.name.trim()) return
    const id = editingPet.id || `pet_${Date.now()}`
    const toSave = {
      ...editingPet,
      id,
      emoji: editingPet.emoji || SPECIES_EMOJI[editingPet.species],
    }
    savePet(toSave)
    if (!getActivePetId()) setActivePetId(id)
    setSavedId(id)
    setTimeout(() => setSavedId(null), 2000)
    refresh()
    window.dispatchEvent(new Event('pawcare_pet_updated'))
    closeEdit()
  }

  function handleDelete(id: string) {
    if (!confirm('이 반려동물 프로필을 삭제할까요?')) return
    deletePet(id)
    refresh()
    window.dispatchEvent(new Event('pawcare_pet_updated'))
  }

  function switchActive(id: string) {
    setActivePetId(id)
    setActiveId(id)
    window.dispatchEvent(new Event('pawcare_pet_updated'))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">내 정보</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors"
        >
          <Plus size={13} />
          반려동물 추가
        </button>
      </div>

      {/* 등록된 반려동물 목록 */}
      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-3">
          <div className="text-4xl mb-3">🐾</div>
          <p className="text-gray-500 text-sm font-medium mb-1">아직 등록된 반려동물이 없어요</p>
          <p className="text-gray-400 text-xs mb-4">반려동물 정보를 등록하면 맞춤 AI 상담을 받을 수 있어요</p>
          <button
            onClick={openNew}
            className="bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            첫 번째 반려동물 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {pets.map(pet => (
            <div
              key={pet.id}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                pet.id === activeId ? 'border-green-400' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => switchActive(pet.id)} className="flex items-center gap-3 flex-1 text-left">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    {pet.emoji || SPECIES_EMOJI[pet.species]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-800">{pet.name}</p>
                      {pet.id === activeId && (
                        <span className="text-[9px] bg-green-100 text-green-600 font-bold px-1.5 py-0.5 rounded-full">현재</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {SPECIES_LABELS[pet.species]} · {pet.breed}
                      {pet.ageYears && ` · ${pet.ageYears}살`}
                      {pet.weight && ` · ${pet.weight}kg`}
                    </p>
                    {pet.conditions.length > 0 && (
                      <p className="text-xs text-amber-600 mt-0.5">{pet.conditions.join(', ')}</p>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(pet)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 계정 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-3">
        <p className="text-sm font-semibold text-gray-800 mb-3">계정</p>
        <button
          onClick={handleLogout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          로그아웃
        </button>
      </div>

      <LegalDisclaimer />

      {/* 반려동물 등록/수정 모달 */}
      {editingPet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-800">
                {isNew ? '반려동물 등록' : '프로필 수정'}
              </h2>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* 이모지 선택 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">아이콘</label>
                <div className="flex gap-2 flex-wrap">
                  {PET_EMOJIS.map(em => (
                    <button
                      key={em}
                      onClick={() => setEditingPet(p => ({ ...p!, emoji: em }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                        editingPet.emoji === em ? 'border-green-500 bg-green-50' : 'border-transparent bg-gray-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* 이름 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">이름 *</label>
                <input
                  type="text"
                  value={editingPet.name}
                  onChange={e => setEditingPet(p => ({ ...p!, name: e.target.value }))}
                  placeholder="예: 콩이"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              {/* 종류 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">종류</label>
                <div className="flex gap-2">
                  {(['dog', 'cat', 'other'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setEditingPet(p => ({ ...p!, species: s }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        editingPet.species === s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {SPECIES_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 견종 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">견종/품종</label>
                <input
                  type="text"
                  value={editingPet.breed}
                  onChange={e => setEditingPet(p => ({ ...p!, breed: e.target.value }))}
                  placeholder="예: 시츄, 말티즈, 페르시안"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              {/* 나이 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">나이</label>
                <div className="flex gap-2">
                  {[
                    { key: 'ageYears', placeholder: '0', suffix: '살' },
                    { key: 'ageMonths', placeholder: '0', suffix: '개월' },
                  ].map(({ key, placeholder, suffix }) => (
                    <div key={key} className="flex items-center gap-1.5 flex-1">
                      <input
                        type="number"
                        value={(editingPet as Record<string, string>)[key]}
                        onChange={e => setEditingPet(p => ({ ...p!, [key]: e.target.value }))}
                        placeholder={placeholder}
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <span className="text-xs text-gray-400 whitespace-nowrap">{suffix}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 체중 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">체중</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={editingPet.weight}
                    onChange={e => setEditingPet(p => ({ ...p!, weight: e.target.value }))}
                    placeholder="예: 4.5"
                    step="0.1"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <span className="text-xs text-gray-400">kg</span>
                </div>
              </div>

              {/* 기저질환 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">기저질환</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCondition(c)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        editingPet.conditions.includes(c)
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {editingPet.conditions.includes(c) && <Check size={11} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 특이사항 */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">특이사항</label>
                <textarea
                  value={editingPet.notes}
                  onChange={e => setEditingPet(p => ({ ...p!, notes: e.target.value }))}
                  placeholder="알레르기, 수술 이력, 현재 복용 중인 약 등"
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>
            </div>

            <div className="px-5 pb-6 pt-2 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={!editingPet.name.trim()}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-200 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
