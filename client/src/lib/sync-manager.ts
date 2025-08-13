/**
 * Data Synchronization Manager
 * Syncs offline data with Supabase when connection is restored
 * Inspired by HishabPati's offline sync approach
 */

import { offlineStorage } from './offline-storage';
import { supabaseService } from './supabase';

interface SyncStatus {
  issyncing: boolean;
  lastSyncTime: number | null;
  pendingCount: number;
  failedActions: string[];
}

class SyncManager {
  private syncStatus: SyncStatus = {
    issyncing: false,
    lastSyncTime: null,
    pendingCount: 0,
    failedActions: []
  };

  private syncInProgress = false;

  // Perform full sync of pending actions
  async performSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      console.log('📱 SYNC: Sync already in progress or offline');
      return;
    }

    this.syncInProgress = true;
    this.syncStatus.issyncing = true;
    
    try {
      console.log('📱 SYNC: Starting synchronization...');
      
      const pendingActions = await offlineStorage.getPendingActions();
      this.syncStatus.pendingCount = pendingActions.length;
      
      if (pendingActions.length === 0) {
        console.log('📱 SYNC: No pending actions to sync');
        this.completSync();
        return;
      }

      console.log(`📱 SYNC: Syncing ${pendingActions.length} pending actions`);
      
      // Process actions in order
      for (const action of pendingActions) {
        try {
          await this.syncSingleAction(action);
          await offlineStorage.markActionSynced(action.id);
          console.log(`📱 SYNC: Successfully synced action ${action.id}`);
        } catch (error) {
          console.error(`📱 SYNC: Failed to sync action ${action.id}:`, error);
          this.syncStatus.failedActions.push(action.id);
        }
      }

      this.completSync();
      console.log('📱 SYNC: Synchronization completed');
      
    } catch (error) {
      console.error('📱 SYNC: Sync process failed:', error);
      this.syncStatus.issyncing = false;
      this.syncInProgress = false;
    }
  }

  // Sync a single action
  private async syncSingleAction(action: any): Promise<void> {
    const { table, data, action: actionType } = action;
    
    switch (actionType) {
      case 'create':
        await this.syncCreateAction(table, data);
        break;
      case 'update':
        await this.syncUpdateAction(table, data);
        break;
      case 'delete':
        await this.syncDeleteAction(table, data);
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }
  }

  // Sync create actions
  private async syncCreateAction(table: string, data: any): Promise<void> {
    switch (table) {
      case 'customers':
        await supabaseService.createCustomer(userId, data);
        break;
      case 'products':
        await supabaseService.createProduct(userId, data);
        break;
      case 'sales':
        await supabaseService.createSale(userId, data);
        break;
      case 'expenses':
        await supabaseService.createExpense(userId, data);
        break;
      case 'collections':
        await supabaseService.createCollection(userId, data);
        break;
      default:
        throw new Error(`Unknown table for create: ${table}`);
    }
  }

  // Sync update actions
  private async syncUpdateAction(table: string, data: any): Promise<void> {
    switch (table) {
      case 'customers':
        await supabaseService.updateCustomer(data.id, data);
        break;
      case 'products':
        // Add product update method to supabase service if needed
        console.log(`📱 SYNC: Update for ${table} not implemented yet`);
        break;
      default:
        console.log(`📱 SYNC: Update for ${table} not implemented`);
    }
  }

  // Sync delete actions
  private async syncDeleteAction(table: string, data: any): Promise<void> {
    switch (table) {
      case 'customers':
        await supabaseService.deleteCustomer(data.id);
        break;
      default:
        console.log(`📱 SYNC: Delete for ${table} not implemented`);
    }
  }

  // Complete sync process
  private completSync(): void {
    this.syncStatus.issyncing = false;
    this.syncStatus.lastSyncTime = Date.now();
    this.syncInProgress = false;
    
    // Clear query cache to force fresh data fetch
    if (typeof window !== 'undefined' && (window as any).queryClient) {
      (window as any).queryClient.invalidateQueries();
    }
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Auto-sync when online
  setupAutoSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.performSync();
      }
    }, 5 * 60 * 1000);

    // Sync immediately when coming back online
    window.addEventListener('online', () => {
      setTimeout(() => this.performSync(), 1000);
    });
  }

  // Force sync (for user-triggered sync)
  async forceSync(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }
    
    await this.performSync();
  }

  // Sync specific table data from server
  async syncFromServer(table: string): Promise<void> {
    if (!navigator.onLine) {
      console.log('📱 SYNC: Cannot sync from server while offline');
      return;
    }

    try {
      let serverData: any[] = [];
      
      switch (table) {
        case 'customers':
          serverData = await supabaseService.getCustomers(userId);
          break;
        case 'products':
          serverData = await supabaseService.getProducts(userId);
          break;
        case 'sales':
          serverData = await supabaseService.getSales(userId);
          break;
        case 'expenses':
          serverData = await supabaseService.getExpenses(userId);
          break;
        case 'collections':
          serverData = await supabaseService.getCollections(userId);
          break;
        default:
          throw new Error(`Unknown table: ${table}`);
      }

      // Store server data locally
      for (const item of serverData) {
        await offlineStorage.store(table, item);
      }
      
      console.log(`📱 SYNC: Downloaded ${serverData.length} ${table} records from server`);
      
    } catch (error) {
      console.error(`📱 SYNC: Failed to sync ${table} from server:`, error);
      throw error;
    }
  }

  // Initial data download for offline capability
  async initialDataDownload(): Promise<void> {
    if (!navigator.onLine) {
      console.log('📱 SYNC: Cannot download initial data while offline');
      return;
    }

    console.log('📱 SYNC: Starting initial data download...');
    
    const tables = ['customers', 'products', 'sales', 'expenses', 'collections'];
    
    for (const table of tables) {
      try {
        await this.syncFromServer(table);
      } catch (error) {
        console.error(`📱 SYNC: Failed to download ${table}:`, error);
      }
    }
    
    console.log('📱 SYNC: Initial data download completed');
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Auto-setup sync monitoring
syncManager.setupAutoSync();