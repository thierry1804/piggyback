// Types pour les données stockées dans localStorage
export interface Goal {
  id: number;
  name: string;
  description: string | null;
  targetAmount: number; // en centimes
  currentAmount: number; // en centimes
  icon: string;
  color: string;
  currencyCode: string;
  currencySymbol: string;
  createdAt: string; // ISO date string
  deadline: string | null; // ISO date string, optionnel
}

export interface Transaction {
  id: number;
  goalId: number;
  amount: number; // positif pour dépôt, négatif pour retrait
  note: string | null;
  createdAt: string; // ISO date string
}

export interface Settings {
  currencyCode: string;
  currencySymbol: string;
  language: "en" | "fr" | "mg";
}

export interface SyncMetadata {
  lastSyncAt: string | null; // ISO date
  lastSyncLocalGoalsCount: number;
  lastSyncCloudGoalsCount: number;
}

const STORAGE_KEYS = {
  GOALS: 'simple-piggy-goals',
  TRANSACTIONS: 'simple-piggy-transactions',
  SETTINGS: 'simple-piggy-settings',
  NEXT_GOAL_ID: 'simple-piggy-next-goal-id',
  NEXT_TRANSACTION_ID: 'simple-piggy-next-transaction-id',
  SYNC_METADATA: 'simple-piggy-sync-metadata',
} as const;

// Service de stockage localStorage
class LocalStorageService {
  // Goals
  getGoals(): Goal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) return [];
    try {
      const goals = JSON.parse(data) as Goal[];
      return goals.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  }

  getGoal(id: number): (Goal & { transactions: Transaction[] }) | undefined {
    const goal = this.getGoals().find(g => g.id === id);
    if (!goal) return undefined;

    const transactions = this.getTransactions().filter(t => t.goalId === id);
    return { ...goal, transactions };
  }

  createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>): Goal {
    const goals = this.getGoals();
    const nextId = this.getNextGoalId();
    
    const newGoal: Goal = {
      ...goalData,
      id: nextId,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
      deadline: goalData.deadline || null,
    };

    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    this.setNextGoalId(nextId + 1);
    
    return newGoal;
  }

  deleteGoal(id: number): void {
    const goals = this.getGoals().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    
    // Supprimer aussi les transactions associées
    const transactions = this.getTransactions().filter(t => t.goalId !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  updateGoalAmount(id: number, amountDelta: number): void {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.currentAmount += amountDelta;
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    }
  }

  // Transactions
  getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) return [];
    try {
      return JSON.parse(data) as Transaction[];
    } catch {
      return [];
    }
  }

  createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const nextId = this.getNextTransactionId();
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: nextId,
      createdAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    this.setNextTransactionId(nextId + 1);
    
    // Mettre à jour le montant actuel du goal
    this.updateGoalAmount(transactionData.goalId, transactionData.amount);
    
    return newTransaction;
  }

  // Settings
  getSettings(): Settings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      // Valeurs par défaut
      const defaultSettings: Settings = {
        currencyCode: 'MGA',
        currencySymbol: 'Ar',
        language: 'en',
      };
      this.setSettings(defaultSettings);
      return defaultSettings;
    }
    try {
      const settings = JSON.parse(data) as Settings;
      // Ajouter la langue par défaut si elle n'existe pas
      if (!settings.language) {
        settings.language = 'en';
        this.setSettings(settings);
      }
      return settings;
    } catch {
      const defaultSettings: Settings = {
        currencyCode: 'MGA',
        currencySymbol: 'Ar',
        language: 'en',
      };
      this.setSettings(defaultSettings);
      return defaultSettings;
    }
  }

  setSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getSyncMetadata(): SyncMetadata {
    const data = localStorage.getItem(STORAGE_KEYS.SYNC_METADATA);
    if (!data) {
      return {
        lastSyncAt: null,
        lastSyncLocalGoalsCount: 0,
        lastSyncCloudGoalsCount: 0,
      };
    }
    try {
      const parsed = JSON.parse(data) as Partial<SyncMetadata>;
      return {
        lastSyncAt: parsed.lastSyncAt ?? null,
        lastSyncLocalGoalsCount: parsed.lastSyncLocalGoalsCount ?? 0,
        lastSyncCloudGoalsCount: parsed.lastSyncCloudGoalsCount ?? 0,
      };
    } catch {
      return {
        lastSyncAt: null,
        lastSyncLocalGoalsCount: 0,
        lastSyncCloudGoalsCount: 0,
      };
    }
  }

  setSyncMetadata(meta: Partial<SyncMetadata>): void {
    const current = this.getSyncMetadata();
    const next: SyncMetadata = {
      lastSyncAt: meta.lastSyncAt ?? current.lastSyncAt,
      lastSyncLocalGoalsCount: meta.lastSyncLocalGoalsCount ?? current.lastSyncLocalGoalsCount,
      lastSyncCloudGoalsCount: meta.lastSyncCloudGoalsCount ?? current.lastSyncCloudGoalsCount,
    };
    localStorage.setItem(STORAGE_KEYS.SYNC_METADATA, JSON.stringify(next));
  }

  /** Empreinte locale pour la décision de sync : count + latestCreatedAt. */
  getLocalSyncFingerprint(): { goalsCount: number; latestCreatedAt: string | undefined } {
    const goals = this.getGoals();
    const goalsCount = goals.length;
    const latestCreatedAt =
      goals.length > 0
        ? goals.reduce((max, g) => (g.createdAt > max ? g.createdAt : max), goals[0].createdAt)
        : undefined;
    return { goalsCount, latestCreatedAt };
  }

  /** Remplace tous les goals (ex. après sync depuis Supabase). Met à jour NEXT_GOAL_ID. */
  setGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    const maxId = goals.length > 0 ? Math.max(...goals.map((g) => g.id), 0) : 0;
    this.setNextGoalId(maxId + 1);
  }

  /** Remplace toutes les transactions (ex. après sync depuis Supabase). Met à jour NEXT_TRANSACTION_ID. */
  setTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    const maxId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id), 0) : 0;
    this.setNextTransactionId(maxId + 1);
  }

  // Helpers pour les IDs
  private getNextGoalId(): number {
    const id = localStorage.getItem(STORAGE_KEYS.NEXT_GOAL_ID);
    return id ? parseInt(id, 10) : 1;
  }

  private setNextGoalId(id: number): void {
    localStorage.setItem(STORAGE_KEYS.NEXT_GOAL_ID, String(id));
  }

  private getNextTransactionId(): number {
    const id = localStorage.getItem(STORAGE_KEYS.NEXT_TRANSACTION_ID);
    return id ? parseInt(id, 10) : 1;
  }

  private setNextTransactionId(id: number): void {
    localStorage.setItem(STORAGE_KEYS.NEXT_TRANSACTION_ID, String(id));
  }

  // Migration des données existantes vers MGA/Ar et ajout du champ deadline
  migrateToMGA(): void {
    const goals = this.getGoals();
    let needsUpdate = false;
    
    const updatedGoals = goals.map(goal => {
      const updated: Goal = { ...goal };
      
      // Si l'objectif utilise USD, le convertir en MGA
      if (goal.currencyCode === "USD" || goal.currencySymbol === "$") {
        needsUpdate = true;
        updated.currencyCode = "MGA";
        updated.currencySymbol = "Ar";
      }
      
      // Ajouter le champ deadline s'il n'existe pas
      if (!('deadline' in goal)) {
        needsUpdate = true;
        updated.deadline = null;
      }
      
      return updated;
    });
    
    if (needsUpdate) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
    }
    
    // Mettre à jour les settings aussi
    const settings = this.getSettings();
    if (settings.currencyCode === "USD" || settings.currencySymbol === "$") {
      this.setSettings({
        currencyCode: "MGA",
        currencySymbol: "Ar"
      });
    }
  }

  // Initialisation avec des données de démo si vide
  initializeDemoData(): void {
    // D'abord, migrer les données existantes vers MGA
    this.migrateToMGA();
    
    const goals = this.getGoals();
    if (goals.length === 0) {
      this.createGoal({
        name: "New Bike 🚲",
        description: "Saving up for a mountain bike",
        targetAmount: 50000, // Ar 500.00
        icon: "🚲",
        color: "emerald",
        currencyCode: "MGA",
        currencySymbol: "Ar",
        deadline: null
      });
      this.createGoal({
        name: "Vacation 🏖️",
        description: "Trip to Hawaii",
        targetAmount: 200000, // Ar 2000.00
        icon: "🏖️",
        color: "blue",
        currencyCode: "MGA",
        currencySymbol: "Ar",
        deadline: null
      });
      this.createGoal({
        name: "Emergency Fund 🚑",
        description: "Rainy day savings",
        targetAmount: 100000, // Ar 1000.00
        icon: "🚑",
        color: "red",
        currencyCode: "MGA",
        currencySymbol: "Ar",
        deadline: null
      });
    }
  }
}

export const localStorageService = new LocalStorageService();
