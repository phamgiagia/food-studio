import type { Metadata } from 'next';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = { title: 'Nhà Bán Hàng' };

const sellers = [
  { id: 's1', name: 'Mắm Huế Bà Lan', owner: 'Nguyễn Thị Lan', province: 'Huế', status: 'pending', date: '25/06/2025', products: 0 },
  { id: 's2', name: 'Cà Phê Đắk Lắk Anh Minh', owner: 'Trần Văn Minh', province: 'Đắk Lắk', status: 'pending', date: '24/06/2025', products: 0 },
  { id: 's3', name: 'Bánh Dân Gian Tiền Giang', owner: 'Phạm Thị Hồng', province: 'Tiền Giang', status: 'approved', date: '20/06/2025', products: 24 },
  { id: 's4', name: 'Nước Mắm Phú Quốc Thật', owner: 'Lê Văn Nam', province: 'Kiên Giang', status: 'approved', date: '15/06/2025', products: 8 },
];

export default function SellersPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nhà Bán Hàng</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý và phê duyệt nhà bán hàng</p>
        </div>
        <div className="flex gap-2">
          {['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Tạm khóa'].map(tab => (
            <button key={tab} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'Tất cả' ? 'bg-orange-500 text-white' : 'bg-white border hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cửa hàng</th>
              <th>Chủ sở hữu</th>
              <th>Tỉnh thành</th>
              <th>Sản phẩm</th>
              <th>Trạng thái</th>
              <th>Ngày đăng ký</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="font-medium text-gray-900">{s.name}</td>
                <td className="text-gray-600">{s.owner}</td>
                <td className="text-gray-600">{s.province}</td>
                <td className="text-gray-600">{s.products}</td>
                <td>
                  <span className={s.status === 'approved' ? 'badge-green' : 'badge-yellow'}>
                    {s.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="text-gray-500">{s.date}</td>
                <td>
                  {s.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium">
                        <CheckCircleIcon className="w-4 h-4" />
                        Duyệt
                      </button>
                      <button className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-medium">
                        <XCircleIcon className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  )}
                  {s.status === 'approved' && (
                    <button className="text-gray-500 hover:text-red-500 text-xs font-medium">
                      Tạm khóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
