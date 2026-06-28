import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'vi';
  const validLocales = ['vi', 'en'];
  const resolvedLocale = validLocales.includes(locale) ? locale : 'vi';

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
