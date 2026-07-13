import axios from 'axios';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient = null;

class GoogleDriveService {
  constructor() {
    this.accessToken = localStorage.getItem('google_access_token');
    this.folderStructure = {
      mainFolderId: localStorage.getItem('crm_main_folder_id'),
      projectsFolderId: localStorage.getItem('crm_projects_folder_id'),
    };
  }

  async initTokenClient() {
    if (tokenClient) return;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              this.accessToken = response.access_token;
              localStorage.setItem('google_access_token', response.access_token);

              const userData = this.decodeToken(response.access_token);
              localStorage.setItem('user_email', userData.email || '');
              localStorage.setItem('user_name', userData.name || userData.email || '');
            }
          },
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  }

  requestAccessToken() {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }
      tokenClient.callback = (response) => {
        if (response.access_token) {
          this.accessToken = response.access_token;
          localStorage.setItem('google_access_token', response.access_token);

          const userData = this.decodeToken(response.access_token);
          localStorage.setItem('user_email', userData.email || '');
          localStorage.setItem('user_name', userData.name || userData.email || '');
          resolve(userData);
        } else if (response.error) {
          reject(response);
        }
      };
      tokenClient.requestAccessToken();
    });
  }

  async initializeFolderStructure() {
    try {
      let mainFolderId = this.folderStructure.mainFolderId;

      if (!mainFolderId) {
        mainFolderId = await this.createFolder(
          import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_NAME,
          'root'
        );
        localStorage.setItem('crm_main_folder_id', mainFolderId);
      }

      const projectsFolderId = await this.createFolder('Projects', mainFolderId);
      const clientsFolderId = await this.createFolder('Clients', mainFolderId);
      const transactionsFolderId = await this.createFolder('Transactions', mainFolderId);
      const templatesFolderId = await this.createFolder('Templates', mainFolderId);

      localStorage.setItem('crm_projects_folder_id', projectsFolderId);
      localStorage.setItem('crm_clients_folder_id', clientsFolderId);
      localStorage.setItem('crm_transactions_folder_id', transactionsFolderId);
      localStorage.setItem('crm_templates_folder_id', templatesFolderId);

      this.folderStructure = {
        mainFolderId,
        projectsFolderId,
        clientsFolderId,
        transactionsFolderId,
        templatesFolderId,
      };

      return this.folderStructure;
    } catch (error) {
      console.error('Error initializing folder structure:', error);
      throw error;
    }
  }

  async createFolder(folderName, parentFolderId = 'root') {
    const response = await axios.post(
      `${DRIVE_API_URL}/files?fields=id`,
      {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    return response.data.id;
  }

  async saveFile(filename, data, parentFolderId) {
    const jsonContent = JSON.stringify(data, null, 2);
    const existingFile = await this.findFile(filename, parentFolderId);

    if (existingFile) {
      return await this.updateFile(existingFile.id, jsonContent);
    }

    const metadata = {
      name: filename,
      mimeType: 'application/json',
      parents: [parentFolderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([jsonContent], { type: 'application/json' }));

    const response = await axios.post(
      `${DRIVE_API_URL}/files?uploadType=multipart&fields=id`,
      form,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related',
        },
      }
    );
    return response.data.id;
  }

  async updateFile(fileId, content) {
    await axios.patch(
      `${DRIVE_API_URL}/files/${fileId}?uploadType=media`,
      content,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return fileId;
  }

  async loadFile(fileId) {
    const response = await axios.get(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return response.data;
  }

  async findFile(filename, folderId) {
    const query = `name='${filename}' and '${folderId}' in parents and trashed=false`;
    const response = await axios.get(
      `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=id,name,modifiedTime&pageSize=1`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    return response.data.files.length > 0 ? response.data.files[0] : null;
  }

  async listFiles(folderId) {
    const query = `'${folderId}' in parents and trashed=false`;
    const response = await axios.get(
      `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=id,name,mimeType,modifiedTime&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    return response.data.files || [];
  }

  async deleteFile(fileId) {
    await axios.delete(`${DRIVE_API_URL}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  logout() {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('crm_main_folder_id');
    localStorage.removeItem('crm_projects_folder_id');
    localStorage.removeItem('crm_clients_folder_id');
    localStorage.removeItem('crm_transactions_folder_id');
    localStorage.removeItem('crm_templates_folder_id');
    this.accessToken = null;
  }
}

export default new GoogleDriveService();
