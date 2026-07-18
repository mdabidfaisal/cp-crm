import { useClientStore } from '../store/clientStore';

export function useClients() {
  const clients = useClientStore((s) => s.clients);
  const isLoading = useClientStore((s) => s.isLoading);
  const loadClients = useClientStore((s) => s.loadClients);
  const addClient = useClientStore((s) => s.addClient);
  const updateClient = useClientStore((s) => s.updateClient);
  const deleteClient = useClientStore((s) => s.deleteClient);

  return { clients, isLoading, loadClients, addClient, updateClient, deleteClient };
}
