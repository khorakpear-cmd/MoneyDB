import React from 'react';
import { TrendingUp, TrendingDown, WalletCards, PiggyBank, CalendarDays } from 'lucide-react';
import { formatCurrency } from '../lib/constants';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  avgDailyExpense: number;
  transactionCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  savingsRate,
  avgDailyExpense,
  transactionCount,
}) => {
  const isPositiveBalance = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. รายรับรวม */}
      <div id="card-total-income" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับรวม
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
            +{formatCurrency(totalIncome)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            เงินเข้ากระเป๋าในเดือนนี้
          </p>
        </div>
      </div>

      {/* 2. รายจ่ายรวม */}
      <div id="card-total-expense" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายรวม
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-600 font-mono tracking-tight">
            -{formatCurrency(totalExpense)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {totalIncome > 0
              ? `คิดเป็น ${Math.min(100, Math.round((totalExpense / totalIncome) * 100))}% ของรายรับ`
              : 'ยอดใช้จ่ายทั้งหมดในเดือนนี้'}
          </p>
        </div>
      </div>

      {/* 3. ยอดคงเหลือสุทธิ */}
      <div id="card-net-balance" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ยอดคงเหลือสุทธิ
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isPositiveBalance ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <WalletCards className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-bold font-mono tracking-tight ${
            isPositiveBalance ? 'text-slate-900' : 'text-amber-600'
          }`}>
            {formatCurrency(netBalance)}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isPositiveBalance ? 'สถานะการเงินเป็นบวก' : 'รายจ่ายมากกว่ารายรับ'}
          </p>
        </div>
      </div>

      {/* 4. อัตราการออม หรือ เฉลี่ยต่อวัน */}
      <div id="card-savings-rate" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            อัตราการออมเงิน
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-indigo-600 font-mono tracking-tight">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>เฉลี่ย ~{formatCurrency(avgDailyExpense)}/วัน</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
          />
        </div>
      </div>

    </div>
  );
};
