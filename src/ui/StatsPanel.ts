import * as PIXI from 'pixi.js';
import { GameManager } from '../managers/GameManager';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';
import { CashOutData } from '../models/CashOutData';

export class StatsPanel extends PIXI.Container {
  private gameManager: GameManager;
  private panelWidth: number;
  private panelHeight: number;
  
  // UI elements
  private multiplierText: PIXI.Text;
  private winAmountText: PIXI.Text;
  private tilesRevealedText: PIXI.Text;
  private minesText: PIXI.Text;
  private gameStateText: PIXI.Text;
  
  constructor(width: number = 300, height: number = 200) {
    super();
    
    this.gameManager = GameManager.getInstance();
    this.panelWidth = width;
    this.panelHeight = height;
    
    // Initialize UI elements with Futura font
    this.multiplierText = new PIXI.Text({
      text: 'Multiplier: 1.00x',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.winAmountText = new PIXI.Text({
      text: 'Win Amount: 0.00',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.tilesRevealedText = new PIXI.Text({
      text: 'Tiles: 0/25',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.minesText = new PIXI.Text({
      text: 'Mines: 3',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.gameStateText = new PIXI.Text({
      text: 'Game State: None',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.createPanel();
    this.setupEventListeners();
  }
  
  private createPanel(): void {
    // Background panel with branded colors
    const panel = new PIXI.Graphics();
    panel.beginFill(0x333333); // var(--color-surface)
    panel.lineStyle(2, 0x555555); // var(--color-border)
    panel.drawRoundedRect(0, 0, this.panelWidth, this.panelHeight, 10);
    panel.endFill();
    this.addChild(panel);
    
    // Title
    const title = new PIXI.Text({
      text: 'GAME STATS',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    title.x = 10;
    title.y = 10;
    this.addChild(title);
    
    // Stats
    this.multiplierText.x = 10;
    this.multiplierText.y = 40;
    this.addChild(this.multiplierText);
    
    this.winAmountText.x = 10;
    this.winAmountText.y = 70;
    this.addChild(this.winAmountText);
    
    this.tilesRevealedText.x = 10;
    this.tilesRevealedText.y = 100;
    this.addChild(this.tilesRevealedText);
    
    this.minesText.x = 10;
    this.minesText.y = 130;
    this.addChild(this.minesText);
    
    this.gameStateText.x = 10;
    this.gameStateText.y = 160;
    this.addChild(this.gameStateText);
  }
  
  private setupEventListeners(): void {
    // Listen for game events
    this.gameManager.registerCallback('gameSessionStarted', this.onGameSessionStarted.bind(this));
    this.gameManager.registerCallback('pickTileResponseReceived', this.onPickTileResponse.bind(this));
    this.gameManager.registerCallback('cashOutReceived', this.onCashOutReceived.bind(this));
  }
  
  private onGameSessionStarted(sessionData: GameSessionData): void {
    // Update UI for active game
    this.updateMultiplierText(sessionData.currentMultiplier);
    this.updateWinAmountText(sessionData.nextWinAmount);
    this.updateTilesRevealedText(0, sessionData.numberOfTiles);
    this.updateMinesText(sessionData.mines);
    this.updateGameStateText('Active');
  }
  
  private onPickTileResponse(data: PickTileResponse): void {
    // Update game stats
    this.updateMultiplierText(data.nextMultiplier);
    this.updateWinAmountText(data.nextWinAmount);
    this.updateTilesRevealedText(data.tiles.length, data.numberOfTiles);
    
    // Update game state if ended
    if (data.hitMine) {
      this.updateGameStateText('Lost');
    } else if (data.status === 'COMPLETED') {
      this.updateGameStateText('Win');
    }
  }
  
  private onCashOutReceived(data: CashOutData): void {
    // Update UI for game ended
    this.updateMultiplierText(data.multiplier);
    this.updateWinAmountText(data.winAmount);
    this.updateGameStateText('Win');
  }
  
  private updateMultiplierText(multiplier: number): void {
    this.multiplierText.text = `Multiplier: ${multiplier.toFixed(2)}x`;
  }
  
  private updateWinAmountText(amount: number): void {
    this.winAmountText.text = `Win Amount: ${amount.toFixed(2)}`;
  }
  
  private updateTilesRevealedText(revealed: number, total: number): void {
    this.tilesRevealedText.text = `Tiles: ${revealed}/${total}`;
  }
  
  private updateMinesText(mines: number): void {
    this.minesText.text = `Mines: ${mines}`;
  }
  
  private updateGameStateText(state: string): void {
    this.gameStateText.text = `Game State: ${state}`;
  }
}