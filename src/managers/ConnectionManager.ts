import { EventEmitter } from '../utils/EventEmitter';
import { UserInfoData } from '../models/UserInfoData';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';
import { CashOutData } from '../models/CashOutData';
import { ErrorData } from '../models/ErrorData';

export class ConnectionManager {
  private static instance: ConnectionManager;
  private eventEmitter: EventEmitter;
  private baseUrl: string;
  private authToken: string | null;
  private clientSeed: string | null;
  private timeout: number;
  
  public isAuthTokenSet: boolean;
  public isBaseUrlSet: boolean;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.baseUrl = "https://dev-mns-api.aws.cvl.joystudios.xyz/";
    this.authToken = null;
    this.clientSeed = null;
    this.timeout = 10000; // 10 seconds in milliseconds
    this.isAuthTokenSet = false;
    this.isBaseUrlSet = true;
  }

  // Singleton implementation
  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public setClientSeed(clientSeed: string): void {
    this.clientSeed = clientSeed;
    console.log("Client seed set:", clientSeed);
  }

  public setAuthToken(token: string): void {
    console.log("SetAuthToken:", token);
    this.authToken = token;
    this.isAuthTokenSet = true;
    this.eventEmitter.emit('authTokenSet');
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.isBaseUrlSet = true;
  }

  // Request user information from the server
  public async requestUserInformation(): Promise<UserInfoData> {
    try {
      const response = await this.sendRequest<UserInfoData>('user', 'GET');
      this.eventEmitter.emit('userInfoReceived', response);
      return response;
    } catch (error) {
      const errorData: ErrorData = {
        code: (error as any)?.code || 'REQUEST_FAILED',
        message: (error as Error)?.message || 'Failed to fetch user information'
      };
      this.eventEmitter.emit('requestError', errorData);
      throw error;
    }
  }

  // Start game session
  public async requestStartGameSession(betAmount: number, mines: number): Promise<GameSessionData> {
    console.log("RequestStartGameSession:", betAmount, "/", mines, "/ clientSeed:", this.clientSeed);
    
    interface GameSessionRequest {
      betAmount: number;
      mines: number;
      clientSeed?: string;
    }
    
    const requestData: GameSessionRequest = {
      betAmount,
      mines
    };
    
    if (this.clientSeed) {
      requestData.clientSeed = this.clientSeed;
    }
    
    const jsonBody = JSON.stringify(requestData);
    console.log("RequestStartGameSession: JsonBody -", jsonBody);
    
    try {
      const response = await this.sendRequest<GameSessionData>('game/session', 'POST', jsonBody);
      this.eventEmitter.emit('gameSessionStarted', response);
      return response;
    } catch (error) {
      const errorData: ErrorData = {
        code: (error as any)?.code || 'REQUEST_FAILED',
        message: (error as Error)?.message || 'Failed to start game session'
      };
      this.eventEmitter.emit('requestError', errorData);
      throw error;
    }
  }

  // Cash out
  public async requestCashOut(sessionId: string): Promise<CashOutData> {
    try {
      const response = await this.sendRequest<CashOutData>(`game/session/${sessionId}/cash-out`, 'POST');
      this.eventEmitter.emit('cashOutReceived', response);
      return response;
    } catch (error) {
      const errorData: ErrorData = {
        code: (error as any)?.code || 'REQUEST_FAILED',
        message: (error as Error)?.message || 'Failed to cash out'
      };
      this.eventEmitter.emit('requestError', errorData);
      throw error;
    }
  }

  // Pick a tile
  public async requestPickTile(sessionId: string, tileIndex: number): Promise<PickTileResponse> {
    interface PickTileRequest {
      sessionId: string;
      tileIndex: number;
    }
    
    const requestData: PickTileRequest = {
      sessionId,
      tileIndex
    };
    
    const jsonBody = JSON.stringify(requestData);
    console.log("Requesting pick tile:", jsonBody);
    
    try {
      const response = await this.sendRequest<PickTileResponse>(`game/session/${sessionId}/pick`, 'POST', jsonBody);
      
      // Ensure arrays are initialized
      response.tiles = response.tiles || [];
      response.minePositions = response.minePositions || [];
      
      console.log("PickTileResponse:", response);
      this.eventEmitter.emit('pickTileResponseReceived', response);
      return response;
    } catch (error) {
      const errorData: ErrorData = {
        code: (error as any)?.code || 'REQUEST_FAILED',
        message: (error as Error)?.message || 'Failed to pick tile'
      };
      this.eventEmitter.emit('requestError', errorData);
      throw error;
    }
  }

  // Core method for sending requests
  private async sendRequest<T>(endpoint: string, method: string, body: string | null = null): Promise<T> {
    const url = this.baseUrl + endpoint;
    console.log(`Sending ${method} request to ${url} with body:`, body);
    
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    if (this.authToken) {
      headers.append('Authorization', `Bearer ${this.authToken}`);
    }
    
    const requestOptions: RequestInit = {
      method,
      headers,
      body,
      mode: 'cors'
    };
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      console.log(`Response: ${response.status}`, responseText);
      
      if (!response.ok) {
        let errorData: ErrorData;
        try {
          errorData = JSON.parse(responseText) as ErrorData;
        } catch (e) {
          errorData = {
            code: 'REQUEST_FAILED',
            message: `Request failed with status ${response.status}`
          };
        }
        throw errorData;
      }
      
      return JSON.parse(responseText) as T;
    } catch (error) {
      console.error('Request failed:', error);
      if ((error as any).name === 'AbortError') {
        throw {
          code: 'TIMEOUT',
          message: 'Request timed out'
        };
      }
      throw error;
    }
  }

  // Add event listeners
  public on(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  // Remove event listeners
  public off(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.off(event, callback);
  }
}