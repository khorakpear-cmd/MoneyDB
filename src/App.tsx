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
import { Transaction, DailySummary, CategoryExpense, AppUserProfile } from './types';
import {
  onAuthStatusChange,
  subscribeToTransactions,
  createTransaction,
  updateExistingTransaction,
  deleteExistingTransaction,
  signInWithGoogle,
  checkRedirectResult,
  logoutUser,
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
import { AuthErrorModal, AuthErrorInfo } from './components/AuthErrorModal';

const GUEST_STORAGE_KEY = 'moneydb_guest_transactions_v1';
const SAVED_PROFILE_KEY = 'moneydb_saved_profile_v1';

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

  const [user, setUser] = useState<User | AppUserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(SAVED_PROFILE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved profile:', e);
    }
    return null;
  });
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [isAuthErrorModalOpen, setIsAuthErrorModalOpen] = useState<boolean>(false);

  // Transactions state with localStorage persistence for guest mode
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('LocalStorage parse error:', e);
    }
    return generateSampleTransactions(currentDate.getFullYear(), currentDate.getMonth() + 1);
  });

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

  // Check redirect sign-in outcome on initial load safely
  useEffect(() => {
    checkRedirectResult()
      .then((resUser) => {
        if (resUser) {
          showToast(`ยินดีต้อนรับ ${resUser.displayName || resUser.email}`);
        }
      })
      .catch((err: any) => {
        console.warn('Redirect sign-in check failed:', err);
      });
  }, []);

  // Save guest or local profile transactions to localStorage
  useEffect(() => {
    if (!user && transactions.length > 0) {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(transactions));
      } catch (e) {
        console.error('LocalStorage save error:', e);
      }
    } else if (user && 'isLocalProfile' in user && user.isLocalProfile && transactions.length > 0) {
      try {
        localStorage.setItem(`moneydb_txs_${user.uid}`, JSON.stringify(transactions));
      } catch (e) {
        console.error('LocalStorage save user error:', e);
      }
    }
  }, [transactions, user]);

  // Handle Google Auth Error
  const handleAuthError = (err: any) => {
    const code = err?.code || 'auth/unknown';
    const message = err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Auth';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      showToast('ยกเลิกการเข้าสู่ระบบ');
      return;
    }

    setAuthErrorInfo({ code, message, hostname });
    setIsAuthErrorModalOpen(true);
  };

  // Google Login Handler
  const handleLogin = async (useRedirect: boolean = false) => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await signInWithGoogle(useRedirect);
      if (loggedUser) {
        setUser(loggedUser);
        localStorage.removeItem(SAVED_PROFILE_KEY);
        showToast(`เข้าสู่ระบบสำเร็จ: ${loggedUser.displayName || loggedUser.email}`);
        setIsAuthErrorModalOpen(false);
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick Sign In for instant access without Firebase Console domain restriction
  const handleQuickSignIn = (email: string, name: string) => {
    const cleanEmail = email.trim() || 'khorakpear@gmail.com';
    const cleanName = name.trim() || cleanEmail.split('@')[0] || 'khorakpear';
    const profile: AppUserProfile = {
      uid: `local_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      displayName: cleanName,
      email: cleanEmail,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      isLocalProfile: true,
    };
    setUser(profile);
    try {
      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(profile));
      const userSavedTxs = localStorage.getItem(`moneydb_txs_${profile.uid}`);
      if (userSavedTxs) {
        const parsed = JSON.parse(userSavedTxs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
        }
      }
    } catch (e) {
      console.error('Error saving local profile:', e);
    }
    setIsAuthErrorModalOpen(false);
    showToast(`เข้าสู่ระบบสำเร็จ: ${cleanName} (${cleanEmail})`);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      localStorage.removeItem(SAVED_PROFILE_KEY);
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsLiveConnected(false);
      showToast('ออกจากระบบเรียบร้อยแล้ว');
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStatusChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem(SAVED_PROFILE_KEY);
      } else {
        // If not logged into Firebase, check if there was a saved local profile
        try {
          const saved = localStorage.getItem(SAVED_PROFILE_KEY);
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to Firestore when user is logged in
  useEffect(() => {
    if (!user) {
      setIsLiveConnected(false);
      return;
    }

    // If local profile, load local transactions
    if ('isLocalProfile' in user && user.isLocalProfile) {
      setIsLiveConnected(false);
      try {
        const userSavedTxs = localStorage.getItem(`moneydb_txs_${user.uid}`);
        if (userSavedTxs) {
          const parsed = JSON.parse(userSavedTxs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
          }
        }
      } catch (e) {
        console.error('Load local txs error:', e);
      }
      return;
    }

    // Real Firebase User
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
    const isLocal = !user || ('isLocalProfile' in user && user.isLocalProfile);

    if (isLocal) {
      const uid = user ? user.uid : 'guest';
      if (editingTx) {
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
      } else {
        const newTx: Transaction = {
          id: 'tx_' + Date.now(),
          userId: uid,
          ...txData,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newTx, ...prev]);
        showToast('บันทึกรายการสำเร็จ');
      }
      setEditingTx(null);
      return;
    }

    // Real Firebase User
    try {
      if (editingTx) {
        await updateExistingTransaction(user.uid, editingTx.id, txData);
        showToast('อัปเดตรายการใน Firebase MoneyDB สำเร็จ');
      } else {
        await createTransaction(user.uid, txData);
        showToast('บันทึกรายการสดลงใน Firebase MoneyDB เรียบร้อย');
      }
    } catch (error) {
      console.warn('Firebase save fallback to local:', error);
      if (editingTx) {
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === editingTx.id
              ? { ...item, ...txData, updatedAt: new Date().toISOString() }
              : item
          )
        );
        showToast('อัปเดตรายการเรียบร้อย (บันทึกในเครื่อง)');
      } else {
        const fallbackTx: Transaction = {
          id: 'local_' + Date.now(),
          userId: user.uid,
          ...txData,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [fallbackTx, ...prev]);
        showToast('บันทึกรายการเรียบร้อย (บันทึกในเครื่อง)');
      }
    }
    setEditingTx(null);
  };

  const handleDeleteTransaction = async (txId: string) => {
    const isLocal = !user || ('isLocalProfile' in user && user.isLocalProfile);

    if (isLocal) {
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
      showToast('ลบรายการเรียบร้อย');
      return;
    }

    try {
      await deleteExistingTransaction(user.uid, txId);
      showToast('ลบรายการออกจาก Firebase MoneyDB แล้ว');
    } catch (err) {
      console.warn('Firebase delete fallback:', err);
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
      showToast('ลบรายการเรียบร้อย (ลบจากเครื่อง)');
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
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Auth / Welcome Banner */}
        <AuthBanner
          user={user}
          loadingAuth={loadingAuth}
          isLoggingIn={isLoggingIn}
          onLogin={handleLogin}
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

      {/* Auth Error Guidance & Diagnosis Modal */}
      <AuthErrorModal
        isOpen={isAuthErrorModalOpen}
        errorInfo={authErrorInfo}
        onClose={() => setIsAuthErrorModalOpen(false)}
        onRetryPopup={() => handleLogin(false)}
        onRetryRedirect={() => handleLogin(true)}
        onQuickSignIn={handleQuickSignIn}
      />

    </div>
  );
}
