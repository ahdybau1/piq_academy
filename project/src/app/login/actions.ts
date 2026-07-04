'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface SignInState {
  error?: string;
}

export async function signIn(_prevState: SignInState | undefined, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email et mot de passe requis.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!adminUser) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès à l'Administration." };
  }

  redirect('/');
}
