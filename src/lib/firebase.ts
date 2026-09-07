import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DB_NAME = firebaseConfig.firestoreDatabaseId;

// Test connection on startup per Firebase integration requirements
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection test successful');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Ensure testConnection is invoked
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign In
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return await signInWithPopup(auth, provider);
}

// Sign Out
export async function logoutUser() {
  return await signOut(auth);
}

// Auth State Listener
export function onAuthStatusChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Helper: Get transaction collection path
export function getTransactionsPath(userId: string) {
  return `users/${userId}/transactions`;
}

// Live real-time listener for user transactions
export function subscribeToTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (err: unknown) => void
) {
  const path = getTransactionsPath(userId);
  const q = query(collection(db, path), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || userId,
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category || 'อื่นๆ',
          description: data.description || '',
          date: data.date,
          paymentMethod: data.paymentMethod || 'cash',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        });
      });
      onData(items);
    },
    (error) => {
      console.error('Snapshot error for transactions:', error);
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create transaction
export async function createTransaction(
  userId: string,
  tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const txId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const path = `${getTransactionsPath(userId)}/${txId}`;

  const now = new Date().toISOString();
  const payload = {
    userId,
    type: tx.type,
    amount: Math.round(Number(tx.amount) * 100) / 100,
    category: tx.category.trim().slice(0, 64),
    description: (tx.description || '').trim().slice(0, 255),
    date: tx.date,
    paymentMethod: tx.paymentMethod || 'cash',
    createdAt: now,
  };

  try {
    await setDoc(doc(db, getTransactionsPath(userId), txId), payload);
    return txId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Update transaction
export async function updateExistingTransaction(
  userId: string,
  txId: string,
  tx: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const path = `${getTransactionsPath(userId)}/${txId}`;
  const now = new Date().toISOString();

  const payload: Record<string, any> = {
    updatedAt: now,
  };

  if (tx.type !== undefined) payload.type = tx.type;
  if (tx.amount !== undefined) payload.amount = Math.round(Number(tx.amount) * 100) / 100;
  if (tx.category !== undefined) payload.category = tx.category.trim().slice(0, 64);
  if (tx.description !== undefined) payload.description = (tx.description || '').trim().slice(0, 255);
  if (tx.date !== undefined) payload.date = tx.date;
  if (tx.paymentMethod !== undefined) payload.paymentMethod = tx.paymentMethod;

  try {
    await updateDoc(doc(db, getTransactionsPath(userId), txId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete transaction
export async function deleteExistingTransaction(userId: string, txId: string): Promise<void> {
  const path = `${getTransactionsPath(userId)}/${txId}`;
  try {
    await deleteDoc(doc(db, getTransactionsPath(userId), txId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
