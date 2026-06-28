import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="container-wide py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/blog" className="flex items-center gap-2 text-earth-500 hover:text-earth-700 mb-6 text-sm font-medium transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Quay lại Blog
        </Link>

        <div className="mb-4">
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">Câu chuyện</span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-900 mb-4">
          {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </h1>

        <div className="flex items-center gap-3 text-earth-400 text-sm mb-8 pb-8 border-b border-earth-100">
          <div className="w-8 h-8 rounded-full bg-earth-200" />
          <span>Đội ngũ Food Studio</span>
          <span>·</span>
          <span>6 phút đọc</span>
          <span>·</span>
          <span>28/06/2025</span>
        </div>

        <div className="aspect-video rounded-2xl bg-earth-100 mb-8" />

        <div className="prose prose-earth max-w-none">
          <p className="text-earth-600 leading-relaxed text-base mb-4">
            Câu chuyện về những người giữ gìn hương vị truyền thống, những vùng đất đặc biệt và những sản phẩm mang theo cả một văn hóa ẩm thực độc đáo...
          </p>
          <p className="text-earth-600 leading-relaxed text-base mb-4">
            Mỗi sản phẩm trên Food Studio đều có một câu chuyện riêng. Đó là câu chuyện của người nông dân chắt chiu từng mùa vụ, của nghệ nhân truyền nghề từ thế hệ này sang thế hệ khác...
          </p>
          <p className="text-earth-600 leading-relaxed text-base">
            Đây chỉ là bản xem trước. Nội dung đầy đủ sẽ được tải từ CMS trong phiên bản production.
          </p>
        </div>
      </div>
    </div>
  );
}
