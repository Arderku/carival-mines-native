import { ProvablyFairData } from "./ProvablyFairData";

export interface PickTileResponse {
    sessionId: string;
    betAmount: number;
    mines: number;
    cashOutAmount: number;
    nextMultiplier: number;
    nextWinAmount: number;
    numberOfTiles: number;
    status: string;
    minePositions: number[];
    hitMine: boolean;
    tiles: number[];
    mineTileIndex?: number;
    provablyFair: ProvablyFairData;
  }