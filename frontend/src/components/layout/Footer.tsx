import Link from 'next/link';

const links = {
  'Mua sắm': [
    { label: 'Tất cả sản phẩm', href: '/products' },
    { label: 'Miền Bắc', href: '/products?region=north' },
    { label: 'Miền Trung', href: '/products?region=central' },
    { label: 'Miền Nam', href: '/products?region=south' },
  ],
  'Nhà bán hàng': [
    { label: 'Tất cả cửa hàng', href: '/sellers' },
    { label: 'Đăng ký bán hàng', href: '/sellers/apply' },
    { label: 'Hướng dẫn bán hàng', href: '/docs/seller-guide' },
  ],
  'Hỗ trợ': [
    { label: 'Trung tâm hỗ trợ', href: '/help' },
    { label: 'Chính sách vận chuyển', href: '/shipping' },
    { label: 'Chính sách hoàn trả', href: '/return-policy' },
    { label: 'Liên hệ', href: '/contact' },
  ],
  'Về chúng tôi': [
    { label: 'Câu chuyện', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Tuyển dụng', href: '/careers' },
    { label: 'Báo chí', href: '/press' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-300">
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="font-semibold text-white mb-4 text-sm">{heading}</h3>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-earth-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-lg font-bold text-white">Food Studio</div>
          <p className="text-earth-500 text-sm text-center">
            © 2025 Food Studio. Kết nối hương vị quê hương.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
