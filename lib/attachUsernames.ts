import type { SupabaseClient } from '@supabase/supabase-js';

// garage_cars tablosu eski (Vite döneminden kalma) bir tablo olduğu için
// user_id sütununun profiles(id) ile doğrudan bir foreign key ilişkisi
// olup olmadığından emin değiliz. PostgREST'in otomatik ilişki kurma
// söz dizimine (".select('..., profiles(username)')") güvenmek yerine,
// kullanıcı adlarını ayrı bir sorguyla çekip elle eşliyoruz — bu, hangi
// foreign key kurulu olursa olsun her zaman çalışır.
export async function attachUsernames<T extends { user_id: string }>(
  supabase: SupabaseClient,
  rows: T[]
): Promise<(T & { author_username: string | null })[]> {
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);

  const usernameById = new Map((profiles ?? []).map((p: any) => [p.id, p.username as string | null]));

  return rows.map((row) => ({
    ...row,
    author_username: usernameById.get(row.user_id) ?? null
  }));
}
