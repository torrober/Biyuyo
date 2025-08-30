import { create } from "zustand";
import { persist } from "zustand/middleware";

// UUID generator
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Types
export type AccountType = "cash" | "bank" | "savings";
export type TxType = "expense" | "income" | "transfer";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  targetAmount?: number; // for savings accounts
}

export interface Category {
  id: string;
  name: string;
  emoji?: string;
  parentId?: string | null;
  budgetMonthly?: number | null;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number; // positive numbers; expenses will reduce balance by sign in calculations
  date: string; // ISO string
  description?: string;
  accountId: string;
  categoryId?: string | null;
  transferId?: string; // if part of a transfer pair
}

export interface Macro {
  id: string;
  name: string;
  emoji?: string;
  amount: number;
  categoryId?: string | null;
  accountId: string;
}

export interface MacroGroup {
  id: string;
  name: string;
  macros: Macro[];
}

export interface Recurring {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  accountId: string;
  categoryId?: string | null;
  paidMonths: string[]; // ["YYYY-MM", ...]
}

export interface Credit {
  id: string;
  name: string;
  total: number;
  paid: number;
  monthlyInstallment: number;
  dueDay: number; // 1-31
  accountId: string; // which account is used to pay
  lastPaidMonth?: string; // "YYYY-MM"
}

// Helpers
const monthKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// Store shape
interface FinanceState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  macroGroups: MacroGroup[];
  recurrings: Recurring[];
  credits: Credit[];

  // Derived helpers
  accountBalance: (accountId: string) => number;
  totalSpendableBalance: () => number; // excludes savings accounts
  monthlyObligationsTotal: () => number; // recurrings + credit installments
  monthlyObligationsRemaining: () => number; // subtract paid in current month
  safeToSpend: () => number;
  expensesByCategory: (month?: string) => { categoryId: string | null; total: number }[];

  // CRUD actions
  addAccount: (a: Omit<Account, "id"> & { id?: string }) => string;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addCategory: (c: Omit<Category, "id"> & { id?: string }) => string;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addTransaction: (t: Omit<Transaction, "id"> & { id?: string }) => string;
  editTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void; // if transferId, remove both parts
  createTransfer: (opts: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date?: string;
    description?: string;
    categoryId?: string | null;
  }) => { debitId: string; creditId: string; transferId: string };

  addMacroGroup: (g: Omit<MacroGroup, "id"> & { id?: string }) => string;
  addMacroToGroup: (groupId: string, m: Omit<Macro, "id"> & { id?: string }) => string;
  deleteMacroFromGroup: (groupId: string, macroId: string) => void;
  deleteMacroGroup: (groupId: string) => void;
  triggerMacro: (macroId: string, groupId: string, overrideAmount?: number) => string | null;

  addRecurring: (r: Omit<Recurring, "id" | "paidMonths"> & { id?: string }) => string;
  updateRecurring: (id: string, patch: Partial<Recurring>) => void;
  deleteRecurring: (id: string) => void;

  addCredit: (c: Omit<Credit, "id" | "paid" | "lastPaidMonth"> & { id?: string; paid?: number; lastPaidMonth?: string }) => string;
  updateCredit: (id: string, patch: Partial<Credit>) => void;
  deleteCredit: (id: string) => void;

  payRecurring: (id: string) => string | null; // creates expense tx and marks paid for current month
  toggleRecurringPaid: (id: string, paid: boolean) => void; // for current month

  payCreditInstallment: (id: string) => string | null; // creates expense and updates credit progress

  // Import / Export
  exportData: () => string;
  importData: (json: string) => void;
  resetAllData: () => void;
}

const defaultAccounts: Account[] = [
  { id: generateId(), name: "Efectivo", type: "cash" },
  { id: generateId(), name: "Banco", type: "bank" },
];

const defaultCategories: Category[] = [
  { id: generateId(), name: "General", emoji: "📦" },
  { id: generateId(), name: "Transporte", emoji: "🚌" },
  { id: generateId(), name: "Comida", emoji: "🍔" },
  { id: generateId(), name: "Suscripciones", emoji: "🧾" },
];

export const useFinance = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: defaultAccounts,
      categories: defaultCategories,
      transactions: [],
      macroGroups: [],
      recurrings: [],
      credits: [],

      accountBalance: (accountId) => {
        const txs = get().transactions.filter((t) => t.accountId === accountId);
        return txs.reduce((sum, t) => {
          if (t.type === "income") return sum + t.amount;
          if (t.type === "expense") return sum - t.amount;
          // transfer entries are represented as income/expense pairs already
          return sum;
        }, 0);
      },

      totalSpendableBalance: () => {
        const { accounts, accountBalance } = get();
        return accounts
          .filter((a) => a.type !== "savings")
          .reduce((sum, a) => sum + accountBalance(a.id), 0);
      },

      monthlyObligationsTotal: () => {
        const { recurrings, credits } = get();
        const rec = recurrings.reduce((s, r) => s + r.amount, 0);
        const cred = credits.reduce((s, c) => s + c.monthlyInstallment, 0);
        return rec + cred;
      },

      monthlyObligationsRemaining: () => {
        const nowKey = monthKey();
        const { recurrings, credits } = get();
        const rec = recurrings
          .filter((r) => !r.paidMonths.includes(nowKey))
          .reduce((s, r) => s + r.amount, 0);
        const cred = credits
          .filter((c) => c.lastPaidMonth !== nowKey)
          .reduce((s, c) => s + c.monthlyInstallment, 0);
        return rec + cred;
      },

      safeToSpend: () => get().totalSpendableBalance() - get().monthlyObligationsRemaining(),

      expensesByCategory: (m?: string) => {
        const month = m ?? monthKey();
        const { transactions } = get();
        const filtered = transactions.filter((t) =>
          t.type === "expense" && t.date.startsWith(month)
        );
        const map = new Map<string | null, number>();
        filtered.forEach((t) => {
          const k = t.categoryId ?? null;
          map.set(k, (map.get(k) ?? 0) + t.amount);
        });
        return Array.from(map.entries()).map(([categoryId, total]) => ({ categoryId, total }));
      },

      addAccount: (a) => {
        const id = a.id ?? generateId();
        set((s) => ({ accounts: [...s.accounts, { ...a, id }] }));
        return id;
      },
      updateAccount: (id, patch) => set((s) => ({
        accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      })),
      deleteAccount: (id) => set((s) => ({
        // also delete transactions for that account
        accounts: s.accounts.filter((a) => a.id !== id),
        transactions: s.transactions.filter((t) => t.accountId !== id),
      })),

      addCategory: (c) => {
        const id = c.id ?? generateId();
        set((s) => ({ categories: [...s.categories, { ...c, id }] }));
        return id;
      },
      updateCategory: (id, patch) => set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),
      deleteCategory: (id) => set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        transactions: s.transactions.map((t) =>
          t.categoryId === id ? { ...t, categoryId: null } : t
        ),
      })),

      addTransaction: (t) => {
        const id = t.id ?? generateId();
        const date = t.date ?? new Date().toISOString();
        set((s) => ({ transactions: [{ ...t, id, date }, ...s.transactions] }));
        return id;
      },
      editTransaction: (id, patch) => set((s) => ({
        transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),
      deleteTransaction: (id) => set((s) => {
        const tx = s.transactions.find((t) => t.id === id);
        if (tx?.transferId) {
          return {
            transactions: s.transactions.filter((t) => t.transferId !== tx.transferId),
          };
        }
        return { transactions: s.transactions.filter((t) => t.id !== id) };
      }),

      createTransfer: ({ fromAccountId, toAccountId, amount, date, description, categoryId }) => {
        const transferId = generateId();
        const when = date ?? new Date().toISOString();
        const debitId = generateId();
        const creditId = generateId();
        set((s) => ({
          transactions: [
            {
              id: debitId,
              type: "expense",
              amount,
              date: when,
              description: description ?? "Transferencia",
              accountId: fromAccountId,
              categoryId: categoryId ?? null,
              transferId,
            },
            {
              id: creditId,
              type: "income",
              amount,
              date: when,
              description: description ?? "Transferencia",
              accountId: toAccountId,
              categoryId: categoryId ?? null,
              transferId,
            },
            ...s.transactions,
          ],
        }));
        return { debitId, creditId, transferId };
      },

      addMacroGroup: (g) => {
        const id = g.id ?? generateId();
        set((s) => ({ macroGroups: [...s.macroGroups, { ...g, id }] }));
        return id;
      },
      addMacroToGroup: (groupId, m) => {
        const id = m.id ?? generateId();
        set((s) => ({
          macroGroups: s.macroGroups.map((g) =>
            g.id === groupId ? { ...g, macros: [...g.macros, { ...m, id }] } : g
          ),
        }));
        return id;
      },
      triggerMacro: (macroId, groupId, overrideAmount) => {
        const s = get();
        const group = s.macroGroups.find((g) => g.id === groupId);
        const macro = group?.macros.find((m) => m.id === macroId);
        if (!macro) return null;
        const amount = overrideAmount ?? macro.amount;
        return get().addTransaction({
          type: "expense",
          amount,
          date: new Date().toISOString(),
          description: macro.name,
          accountId: macro.accountId,
          categoryId: macro.categoryId ?? null,
        });
      },

      deleteMacroFromGroup: (groupId, macroId) => {
        set((s) => ({
          macroGroups: s.macroGroups.map((g) =>
            g.id === groupId ? { ...g, macros: g.macros.filter((m) => m.id !== macroId) } : g
          ),
        }));
      },
      deleteMacroGroup: (groupId) => {
        set((s) => ({ macroGroups: s.macroGroups.filter((g) => g.id !== groupId) }));
      },

      addRecurring: (r) => {
        const id = r.id ?? generateId();
        set((s) => ({ recurrings: [...s.recurrings, { ...r, id, paidMonths: [] }] }));
        return id;
      },
      updateRecurring: (id, patch) => {
        set((s) => ({
          recurrings: s.recurrings.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }));
      },
      deleteRecurring: (id) => {
        set((s) => ({ recurrings: s.recurrings.filter((x) => x.id !== id) }));
      },

      addCredit: (c) => {
        const id = c.id ?? generateId();
        set((s) => ({ credits: [...s.credits, { ...c, id, paid: c.paid ?? 0, lastPaidMonth: c.lastPaidMonth }] }));
        return id;
      },
      updateCredit: (id, patch) => {
        set((s) => ({
          credits: s.credits.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        }));
      },
      deleteCredit: (id) => {
        set((s) => ({ credits: s.credits.filter((x) => x.id !== id) }));
      },

      payRecurring: (id) => {
        const s = get();
        const r = s.recurrings.find((x) => x.id === id);
        if (!r) return null;
        const key = monthKey();
        if (r.paidMonths.includes(key)) return null;
        const txId = s.addTransaction({
          type: "expense",
          amount: r.amount,
          date: new Date().toISOString(),
          description: `Pago recurrente: ${r.name}`,
          accountId: r.accountId,
          categoryId: r.categoryId ?? null,
        });
        set((state) => ({
          recurrings: state.recurrings.map((x) =>
            x.id === id ? { ...x, paidMonths: [...x.paidMonths, key] } : x
          ),
        }));
        return txId;
      },
      toggleRecurringPaid: (id, paid) => {
        const key = monthKey();
        set((s) => ({
          recurrings: s.recurrings.map((r) => {
            if (r.id !== id) return r;
            const has = r.paidMonths.includes(key);
            if (paid && !has) return { ...r, paidMonths: [...r.paidMonths, key] };
            if (!paid && has) return { ...r, paidMonths: r.paidMonths.filter((k) => k !== key) };
            return r;
          }),
        }));
      },

      payCreditInstallment: (id) => {
        const s = get();
        const c = s.credits.find((x) => x.id === id);
        if (!c) return null;
        const key = monthKey();
        if (c.lastPaidMonth === key) return null;
        const txId = s.addTransaction({
          type: "expense",
          amount: c.monthlyInstallment,
          date: new Date().toISOString(),
          description: `Pago crédito: ${c.name}`,
          accountId: c.accountId,
          categoryId: null,
        });
        set((state) => ({
          credits: state.credits.map((x) =>
            x.id === id
              ? {
                  ...x,
                  lastPaidMonth: key,
                  paid: Math.min(x.total, x.paid + x.monthlyInstallment),
                }
              : x
          ),
        }));
        return txId;
      },

      exportData: () => {
        const data = {
          accounts: get().accounts,
          categories: get().categories,
          transactions: get().transactions,
          macroGroups: get().macroGroups,
          recurrings: get().recurrings,
          credits: get().credits,
          version: 1,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
      },
      importData: (json: string) => {
        try {
          const data = JSON.parse(json);
          set(() => ({
            accounts: data.accounts ?? [],
            categories: data.categories ?? [],
            transactions: data.transactions ?? [],
            macroGroups: data.macroGroups ?? [],
            recurrings: data.recurrings ?? [],
            credits: data.credits ?? [],
          }));
        } catch (e) {
          console.error("Import error", e);
        }
      },
      resetAllData: () => {
        set(() => ({
          accounts: defaultAccounts,
          categories: defaultCategories,
          transactions: [],
          macroGroups: [],
          recurrings: [],
          credits: [],
        }));
      },
    }),
    { name: "finance-store" }
  )
);

export const currentMonthKey = monthKey;
