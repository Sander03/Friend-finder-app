import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types/User';

function toUser(session: Session): User {
  const { user } = session;
  const email = user.email ?? '';
  const name = (user.user_metadata?.display_name as string | undefined) ?? email.split('@')[0];
  return { id: user.id, email, name };
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error !== null || data.session === null) throw new Error(error?.message ?? 'Aanmelden mislukt');
  return toUser(data.session);
}

export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: name.trim() } },
  });
  if (error !== null) throw new Error(error.message);
  return data.session !== null ? toUser(data.session) : null;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error !== null) await supabase.auth.signOut({ scope: 'local' });
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session !== null ? toUser(data.session) : null;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session !== null ? toUser(session) : null);
  });
  return () => data.subscription.unsubscribe();
}
