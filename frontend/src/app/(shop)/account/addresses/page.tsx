'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';

const mockAddresses = [
  { id: 'a1', label: 'Nhà riêng', fullName: 'Nguyễn Văn A', phone: '0901234567', line1: '123 Nguyễn Trãi', district: 'Quận 1', province: 'TP. Hồ Chí Minh', isDefault: true },
  { id: 'a2', label: 'Văn phòng', fullName: 'Nguyễn Văn A', phone: '0901234567', line1: '456 Lê Văn Lương', district: 'Thanh Xuân', province: 'Hà Nội', isDefault: false },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-earth-900">Địa Chỉ Giao Hàng</h1>
        <button className="btn-primary gap-2 text-sm py-2 px-4">
          <PlusIcon className="w-4 h-4" /> Thêm địa chỉ
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className={`bg-white border rounded-2xl p-5 ${addr.isDefault ? 'border-brand-300 ring-1 ring-brand-200' : 'border-earth-100'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-earth-800">{addr.label}</span>
                {addr.isDefault && (
                  <span className="bg-brand-100 text-brand-600 text-xs font-semibold px-2 py-0.5 rounded-full">Mặc định</span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="text-earth-400 hover:text-earth-600 p-1">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                  className="text-earth-400 hover:text-red-400 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-earth-700 font-medium">{addr.fullName} · {addr.phone}</p>
            <p className="text-sm text-earth-500">{addr.line1}, {addr.district}, {addr.province}</p>
            {!addr.isDefault && (
              <button className="mt-3 text-xs text-brand-600 hover:text-brand-700 font-medium">
                Đặt làm mặc định
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
