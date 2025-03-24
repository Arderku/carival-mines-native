import { ProvablyFairData } from "./ProvablyFairData";

export interface GameSessionData {
    sessionId: string;
    betAmount: number;
    mines: number;
    cashOutAmount: number;
    currentMultiplier: number;
    nextMultiplier: number;
    nextWinAmount: number;
    numberOfTiles: number;
    status: string;
    tiles: number[];
    remainingBalance: number;
    provablyFair: ProvablyFairData;
  }