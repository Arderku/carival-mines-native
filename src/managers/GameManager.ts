import { ConnectionManager } from './ConnectionManager';
import { UserInfoData } from '../models/UserInfoData';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';
import { CashOutData } from '../models/CashOutData';
import { ErrorData } from '../models/ErrorData';
import { GameStatusType } from '../models/GameStatusType';

// Generic callback type
type Callback<T> = (data: T) => void;

// Event map type
interface CallbackMap {
  userInfoUpdated: Callback<UserInfoData>[];
  gameSessionStarted: Callback<GameSessionData>[];
  pickTileResponseReceived: Callback<PickTileResponse>[];
  cashOutReceived: Callback<CashOutData>[];
  error: Callback<ErrorData>[];
}

export class GameManager {
  private static instance: GameManager;
  private connectionManager: ConnectionManager;
  private callbackMap: Partial<CallbackMap>;
  
  public currentSession: GameSessionData | null;
  public betAmount: number;
  public mines: number;
  public userInfo: UserInfoData | null;
  public gameStatus: GameStatusType;
  public selectedTiles: number[];
  public revealedMines: number[];
  
  private constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.currentSession = null;
    this.betAmount = 1.0;
    this.mines = 3;
    this.userInfo = null;
    this.gameStatus = GameStatusType.None;
    this.selectedTiles = [];
    this.revealedMines = [];
    this.callbackMap = {};
    
    // Set up event listeners
    this.setupEventListeners();
  }

  // Singleton implementation
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  private setupEventListeners(): void {
    // Listen for connection manager events
    this.connectionManager.on('userInfoReceived', (data: UserInfoData) => {
      this.userInfo = data;
      this.notifyCallbacks('userInfoUpdated', data);
    });
    
    this.connectionManager.on('gameSessionStarted', (data: GameSessionData) => {
      this.currentSession = data;
      this.gameStatus = GameStatusType.Active;
      this.selectedTiles = [];
      this.revealedMines = [];
      this.notifyCallbacks('gameSessionStarted', data);
    });
    
    this.connectionManager.on('pickTileResponseReceived', (data: PickTileResponse) => {
      this.handlePickTileResponse(data);
    });
    
    this.connectionManager.on('cashOutReceived', (data: CashOutData) => {
      this.gameStatus = GameStatusType.Win;
      this.notifyCallbacks('cashOutReceived', data);
    });
    
    this.connectionManager.on('requestError', (error: ErrorData) => {
      console.error('API error:', error);
      this.notifyCallbacks('error', error);
    });
  }

  private handlePickTileResponse(data: PickTileResponse): void {
    // Update current session data
    if (this.currentSession) {
      this.currentSession = {
        ...this.currentSession,
        ...data
      };
    }
    
    // Add the selected tile to our list
    if (data.mineTileIndex !== undefined && !this.selectedTiles.includes(data.mineTileIndex) && !data.hitMine) {
      // If it's not a mine and not already in our list
      this.selectedTiles.push(data.tiles[data.tiles.length - 1]);
    }
    
    // Check if game ended
    if (data.hitMine) {
      this.gameStatus = GameStatusType.Lost;
      this.revealedMines = data.minePositions || [];
    } else if (data.status === 'COMPLETED') {
      this.gameStatus = GameStatusType.Win;
    }
    
    this.notifyCallbacks('pickTileResponseReceived', data);
  }

  // Game actions
  public async startGame(betAmount: number, mines: number): Promise<GameSessionData> {
    this.betAmount = betAmount;
    this.mines = mines;
    
    try {
      const response = await this.connectionManager.requestStartGameSession(betAmount, mines);
      return response;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  public async pickTile(tileIndex: number): Promise<PickTileResponse> {
    if (!this.currentSession || this.gameStatus !== GameStatusType.Active) {
      const error = new Error('Cannot pick tile: No active game session');
      console.error(error);
      throw error;
    }
    
    try {
      const response = await this.connectionManager.requestPickTile(this.currentSession.sessionId, tileIndex);
      return response;
    } catch (error) {
      console.error('Failed to pick tile:', error);
      throw error;
    }
  }

  public async cashOut(): Promise<CashOutData> {
    if (!this.currentSession || this.gameStatus !== GameStatusType.Active) {
      const error = new Error('Cannot cash out: No active game session');
      console.error(error);
      throw error;
    }
    
    try {
      const response = await this.connectionManager.requestCashOut(this.currentSession.sessionId);
      return response;
    } catch (error) {
      console.error('Failed to cash out:', error);
      throw error;
    }
  }

  // Callback registration system
  public registerCallback<T extends keyof CallbackMap>(
    event: T, 
    callback: CallbackMap[T] extends (infer C)[] ? C : never
  ): void {
    if (!this.callbackMap[event]) {
      this.callbackMap[event] = [] as any;
    }
    (this.callbackMap[event] as any[]).push(callback);
  }

  public unregisterCallback<T extends keyof CallbackMap>(
    event: T, 
    callback: CallbackMap[T] extends (infer C)[] ? C : never
  ): void {
    if (!this.callbackMap[event]) return;
    this.callbackMap[event] = (this.callbackMap[event] as any[]).filter(cb => cb !== callback) as any;
  }

  private notifyCallbacks<T extends keyof CallbackMap>(event: T, data: any): void {
    if (!this.callbackMap[event]) return;
    (this.callbackMap[event] as any[]).forEach(callback => callback(data));
  }
}