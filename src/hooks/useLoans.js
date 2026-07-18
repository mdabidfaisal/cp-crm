import { useLoanStore } from '../store/loanStore';

export function useLoans() {
  const loans = useLoanStore((s) => s.loans);
  const isLoading = useLoanStore((s) => s.isLoading);
  const addLoan = useLoanStore((s) => s.addLoan);
  const updateLoan = useLoanStore((s) => s.updateLoan);
  const deleteLoan = useLoanStore((s) => s.deleteLoan);
  const addSettlement = useLoanStore((s) => s.addSettlement);
  const deleteSettlement = useLoanStore((s) => s.deleteSettlement);

  return { loans, isLoading, addLoan, updateLoan, deleteLoan, addSettlement, deleteSettlement };
}
