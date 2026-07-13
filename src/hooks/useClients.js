import { useState, useEffect } from 'react';
import googleDrive from '../services/googleDrive';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const clientsFolder = localStorage.getItem('crm_clients_folder_id');
      if (!clientsFolder) {
        setClients([]);
        return;
      }
      const file = await googleDrive.findFile('clients.json', clientsFolder);
      if (file) {
        const data = await googleDrive.loadFile(file.id);
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async (client) => {
    const updated = [...clients, { id: crypto.randomUUID(), ...client }];
    setClients(updated);
    try {
      const clientsFolder = localStorage.getItem('crm_clients_folder_id');
      await googleDrive.saveFile('clients.json', { clients: updated }, clientsFolder);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const updateClient = async (id, data) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, ...data } : c));
    setClients(updated);
    try {
      const clientsFolder = localStorage.getItem('crm_clients_folder_id');
      await googleDrive.saveFile('clients.json', { clients: updated }, clientsFolder);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    try {
      const clientsFolder = localStorage.getItem('crm_clients_folder_id');
      await googleDrive.saveFile('clients.json', { clients: updated }, clientsFolder);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return { clients, isLoading, addClient, updateClient, deleteClient };
}
