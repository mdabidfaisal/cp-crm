import { create } from 'zustand'
import googleDrive from '../services/googleDrive'
import { useTransactionStore } from './transactionStore'

const FILE_NAME = 'loans.json';

function getLoansFolder() {
  return localStorage.getItem('crm_loans_folder_id');
}

export const useLoanStore = create((set, get) => ({
  loans: [],
  isLoading: false,
  error: null,

  loadLoans: async () => {
    set({ isLoading: true })
    try {
      const folderId = getLoansFolder();
      if (!folderId) { set({ loans: [], isLoading: false }); return }
      const file = await googleDrive.findFile(FILE_NAME, folderId)
      if (file) {
        const data = await googleDrive.loadFile(file.id)
        set({ loans: data.loans || [], isLoading: false })
      } else {
        set({ loans: [], isLoading: false })
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  addLoan: async (loan) => {
    try {
      const folderId = getLoansFolder();
      const { loans } = get()
      const loanId = crypto.randomUUID();

      const txnCategory = loan.type === 'taken' ? 'Loan Taken' : 'Loan Given';
      const txnType = loan.type === 'taken' ? 'income' : 'expense';
      const txnId = await useTransactionStore.getState().addTransaction({
        date: loan.date || new Date().toISOString().slice(0, 10),
        type: txnType,
        category: txnCategory,
        amount: parseFloat(loan.amount) || 0,
        note: `Loan ${loan.type === 'taken' ? 'taken from' : 'given to'} ${loan.personName || 'someone'}${loan.note ? ` — ${loan.note}` : ''}`,
        loanRef: loanId,
      });

      const newLoan = {
        id: loanId,
        ...loan,
        date: loan.date || new Date().toISOString().slice(0, 10),
        status: 'active',
        settlements: [],
        transactionId: txnId,
      }
      const updated = { loans: [...loans, newLoan] }
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ loans: updated.loans })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateLoan: async (id, data) => {
    try {
      const folderId = getLoansFolder();
      const { loans } = get()
      const updated = { loans: loans.map((l) => (l.id === id ? { ...l, ...data } : l)) }
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ loans: updated.loans })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteLoan: async (id) => {
    try {
      const folderId = getLoansFolder();
      const { loans } = get()
      const loan = loans.find((l) => l.id === id);

      if (loan?.transactionId) {
        await useTransactionStore.getState().deleteTransaction(loan.transactionId);
      }
      for (const st of (loan?.settlements || [])) {
        if (st.transactionId) {
          await useTransactionStore.getState().deleteTransaction(st.transactionId);
        }
      }

      const updated = { loans: loans.filter((l) => l.id !== id) }
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ loans: updated.loans })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  addSettlement: async (loanId, settlement) => {
    try {
      const folderId = getLoansFolder();
      const { loans } = get()
      const loan = loans.find((l) => l.id === loanId);

      const txnType = loan?.type === 'given' ? 'income' : 'expense';
      const txnCategory = loan?.type === 'given' ? 'Loan Settlement Received' : 'Loan Settlement Paid';
      const txnNote = loan?.type === 'given'
        ? `Settlement received from ${loan.personName || 'borrower'}${settlement.note ? ` — ${settlement.note}` : ''}`
        : `Settlement paid to ${loan.personName || 'lender'}${settlement.note ? ` — ${settlement.note}` : ''}`;

      const txnId = await useTransactionStore.getState().addTransaction({
        date: settlement.date || new Date().toISOString().slice(0, 10),
        type: txnType,
        category: txnCategory,
        amount: parseFloat(settlement.amount) || 0,
        note: txnNote,
        loanRef: loanId,
      });

      const updated = { loans: loans.map((l) => {
        if (l.id !== loanId) return l;
        const settlements = [...(l.settlements || []), { id: crypto.randomUUID(), ...settlement, transactionId: txnId }];
        const totalSettled = settlements.reduce((s, st) => s + st.amount, 0);
        return { ...l, settlements, status: totalSettled >= l.amount ? 'settled' : 'active' };
      })}
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ loans: updated.loans })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteSettlement: async (loanId, settlementId) => {
    try {
      const folderId = getLoansFolder();
      const { loans } = get()
      const loan = loans.find((l) => l.id === loanId);
      const settlement = loan?.settlements?.find((st) => st.id === settlementId);

      if (settlement?.transactionId) {
        await useTransactionStore.getState().deleteTransaction(settlement.transactionId);
      }

      const updated = { loans: loans.map((l) => {
        if (l.id !== loanId) return l;
        const settlements = (l.settlements || []).filter((st) => st.id !== settlementId);
        const totalSettled = settlements.reduce((s, st) => s + st.amount, 0);
        return { ...l, settlements, status: totalSettled >= l.amount ? 'settled' : 'active' };
      })}
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ loans: updated.loans })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
}))
