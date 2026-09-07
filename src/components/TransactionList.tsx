import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Download,
  ReceiptText,
  Smartphone,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Smile,
  MoreHorizontal,
  Briefcase,
  Gift,
  Store,
  Laptop,
  TrendingUp,
  HeartHandshake,
  Coins
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatThaiDate, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/constants';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (txId: string) => void;
  onOpenAddModal: () => void;
  selectedMonthName: string;
}

const CategoryIconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  HeartPulse: <HeartPulse className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Smile: <Smile className="w-4 h-4" />,
  MoreHorizontal: <MoreHorizontal className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Gift: <Gift className="w-4 h-4" />,
  Store: <Store className="w-4 h-4" />,
  Laptop: <Laptop className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4" />,
  Coins: <Coins className="w-4 h-4" />,
};

const PaymentIconMap: Record<string, { label: string; icon: React.ReactNode }> = {
  cash: { label: 'เงินสด', icon: <Banknote className="w-3 h-3" /> },
  transfer: { label: 'โอนเงิน', icon: <Smartphone className="w-3 h-3" /> },
  credit_card: { label: 'บัตรเครดิต', icon: <CreditCard className="w-3 h-3" /> },
  promptpay: { label: 'พร้อมเพย์', icon: <QrCode className="w-3 h-3" /> },
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
  selectedMonthName,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCat = tx.category.toLowerCase().includes(query);
        const matchDesc = (tx.description || '').toLowerCase().includes(query);
        const matchAmount = tx.amount.toString().includes(query);
        return matchCat || matchDesc || matchAmount;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // All distinct categories present in data
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => set.add(tx.category));
    return Array.from(set);
  }, [transactions]);

  // Find category color & icon
  const getCategoryMeta = (catName: string, txType: TransactionType) => {
    const list = txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const found = list.find((c) => c.name === catName);
    if (found) {
      return {
        color: found.color,
        icon: CategoryIconMap[found.icon] || <ReceiptText className="w-4 h-4" />,
      };
    }
    return {
      color: txType === 'income' ? '#10b981' : '#f43f5e',
      icon: <ReceiptText className="w-4 h-4" />,
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน(บาท)', 'ช่องทางชำระเงิน'];
    const rows = filteredList.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${tx.category.replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.amount,
      PaymentIconMap[tx.paymentMethod]?.label || tx.paymentMethod,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoneyDB_Report_${selectedMonthName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = (txId: string) => {
    onDelete(txId);
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-blue-600" />
              <span>ประวัติรายการประจำเดือน</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดง {filteredList.length} จากทั้งหมด {transactions.length} รายการ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export CSV Button */}
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={filteredList.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-40"
              title="ส่งออกรายงานเป็น CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="input-search-tx"
              type="text"
              placeholder="ค้นหาตามหมวดหมู่, โน้ตย่อ, หรือยอดเงิน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="sm:col-span-3 flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              id="filter-type-all"
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1 rounded-lg transition font-medium cursor-pointer ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              id="filter-type-expense"
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 py-1 rounded-lg transition font-medium cursor-pointer ${
                typeFilter === 'expense' ? 'bg-white text-rose-600 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="filter-type-income"
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`flex-1 py-1 rounded-lg transition font-medium cursor-pointer ${
                typeFilter === 'income' ? 'bg-white text-sky-600 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              id="select-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกหมวดหมู่ ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Transactions List Content */}
      <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
        {filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ReceiptText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">ไม่มีรายการที่ตรงกับเงื่อนไข</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              ลองเปลี่ยนคำค้นหา หรือบันทึกรายการรายรับ-รายจ่ายใหม่ลงใน MoneyDB
            </p>
            <button
              id="btn-empty-add-tx"
              type="button"
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition cursor-pointer"
            >
              + บันทึกรายการใหม่
            </button>
          </div>
        ) : (
          filteredList.map((tx) => {
            const isExpense = tx.type === 'expense';
            const meta = getCategoryMeta(tx.category, tx.type);
            const pmMeta = PaymentIconMap[tx.paymentMethod] || {
              label: tx.paymentMethod,
              icon: <CreditCard className="w-3 h-3" />,
            };

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-3 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {tx.category}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {pmMeta.icon}
                        <span>{pmMeta.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatThaiDate(tx.date)}</span>
                      {tx.description && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-[280px]">
                            {tx.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-base font-bold font-mono tracking-tight flex items-center justify-end gap-1 ${
                        isExpense ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? (
                        <>
                          <ArrowDownLeft className="w-3.5 h-3.5 inline" />
                          <span>-{formatCurrency(tx.amount)}</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5 inline" />
                          <span>+{formatCurrency(tx.amount)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      id={`btn-edit-${tx.id}`}
                      type="button"
                      onClick={() => onEdit(tx)}
                      title="แก้ไข"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {deletingId === tx.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                        <button
                          id={`btn-confirm-delete-${tx.id}`}
                          type="button"
                          onClick={() => confirmDelete(tx.id)}
                          className="px-2 py-0.5 text-[11px] bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 cursor-pointer"
                        >
                          ลบ
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-delete-${tx.id}`}
                        type="button"
                        onClick={() => setDeletingId(tx.id)}
                        title="ลบรายการ"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
