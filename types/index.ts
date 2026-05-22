export interface Pet {
  id: string
  user_id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed?: string
  age?: number
  gender?: 'male' | 'female'
  weight?: number
  is_neutered?: boolean
  created_at: string
}

export type UrgencyLevel = 'observe' | 'caution' | 'emergency'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface Consultation {
  id: string
  user_id: string
  pet_id?: string
  pet_name?: string
  title: string
  urgency_level?: UrgencyLevel
  messages: Message[]
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_type: 'free' | 'premium'
  consultation_count: number
  created_at: string
}
