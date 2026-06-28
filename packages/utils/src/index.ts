// Shared utilities for all packages (edge-safe, no Node built-ins)

export function formatPrice(amount: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

export function formatDate(timestamp: number, locale = 'vi-VN'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(timestamp * 1000));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map(k => [k, obj[k]])) as Pick<T, K>;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = { ...obj };
  for (const k of keys) delete copy[k];
  return copy as Omit<T, K>;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Vietnamese province list
export const PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
  'Cần Thơ', 'Đà Nẵng', 'Hà Nội', 'Hải Phòng', 'TP. Hồ Chí Minh',
  'Phú Yên',
] as const;

export type Province = typeof PROVINCES[number];

export const REGION_MAP: Record<string, Province[]> = {
  north: ['Hà Nội', 'Hải Phòng', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Cao Bằng', 'Điện Biên', 'Hà Giang', 'Hà Nam', 'Hải Dương', 'Hòa Bình', 'Hưng Yên', 'Lai Châu', 'Lào Cai', 'Lạng Sơn', 'Nam Định', 'Ninh Bình', 'Phú Thọ', 'Quảng Ninh', 'Sơn La', 'Thái Bình', 'Thái Nguyên', 'Tuyên Quang', 'Vĩnh Phúc', 'Yên Bái'],
  central: ['Đà Nẵng', 'Bình Định', 'Bình Thuận', 'Hà Tĩnh', 'Khánh Hòa', 'Nghệ An', 'Ninh Thuận', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Trị', 'Thanh Hóa', 'Thừa Thiên Huế'],
  south: ['TP. Hồ Chí Minh', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bến Tre', 'Bình Dương', 'Bình Phước', 'Cà Mau', 'Cần Thơ', 'Đồng Nai', 'Đồng Tháp', 'Hậu Giang', 'Kiên Giang', 'Long An', 'Sóc Trăng', 'Tây Ninh', 'Tiền Giang', 'Trà Vinh', 'Vĩnh Long'],
  highland: ['Đắk Lắk', 'Đắk Nông', 'Gia Lai', 'Kon Tum', 'Lâm Đồng'],
};
