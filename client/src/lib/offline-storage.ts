/**
 * Offline Storage Manager using IndexedDB
 * Critical feature for Bangladesh market - all major competitors have offline functionality
 * Implementation inspired by HishabPati's full offline + sync approach
 */

interface OfflineData {
  id: string;
  table: string;
  data: any;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  synced: boolean;
}

interface OfflineDatabase {
  sales: any[];
  customers: any[];
  products: any[];
  expenses: any[];
  collections: any[];
  pendingActions: OfflineData[];
}

class OfflineStorageManager {
  private dbName = 'dokanHisabOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('📱 OFFLINE: IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        const stores = ['sales', 'customers', 'products', 'expenses', 'collections', 'pendingActions'];
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            if (storeName !== 'pendingActions') {
              store.createIndex('user_id', 'user_id', { unique: false });
            }
          }
        });
        
        console.log('📱 OFFLINE: Database schema created');
      };
    });
  }

  // Store data offline
  async store(table: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      
      const request = store.put({
        ...data,
        offline_timestamp: Date.now(),
        offline_synced: false
      });
      
      request.onsuccess = () => {
        console.log(`📱 OFFLINE: Stored ${table} data:`, data.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get data from offline storage
  async get(table: string, userId?: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      
      let request: IDBRequest;
      if (userId) {
        const index = store.index('user_id');
        request = index.getAll(userId);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        const results = request.result || [];
        console.log(`📱 OFFLINE: Retrieved ${results.length} ${table} records`);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Add pending action for sync
  async addPendingAction(table: string, data: any, action: 'create' | 'update' | 'delete'): Promise<void> {
    if (!this.db) await this.init();
    
    const pendingAction: OfflineData = {
      id: `${action}_${table}_${data.id || Date.now()}`,
      table,
      data,
      action,
      timestamp: Date.now(),
      synced: false
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      
      const request = store.put(pendingAction);
      request.onsuccess = () => {
        console.log(`📱 OFFLINE: Added pending action: ${action} ${table}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending actions for sync
  async getPendingActions(): Promise<OfflineData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      
      const request = store.getAll();
      request.onsuccess = () => {
        const pending = request.result.filter(action => !action.synced);
        console.log(`📱 OFFLINE: Found ${pending.length} pending actions`);
        resolve(pending);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Mark action as synced
  async markActionSynced(actionId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      
      const getRequest = store.get(actionId);
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          const putRequest = store.put(action);
          putRequest.onsuccess = () => {
            console.log(`📱 OFFLINE: Marked action ${actionId} as synced`);
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    const stores = ['sales', 'customers', 'products', 'expenses', 'collections', 'pendingActions'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    console.log('📱 OFFLINE: All offline data cleared');
  }

  // Check if device is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get offline statistics
  async getStats(): Promise<{ [key: string]: number }> {
    const stores = ['sales', 'customers', 'products', 'expenses', 'collections'];
    const stats: { [key: string]: number } = {};
    
    for (const store of stores) {
      const data = await this.get(store);
      stats[store] = data.length;
    }
    
    const pending = await this.getPendingActions();
    stats.pendingActions = pending.length;
    
    return stats;
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Initialize offline storage on module load
offlineStorage.init().catch(console.error);

// Network status monitoring
export function setupNetworkMonitoring() {
  window.addEventListener('online', () => {
    console.log('📱 OFFLINE: Network back online - ready to sync');
    // Trigger sync when back online
    // Note: sync-manager will be imported when needed to avoid circular imports
    console.log('📱 OFFLINE: Ready to sync when sync-manager is available');
  });

  window.addEventListener('offline', () => {
    console.log('📱 OFFLINE: Network lost - switching to offline mode');
  });
}