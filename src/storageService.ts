import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Service to handle persistent storage of selected models
 */
export class StorageService {
  private static instance: StorageService | undefined;
  private storagePath: string | undefined;
  
  private constructor(context: vscode.ExtensionContext) {
    // Try different storage options in order of preference
    if (context.storageUri) {
      this.storagePath = context.storageUri.fsPath;
      console.log('Using storageUri path:', this.storagePath);
    } else if (context.globalStorageUri) {
      this.storagePath = context.globalStorageUri.fsPath;
      console.log('Using globalStorageUri path:', this.storagePath);
    } else if (context.extensionPath) {
      // Fallback to a directory within the extension
      this.storagePath = path.join(context.extensionPath, '.storage');
      console.log('Using extension path fallback:', this.storagePath);
    } else {
      // Last resort - use temp directory with extension ID to avoid collisions
      const extensionId = 'multi-pilot';
      this.storagePath = path.join(os.tmpdir(), extensionId);
      console.log('Using temp directory fallback:', this.storagePath);
    }
    
    this.ensureStorageExists();
    console.log('Final storage path used:', this.storagePath);
  }
  
  /**
   * Get singleton instance of StorageService
   */
  public static getInstance(context: vscode.ExtensionContext): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(context);
    }
    return StorageService.instance;
  }
  
  /**
   * Ensure storage directory exists
   */
  private ensureStorageExists(): void {
    if (!this.storagePath) {
      console.error('Storage path is undefined, cannot create storage directory');
      return;
    }
    
    try {
      if (!fs.existsSync(this.storagePath)) {
        fs.mkdirSync(this.storagePath, { recursive: true });
        console.log('Created storage directory:', this.storagePath);
      } else {
        console.log('Storage directory already exists:', this.storagePath);
      }
    } catch (error) {
      console.error('Error creating storage directory:', error);
    }
  }
  
  /**
   * Save selected models to storage
   */
  public async saveSelectedModels(models: string[]): Promise<void> {
    if (!this.storagePath) {
      console.error('Storage path is undefined, cannot save selected models');
      vscode.window.showErrorMessage('Failed to save selected models: storage path is undefined');
      return;
    }
    
    const filePath = path.join(this.storagePath, 'selectedModels.json');
    
    try {
      const data = JSON.stringify({ selectedModels: models }, null, 2);
      fs.writeFileSync(filePath, data);
      console.log('Selected models saved to:', filePath);
    } catch (error) {
      console.error('Error saving selected models:', error);
      vscode.window.showErrorMessage('Failed to save selected models');
    }
  }
  
  /**
   * Load selected models from storage
   */
  public loadSelectedModels(): string[] {
    if (!this.storagePath) {
      console.error('Storage path is undefined, cannot load selected models');
      return [];
    }
    
    const filePath = path.join(this.storagePath, 'selectedModels.json');
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        console.log('Loaded models from storage:', parsed.selectedModels);
        return parsed.selectedModels || [];
      }
    } catch (error) {
      console.error('Error loading selected models:', error);
    }
    
    return [];
  }
}