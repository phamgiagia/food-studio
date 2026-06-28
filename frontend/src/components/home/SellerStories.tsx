import Link from 'next/link';

const stories = [
  {
    id: 's1',
    name: 'Bà Nguyễn Thị Lan',
    store: 'Mắm Huế Truyền Thống',
    province: 'Thừa Thiên Huế',
    story: 'Hơn 30 năm giữ gìn hương vị mắm tôm Huế cổ truyền của gia đình...',
    slug: 'mam-hue-truyen-thong',
  },
  {
    id: 's2',
    name: 'Anh Trần Văn Minh',
    store: 'Cà Phê Buôn Ma Thuột',
    province: 'Đắk Lắk',
    story: 'Từ vườn cà phê Arabica trồng theo phương pháp canh tác tự nhiên...',
    slug: 'ca-phe-buon-ma-thuot',
  },
  {
    id: 's3',
    name: 'Chị Phạm Thị Hồng',
    store: 'Bánh Truyền Thống Nam Bộ',
    province: 'Tiền Giang',
    story: 'Mỗi chiếc bánh là cả một tình yêu gửi đến người thân và bạn bè...',
    slug: 'banh-truyen-thong-nam-bo',
  },
];

export function SellerStories() {
  return (
    <section className="section-padding bg-earth-900 text-white">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Câu Chuyện Nhà Bán Hàng
          </h2>
          <p className="text-earth-400 text-lg max-w-xl mx-auto">
            Đằng sau mỗi sản phẩm là những con người và câu chuyện đáng trân trọng.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((seller) => (
            <Link
              key={seller.id}
              href={`/sellers/${seller.slug}`}
              className="group p-6 rounded-2xl bg-earth-800/50 hover:bg-earth-800 transition-colors border border-earth-700 hover:border-brand-600"
            >
              <div className="w-14 h-14 rounded-full bg-earth-700 mb-4 group-hover:bg-brand-600 transition-colors" />
              <div className="text-earth-400 text-sm mb-1">{seller.province}</div>
              <h3 className="font-semibold text-lg mb-1">{seller.store}</h3>
              <p className="text-earth-400 text-sm mb-3">{seller.name}</p>
              <p className="text-earth-300 text-sm line-clamp-2">{seller.story}</p>
              <div className="mt-4 text-brand-400 text-sm font-medium group-hover:text-brand-300">
                Xem cửa hàng →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
