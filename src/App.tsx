import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  Plus,
  TrendingUp,
  BarChart3,
  ListOrdered,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Transaction, DailySummary, CategoryExpense } from './types';
import {
  onAuthStatusChange,
  subscribeToTransactions,
  createTransaction,
  updateExistingTransaction,
  deleteExistingTransaction,
} from './lib/firebase';
import { EXPENSE_CATEGORIES, THAI_MONTHS } from './lib/constants';
import { Navbar } from './components/Navbar';
import { AuthBanner } from './components/AuthBanner';
import { MonthlySelector } from './components/MonthlySelector';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { QuickAddBar } from './components/QuickAddBar';

// Realistic sample transactions for guest preview mode
const generateSampleTransactions = (year: number, month: number): Transaction[] => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const m = pad(month);

  return [
    {
      id: 'demo_1',
      userId: 'guest',
      type: 'income',
      amount: 45000,
      category: 'เงินเดือนประจำ',
      description: 'เงินเดือนบริษัท',
      date: `${year}-${m}-01`,
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_2',
      userId: 'guest',
      type: 'expense',
      amount: 8500,
      category: 'ค่าบ้าน / หอพัก / บิล',
      description: 'ค่าเช่าคอนโด + อินเทอร์เน็ต',
      date: `${year}-${m}-02`,
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_3',
      userId: 'guest',
      type: 'expense',
      amount: 140,
      category: 'อาหารและเครื่องดื่ม',
      description: 'กาแฟอเมซอน + ครัวซองต์',
      date: `${year}-${m}-03`,
      paymentMethod: 'promptpay',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_4',
      userId: 'guest',
      type: 'expense',
      amount: 120,
      category: 'เดินทาง / น้ำมัน',
      description: 'รถไฟฟ้า BTS ไป-กลับ',
      date: `${year}-${m}-04`,
      paymentMethod: 'promptpay',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_5',
      userId: 'guest',
      type: 'income',
      amount: 6000,
      category: 'ฟรีแลนซ์ / งานเสริม',
      description: 'รับจ้างออกแบบกราฟิก',
      date: `${year}-${m}-05`,
      paymentMethod: 'transfer',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_6',
      userId: 'guest',
      type: 'expense',
      amount: 1850,
      category: 'ช้อปปิ้ง / ของใช้',
      description: 'ซื้อของเข้าห้อง Tops Supermarket',
      date: `${year}-${m}-06`,
      paymentMethod: 'credit_card',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_7',
      userId: 'guest',
      type: 'expense',
      amount: 450,
      category: 'บันเทิง / ท่องเที่ยว',
      description: 'ตั๋วชมภาพยนตร์ + ป๊อปคอร์น',
      date: `${year}-${m}-07`,
      paymentMethod: 'credit_card',
      createdAt: new Date().toISOString(),
    },
  ];
};

export default function App() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    generateSampleTransactions(currentDate.getFullYear(), currentDate.getMonth() + 1)
  );

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active view section for mobile tab switches
  const [activeMobileView, setActiveMobileView] = useState<'all' | 'charts' | 'history'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStatusChange((currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (!currentUser) {
        setIsLiveConnected(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to Firestore when user is logged in
  useEffect(() => {
    if (!user) {
      return;
    }

    setIsLiveConnected(true);
    const unsubscribeSnapshot = subscribeToTransactions(
      user.uid,
      (userTxs) => {
        setTransactions(userTxs);
        setIsLiveConnected(true);
      },
      (error) => {
        console.error('Firebase snapshot listener error:', error);
        setIsLiveConnected(false);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user]);

  // Filter transactions belonging to the currently selected month
  const monthlyTransactions = useMemo(() => {
    const padMonth = selectedMonth.toString().padStart(2, '0');
    const monthPrefix = `${selectedYear}-${padMonth}`;
    return transactions.filter((tx) => tx.date && tx.date.startsWith(monthPrefix));
  }, [transactions, selectedYear, selectedMonth]);

  // Compute summary metrics for the selected month
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    monthlyTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    // Number of days elapsed in month or total days
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const avgDailyExpense = totalExpense > 0 ? Math.round(totalExpense / daysInMonth) : 0;

    return {
      year: selectedYear,
      month: selectedMonth,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      avgDailyExpense,
      transactionCount: monthlyTransactions.length,
    };
  }, [monthlyTransactions, selectedYear, selectedMonth]);

  // Daily summary calculation for charts
  const dailyData: DailySummary[] = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysMap: Record<number, { income: number; expense: number }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      daysMap[d] = { income: 0, expense: 0 };
    }

    monthlyTransactions.forEach((tx) => {
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        if (daysMap[day]) {
          if (tx.type === 'income') {
            daysMap[day].income += tx.amount;
          } else {
            daysMap[day].expense += tx.amount;
          }
        }
      }
    });

    return Object.entries(daysMap).map(([dayStr, data]) => {
      const d = parseInt(dayStr, 10);
      return {
        date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        dayNumber: d,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      };
    });
  }, [monthlyTransactions, selectedYear, selectedMonth]);

  // Category expense breakdown calculation
  const categoryExpenses: CategoryExpense[] = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    let totalExp = 0;

    monthlyTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        totalExp += tx.amount;
        if (!map[tx.category]) {
          map[tx.category] = { amount: 0, count: 0 };
        }
        map[tx.category].amount += tx.amount;
        map[tx.category].count += 1;
      }
    });

    const categoryColorMap = new Map(EXPENSE_CATEGORIES.map((c) => [c.name, c.color]));

    return Object.entries(map)
      .map(([name, val]) => ({
        name,
        amount: val.amount,
        count: val.count,
        percentage: totalExp > 0 ? (val.amount / totalExp) * 100 : 0,
        color: categoryColorMap.get(name) || '#64748b',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions]);

  // CRUD Actions
  const handleSaveTransaction = async (
    txData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTx) {
      if (user) {
        await updateExistingTransaction(user.uid, editingTx.id, txData);
        showToast('อัปเดตรายการใน Firebase MoneyDB สำเร็จ');
      } else {
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === editingTx.id
              ? {
                  ...item,
                  ...txData,
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        showToast('อัปเดตรายการเรียบร้อย');
      }
    } else {
      if (user) {
        await createTransaction(user.uid, txData);
        showToast('บันทึกรายการสดลงใน Firebase MoneyDB เรียบร้อย');
      } else {
        const newDemoTx: Transaction = {
          id: 'demo_' + Date.now(),
          userId: 'guest',
          ...txData,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newDemoTx, ...prev]);
        showToast('บันทึกรายการสำเร็จ (โหมดจำลอง)');
      }
    }
    setEditingTx(null);
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (user) {
      try {
        await deleteExistingTransaction(user.uid, txId);
        showToast('ลบรายการออกจาก Firebase MoneyDB แล้ว');
      } catch (err) {
        console.error('Delete error:', err);
        showToast('เกิดข้อผิดพลาดในการลบรายการ');
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
      showToast('ลบรายการเรียบร้อย');
    }
  };

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const monthName = `${THAI_MONTHS[selectedMonth - 1]} ${selectedYear + 543}`;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-5 border border-slate-700/60">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        isLiveConnected={isLiveConnected}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Auth / Welcome Banner */}
        <AuthBanner
          user={user}
          loadingAuth={loadingAuth}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Quick Add Bar for Fast Entry */}
        <QuickAddBar
          onQuickAdd={handleSaveTransaction}
          onOpenModal={handleOpenAddModal}
        />

        {/* Month Selector & Controls */}
        <MonthlySelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onChangeMonth={(y, m) => {
            setSelectedYear(y);
            setSelectedMonth(m);
          }}
          transactionCount={monthlyTransactions.length}
        />

        {/* 4 Summary Metric Cards */}
        <SummaryCards
          totalIncome={summary.totalIncome}
          totalExpense={summary.totalExpense}
          netBalance={summary.netBalance}
          savingsRate={summary.savingsRate}
          avgDailyExpense={summary.avgDailyExpense}
          transactionCount={summary.transactionCount}
        />

        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center justify-center p-1 bg-slate-200/80 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMobileView('all')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeMobileView === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            แสดงทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('charts')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeMobileView === 'charts' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            กราฟวิเคราะห์
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileView('history')}
            className={`flex-1 py-2 rounded-xl transition ${
              activeMobileView === 'history' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            ประวัติรายการ
          </button>
        </div>

        {/* Analytics & Transactions Section */}
        <div className="space-y-6">
          
          {/* Charts Section */}
          <div className={`${activeMobileView === 'history' ? 'hidden md:block' : 'block'}`}>
            <AnalyticsCharts
              dailyData={dailyData}
              categoryExpenses={categoryExpenses}
              transactions={monthlyTransactions}
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
            />
          </div>

          {/* Transactions List Section */}
          <div className={`${activeMobileView === 'charts' ? 'hidden md:block' : 'block'}`}>
            <TransactionList
              transactions={monthlyTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onOpenAddModal={handleOpenAddModal}
              selectedMonthName={monthName}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/pvclogo.png"
              alt="วิทยาลัยอาชีวศึกษาแพร่"
              className="w-5 h-5 object-contain rounded-full bg-white p-0.5 border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <span className="font-semibold text-slate-700">MoneyDB</span>
            <span>•</span>
            <span>ระบบจัดการรายรับ-รายจ่าย เชื่อมต่อสด Firebase Cloud Firestore</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>ฐานข้อมูล: MoneyDB</span>
            <span>•</span>
            <span>ระบบยืนยันตัวตน Google Gmail</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTx={editingTx}
      />

    </div>
  );
}
