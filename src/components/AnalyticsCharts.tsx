import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, CreditCard } from 'lucide-react';
import { DailySummary, CategoryExpense, Transaction } from '../types';
import { formatCurrency, PAYMENT_METHODS } from '../lib/constants';

interface AnalyticsChartsProps {
  dailyData: DailySummary[];
  categoryExpenses: CategoryExpense[];
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  dailyData,
  categoryExpenses,
  transactions,
  totalIncome,
  totalExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'category' | 'payment'>('daily');

  // Calculate payment method breakdown
  const paymentData = React.useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {
      cash: { income: 0, expense: 0 },
      transfer: { income: 0, expense: 0 },
      credit_card: { income: 0, expense: 0 },
      promptpay: { income: 0, expense: 0 },
    };

    transactions.forEach((tx) => {
      const pm = tx.paymentMethod || 'cash';
      if (!map[pm]) map[pm] = { income: 0, expense: 0 };
      if (tx.type === 'income') {
        map[pm].income += tx.amount;
      } else {
        map[pm].expense += tx.amount;
      }
    });

    return PAYMENT_METHODS.map((method) => ({
      name: method.label,
      income: map[method.id]?.income || 0,
      expense: map[method.id]?.expense || 0,
    }));
  }, [transactions]);

  const hasData = transactions.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
      
      {/* Chart Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>กราฟวิเคราะห์ข้อมูลการเงิน</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เห็นภาพรวมกระแสเงินสด หมวดหมู่รายจ่าย และช่องทางชำระเงิน
          </p>
        </div>

        {/* Chart View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            id="tab-chart-daily"
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แนวโน้มรายวัน</span>
          </button>
          
          <button
            id="tab-chart-category"
            type="button"
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนรายจ่าย</span>
          </button>

          <button
            id="tab-chart-payment"
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>ช่องทางเงิน</span>
          </button>
        </div>
      </div>

      {/* Chart Body */}
      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
          <BarChart3 className="w-10 h-10 text-slate-300 stroke-[1.5] mb-2" />
          <p>ยังไม่มีรายการในเดือนนี้</p>
          <p className="text-xs text-slate-400 mt-1">
            เพิ่มรายการรายรับหรือรายจ่ายเพื่อดูการวิเคราะห์กราฟ
          </p>
        </div>
      ) : (
        <div className="pt-4">
          
          {/* TAB 1: Daily Cashflow Trend */}
          {activeTab === 'daily' && (
            <div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="dayNumber"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val) => `วันที่ ${val}`}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                              <p className="font-semibold text-slate-800 mb-1.5">วันที่ {label}</p>
                              <div className="space-y-1">
                                <p className="text-emerald-600 font-medium flex justify-between gap-4">
                                  <span>รายรับ:</span>
                                  <span className="font-mono">+{formatCurrency(Number(payload[0]?.value) || 0)}</span>
                                </p>
                                <p className="text-rose-500 font-medium flex justify-between gap-4">
                                  <span>รายจ่าย:</span>
                                  <span className="font-mono">-{formatCurrency(Number(payload[1]?.value) || 0)}</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="รายรับ"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#incomeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="รายจ่าย"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expenseGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  รายรับ (Income)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                  รายจ่าย (Expense)
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Expense by Category Breakdown */}
          {activeTab === 'category' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 h-64 w-full">
                {categoryExpenses.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    ไม่มีรายการรายจ่ายในเดือนนี้
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryExpenses}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {categoryExpenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CategoryExpense;
                            return (
                              <div className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 text-xs">
                                <p className="font-semibold text-slate-800">{data.name}</p>
                                <p className="text-slate-600 font-mono mt-0.5">
                                  {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {data.count} รายการ
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category Legend list */}
              <div className="md:col-span-6 space-y-2 max-h-64 overflow-y-auto pr-1">
                {categoryExpenses.length === 0 ? (
                  <p className="text-xs text-slate-400">ยังไม่มีข้อมูลรายจ่าย</p>
                ) : (
                  categoryExpenses.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-md shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-slate-800 truncate max-w-[130px] sm:max-w-[170px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold font-mono text-slate-900 block">
                          {formatCurrency(cat.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cat.percentage.toFixed(1)}% ({cat.count} ครั้ง)
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Payment Method Distribution */}
          {activeTab === 'payment' && (
            <div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                              <p className="font-semibold text-slate-800 mb-1">{label}</p>
                              <p className="text-emerald-600 font-mono">
                                รายรับ: +{formatCurrency(Number(payload[0]?.value) || 0)}
                              </p>
                              <p className="text-rose-500 font-mono">
                                รายจ่าย: -{formatCurrency(Number(payload[1]?.value) || 0)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
                  รายรับ (Income)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block"></span>
                  รายจ่าย (Expense)
                </span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
