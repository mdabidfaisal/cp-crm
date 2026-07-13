import axios from 'axios';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';

class GoogleDriveService {
  constructor() {
    this.accessToken = localStorage.getItem('google_access_token');
    this.folderStructure = {
      mainFolderId: localStorage.getItem('crm_main_folder_id'),
      projectsFolderId: localStorage.getItem('crm_projects_folder_id'),
    };
  }

  async initializeFolderStructure() {
    try {
      let mainFolderId = this.folderStructure.mainFolderId;

      if (mainFolderId) {
        const exists = await this.verifyFolder(mainFolderId);
        if (!exists) {
          localStorage.removeItem('crm_main_folder_id');
          mainFolderId = null;
        }
      }

      if (!mainFolderId) {
        mainFolderId = await this.createFolder(
          import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_NAME,
          'root'
        );
        localStorage.setItem('crm_main_folder_id', mainFolderId);
        this.folderStructure.mainFolderId = mainFolderId;
      }

      const subFolders = ['Projects', 'Clients', 'Transactions', 'Templates'];
      for (const name of subFolders) {
        const key = `crm_${name.toLowerCase()}_folder_id`;
        let folderId = localStorage.getItem(key);

        if (folderId) {
          const exists = await this.verifyFolder(folderId);
          if (!exists) {
            localStorage.removeItem(key);
            folderId = null;
          }
        }

        if (!folderId) {
          folderId = await this.createFolder(name, mainFolderId);
          localStorage.setItem(key, folderId);
        }
        this.folderStructure[`${name.toLowerCase()}FolderId`] = folderId;
      }

      return this.folderStructure;
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error('Error initializing folder structure:', errMsg);
      throw error;
    }
  }

  async verifyFolder(folderId) {
    try {
      await axios.get(`${DRIVE_API_URL}/files/${folderId}?fields=id,mimeType`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      return true;
    } catch {
      return false;
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

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([jsonContent], { type: 'application/json' }));

    try {
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
    } catch (error) {
      console.error(`saveFile error for ${filename}:`, error.response?.data || error.message);
      throw error;
    }
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
    if (!folderId) {
      console.error(`findFile: folderId is missing for ${filename}`);
      return null;
    }
    const folderIdClean = String(folderId).trim();
    const query = `name='${filename}' and '${folderIdClean}' in parents and trashed=false`;
    try {
      const response = await axios.get(
        `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=id,name,modifiedTime&pageSize=1`,
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
        `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=id,name,mimeType,modifiedTime&pageSize=100`,
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
    this.accessToken = null;
  }
}

export default new GoogleDriveService();
