import { describe, it, expect } from 'vitest';
import {
  formatPrice, formatDate, slugify, truncate,
  pick, omit, chunk, PROVINCES, REGION_MAP,
} from '../index';

describe('formatPrice', () => {
  it('formats VND amounts with Vietnamese locale', () => {
    const result = formatPrice(150000);
    expect(result).toContain('150');
    expect(result).toContain('000');
  });

  it('formats zero correctly', () => {
    const result = formatPrice(0);
    expect(result).toMatch(/0/);
  });

  it('accepts custom currency', () => {
    const result = formatPrice(10, 'USD');
    expect(result).toContain('10');
  });
});

describe('formatDate', () => {
  it('formats unix timestamp in dd/MM/yyyy format', () => {
    // 2024-01-15 UTC
    const ts = new Date('2024-01-15T00:00:00Z').getTime() / 1000;
    const result = formatDate(ts);
    expect(result).toContain('2024');
    expect(result).toContain('01');
    expect(result).toContain('15');
  });
});

describe('slugify', () => {
  it('converts ASCII to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes Vietnamese diacritics', () => {
    const result = slugify('Mắm tôm Huế');
    expect(result).not.toMatch(/[àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắặằẳẵẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i);
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(slugify('foo   bar--baz')).toBe('foo-bar-baz');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-hello-')).toBe('hello');
  });
});

describe('truncate', () => {
  it('returns original if within limit', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('truncates and appends ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('truncates at exact boundary', () => {
    expect(truncate('abcde', 5)).toBe('abcde');
    expect(truncate('abcdef', 5)).toBe('abcde...');
  });
});

describe('pick', () => {
  it('picks specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('returns empty object when no keys', () => {
    expect(pick({ a: 1 }, [])).toEqual({});
  });
});

describe('omit', () => {
  it('omits specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('does not mutate original', () => {
    const obj = { a: 1, b: 2 };
    omit(obj, ['a']);
    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

describe('chunk', () => {
  it('splits array into chunks of given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns one chunk if size >= array length', () => {
    expect(chunk([1, 2], 10)).toEqual([[1, 2]]);
  });

  it('returns empty array for empty input', () => {
    expect(chunk([], 3)).toEqual([]);
  });
});

describe('PROVINCES and REGION_MAP', () => {
  it('contains all 5 centrally governed cities', () => {
    expect(PROVINCES).toContain('Hà Nội');
    expect(PROVINCES).toContain('TP. Hồ Chí Minh');
    expect(PROVINCES).toContain('Đà Nẵng');
    expect(PROVINCES).toContain('Hải Phòng');
    expect(PROVINCES).toContain('Cần Thơ');
  });

  it('has 4 regions in REGION_MAP', () => {
    expect(Object.keys(REGION_MAP)).toEqual(
      expect.arrayContaining(['north', 'central', 'south', 'highland'])
    );
  });

  it('Hà Nội is in north region', () => {
    expect(REGION_MAP.north).toContain('Hà Nội');
  });

  it('TP. Hồ Chí Minh is in south region', () => {
    expect(REGION_MAP.south).toContain('TP. Hồ Chí Minh');
  });
});
