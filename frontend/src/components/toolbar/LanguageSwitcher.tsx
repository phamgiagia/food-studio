'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LOCALES = [
  { code: 'vi', label: 'VN' },
  { code: 'en', label: 'EN' },
];

function setLocaleCookie(locale: string) {
  // next-intl request config reads cookie "locale".
  // Keep it simple: 1 year.
  document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=31536000`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    const match = document.cookie
      .split(';')
      .map(v => v.trim())
      .find(v => v.startsWith('locale='));

    const val = match ? decodeURIComponent(match.split('=').slice(1).join('=')) : 'vi';
    if (val === 'en' || val === 'vi') setCurrent(val);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {LOCALES.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => {
            const nextLocale = l.code as 'vi' | 'en';
            setCurrent(nextLocale);
            setLocaleCookie(nextLocale);
            // Refresh the page so next-intl can re-resolve messages.
            router.refresh();
          }}
          className={
            current === l.code
              ? 'text-brand-600 font-semibold text-sm'
              : 'text-earth-600 hover:text-earth-900 font-medium text-sm'
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
