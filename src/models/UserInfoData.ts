export interface GameConfigData {
    [key: string]: any;
  }
  
  export interface UserInfoData {
    userId: string;
    balance: number;
    config: GameConfigData;
    firstBetMultipliers: number[];
  }