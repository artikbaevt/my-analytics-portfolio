import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Серверный клиент — используется в Server Components и route handlers.
// Отдельный от client.ts специально: там нет доступа к cookies(), а здесь
// он нужен, чтобы позже /admin мог проверять сессию авторизованного пользователя.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll вызван из Server Component — можно игнорировать,
            // если есть middleware, обновляющий сессию (добавим на этапе admin)
          }
        },
      },
    }
  );
}
