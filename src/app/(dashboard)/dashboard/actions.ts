'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function makeMeAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { error } = await supabase.from('profiles').upsert({ id: user.id, is_admin: true })
    if (error) {
      console.error('Make admin error:', error)
    }
    revalidatePath('/dashboard')
    revalidatePath('/admin', 'layout')
  }
}
