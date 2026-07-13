import { useTransactionStore } from '../store/transactionStore';

export function useTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);
  const isLoading = useTransactionStore((s) => s.isLoading);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  return { transactions, isLoading, addTransaction, deleteTransaction };
}
