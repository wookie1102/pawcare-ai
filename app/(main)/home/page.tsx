import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    '보호자'

  return <HomeClient displayName={displayName} />
}
