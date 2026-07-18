import axios from 'axios';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

class GoogleDriveService {
  constructor() {
    this.accessToken = localStorage.getItem('google_access_token');
    this.folderStructure = {
      mainFolderId: localStorage.getItem('crm_main_folder_id'),
      projectsFolderId: localStorage.getItem('crm_projects_folder_id'),
    };
  }

  async findFolder(folderName, parentFolderId = 'root') {
    const query = `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    try {
      const response = await axios.get(
        `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );
      return response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`findFolder error for ${folderName}:`, errMsg);
      return null;
    }
  }

  async initializeFolderStructure() {
    let mainFolderId = this.folderStructure.mainFolderId;
    const folderName = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_NAME;

    if (!mainFolderId) {
      const existing = await this.findFolder(folderName, 'root');
      mainFolderId = existing ? existing.id : await this.createFolder(folderName, 'root');
      localStorage.setItem('crm_main_folder_id', mainFolderId);
      this.folderStructure.mainFolderId = mainFolderId;
    }

    const subFolders = ['Projects', 'Clients', 'Transactions', 'Templates', 'Loans', 'Invoices'];
    for (const name of subFolders) {
      const key = `crm_${name.toLowerCase()}_folder_id`;
      let folderId = localStorage.getItem(key);
      if (!folderId) {
        const existing = await this.findFolder(name, mainFolderId);
        folderId = existing ? existing.id : await this.createFolder(name, mainFolderId);
        localStorage.setItem(key, folderId);
      }
      this.folderStructure[`${name.toLowerCase()}FolderId`] = folderId;
    }

    return this.folderStructure;
  }

  async createFolder(folderName, parentFolderId = 'root') {
    try {
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
    } catch (error) {
      const status = error.response?.status;
      const reason = error.response?.data?.error?.message || error.message;
      console.error(`createFolder failed for "${folderName}": ${status} — ${reason}`);
      throw new Error(`Failed to create folder "${folderName}": ${reason}`);
    }
  }

  async saveFile(filename, data, parentFolderId) {
    if (!parentFolderId) {
      console.error(`saveFile: parentFolderId is missing for ${filename}`);
      throw new Error(`Folder not ready for ${filename}`);
    }
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

    try {
      const createResponse = await axios.post(
        `${DRIVE_API_URL}/files?fields=id`,
        metadata,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return await this.updateFile(createResponse.data.id, jsonContent);
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`saveFile error for ${filename}:`, errMsg);
      throw error;
    }
  }

  async updateFile(fileId, content) {
    try {
      await axios.patch(
        `${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=media`,
        content,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return fileId;
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`updateFile error for ${fileId}:`, errMsg);
      throw error;
    }
  }

  async loadFile(fileId) {
    const response = await axios.get(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return response.data;
  }

  async findFile(filename, folderId) {
    if (!folderId) {
      console.error(`findFile: folderId is missing for ${filename}`);
      return null;
    }
    const folderIdClean = String(folderId).trim();
    const query = `name='${filename}' and '${folderIdClean}' in parents and trashed=false`;
    try {
      const response = await axios.get(
        `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&pageSize=1`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );
      return response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`findFile error for ${filename}:`, errMsg);
      return null;
    }
  }

  async listFiles(folderId) {
    if (!folderId) return [];
    const folderIdClean = String(folderId).trim();
    const query = `'${folderIdClean}' in parents and trashed=false`;
    try {
      const response = await axios.get(
        `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)&pageSize=100`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );
      return response.data.files || [];
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error(`listFiles error for folder ${folderId}:`, errMsg);
      return [];
    }
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
    localStorage.removeItem('crm_loans_folder_id');
    this.accessToken = null;
  }
}

export default new GoogleDriveService();
