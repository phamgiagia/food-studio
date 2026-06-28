import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Blog | Câu Chuyện Đặc Sản' };

const posts = [
  { slug: 'bi-mat-nuoc-mam-phu-quoc', title: 'Bí Mật Của Chai Nước Mắm Phú Quốc Ngon Nhất', excerpt: 'Khám phá quá trình sản xuất nước mắm truyền thống đảo Phú Quốc, từ đánh bắt đến thành phẩm...', category: 'Câu chuyện', readTime: '6 phút', createdAt: Math.floor(Date.now() / 1000) - 86400 * 3 },
  { slug: 'hanh-trinh-ca-phe-buon-ma-thuot', title: 'Hành Trình Từ Vườn Đến Ly Cà Phê Buôn Ma Thuột', excerpt: 'Người nông dân Tây Nguyên và câu chuyện canh tác Arabica theo phương pháp hữu cơ...', category: 'Hành trình', readTime: '8 phút', createdAt: Math.floor(Date.now() / 1000) - 86400 * 7 },
  { slug: 'tet-viet-qua-tang-dac-san', title: 'Tết Việt: Ý Nghĩa Của Những Món Quà Đặc Sản', excerpt: 'Tại sao đặc sản vùng miền lại là món quà ý nghĩa nhất trong dịp Tết Nguyên Đán...', category: 'Văn hóa', readTime: '5 phút', createdAt: Math.floor(Date.now() / 1000) - 86400 * 14 },
  { slug: 'mam-tom-hue-truyen-thong', title: 'Mắm Tôm Huế: Linh Hồn Ẩm Thực Cố Đô', excerpt: 'Từ đầm phá Tam Giang đến bàn ăn, hành trình của hũ mắm tôm Huế chính gốc...', category: 'Ẩm thực', readTime: '7 phút', createdAt: Math.floor(Date.now() / 1000) - 86400 * 21 },
];

const categories = ['Tất cả', 'Câu chuyện', 'Hành trình', 'Văn hóa', 'Ẩm thực', 'Công thức'];

export default function BlogPage() {
  return (
    <div className="container-wide py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-2">Câu Chuyện Đặc Sản</h1>
          <p className="text-earth-500">Những câu chuyện về con người, vùng đất và hương vị quê hương</p>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8 justify-center">
          {categories.map(cat => (
            <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === 'Tất cả' ? 'bg-brand-500 text-white' : 'bg-earth-100 text-earth-700 hover:bg-earth-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white border border-earth-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex gap-5 p-5">
                <div className="w-28 h-28 rounded-xl bg-earth-100 shrink-0 group-hover:bg-earth-200 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">{post.category}</span>
                    <span className="text-earth-400 text-xs">{post.readTime} đọc</span>
                  </div>
                  <h2 className="font-bold text-earth-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-earth-500 text-sm line-clamp-2">{post.excerpt}</p>
                  <p className="text-earth-400 text-xs mt-2">{formatDate(post.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
