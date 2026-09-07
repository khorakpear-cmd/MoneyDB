import React from 'react';
import { Coffee, Utensils, Bus, ShoppingBag, PlusCircle } from 'lucide-react';
import { Transaction } from '../types';

interface QuickAddBarProps {
  onQuickAdd: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  onOpenModal: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onQuickAdd, onOpenModal }) => {
  const today = new Date().toISOString().split('T')[0];

  const presets = [
    { label: 'กาแฟ 60฿', category: 'อาหารและเครื่องดื่ม', amount: 60, desc: 'กาแฟ / เครื่องดื่ม', icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: 'ข้าว 70฿', category: 'อาหารและเครื่องดื่ม', amount: 70, desc: 'อาหารจานเดียว', icon: <Utensils className="w-3.5 h-3.5" /> },
    { label: 'เดินทาง 50฿', category: 'เดินทาง / น้ำมัน', amount: 50, desc: 'BTS/MRT/วิน', icon: <Bus className="w-3.5 h-3.5" /> },
    { label: '7-Eleven 120฿', category: 'ช้อปปิ้ง / ของใช้', amount: 120, desc: 'สะดวกซื้อ 7-Eleven', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
      <span className="text-slate-400 text-[11px] font-medium shrink-0 flex items-center gap-1">
        บันทึกด่วน 1-คลิก:
      </span>

      {presets.map((p, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() =>
            onQuickAdd({
              type: 'expense',
              amount: p.amount,
              category: p.category,
              description: p.desc,
              date: today,
              paymentMethod: 'promptpay',
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 hover:border-sky-300 border border-slate-200 text-slate-700 font-medium transition shrink-0 cursor-pointer shadow-2xs"
        >
          {p.icon}
          <span>{p.label}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onOpenModal}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium transition shrink-0 cursor-pointer"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span>รายการอื่นๆ</span>
      </button>
    </div>
  );
};
