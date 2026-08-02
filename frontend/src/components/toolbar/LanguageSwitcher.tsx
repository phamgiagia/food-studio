'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LOCALES = [
  { code: 'vi', label: 'VN' },
  { code: 'en', label: 'EN' },
];

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=31536000`;
}

export function LanguageSwitcher() {
  const router = useRouter();
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
    <div className="inline-flex items-center rounded-lg border border-earth-200 bg-earth-50 p-0.5 gap-0">
      {LOCALES.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => {
            const nextLocale = l.code as 'vi' | 'en';
            setCurrent(nextLocale);
            setLocaleCookie(nextLocale);
            router.refresh();
          }}
          className={
            current === l.code
              ? 'px-2.5 py-1 text-xs font-semibold text-white bg-brand-500 rounded-md transition-all'
              : 'px-2.5 py-1 text-xs font-medium text-earth-600 hover:text-earth-900 rounded-md transition-colors'
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
