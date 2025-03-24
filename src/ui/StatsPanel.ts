import * as PIXI from 'pixi.js';
import { GameManager } from '../managers/GameManager';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';
import { CashOutData } from '../models/CashOutData';

export class StatsPanel extends PIXI.Container {
  private gameManager: GameManager;
  private panelWidth: number;
  private panelHeight: number;
  private isPortrait: boolean;
  private background!: PIXI.Graphics;
  
  // UI elements
  private multiplierText: PIXI.Text;
  private winAmountText: PIXI.Text;
  private tilesRevealedText: PIXI.Text;
  private minesText: PIXI.Text;
  private gameStateText: PIXI.Text;
  
  constructor(width: number = 300, height: number = 200, isPortrait: boolean = true) {
    super();
    
    this.gameManager = GameManager.getInstance();
    this.panelWidth = width;
    this.panelHeight = height;
    this.isPortrait = isPortrait;
    
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
      text: 'Win: 0.00',
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
    
    // Create the panel
    this.createPanel();
    this.setupEventListeners();
  }
  
  public resize(width: number, height: number, isPortrait: boolean = this.isPortrait): void {
    this.panelWidth = width;
    this.panelHeight = height;
    this.isPortrait = isPortrait;
    
    // Redraw the panel
    this.removeChildren();
    this.createPanel();
  }
  
  private createPanel(): void {
    // Background panel
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x333333, 0.8);
    this.background.lineStyle(2, 0xE72264);
    this.background.drawRoundedRect(0, 0, this.panelWidth, this.panelHeight, 15);
    this.background.endFill();
    this.addChild(this.background);
    
    // Title
    const title = new PIXI.Text({
      text: 'GAME STATS',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    title.x = 15;
    title.y = 10;
    this.addChild(title);
    
    // Adjust font size based on panel dimensions
    const fontSize = Math.max(12, Math.min(14, this.panelHeight * 0.1));
    
    // Update font sizes
    this.multiplierText.style.fontSize = fontSize;
    this.winAmountText.style.fontSize = fontSize;
    this.tilesRevealedText.style.fontSize = fontSize;
    this.minesText.style.fontSize = fontSize;
    this.gameStateText.style.fontSize = fontSize;
    
    if (this.isPortrait) {
      this.createPortraitLayout();
    } else {
      this.createLandscapeLayout();
    }
  }
  
  private createPortraitLayout(): void {
    // More compact layout for portrait mode
    const columnWidth = this.panelWidth / 2;
    
    // Calculate vertical positions based on panel height
    const startY = this.panelHeight * 0.35; // Closer to top
    const lineHeight = Math.min(this.panelHeight * 0.25, 20); // Limit line height
    
    // Left column
    this.multiplierText.x = 15;
    this.multiplierText.y = startY;
    this.addChild(this.multiplierText);
    
    this.winAmountText.x = 15;
    this.winAmountText.y = startY + lineHeight;
    this.addChild(this.winAmountText);
    
    // Right column
    this.tilesRevealedText.x = columnWidth + 15;
    this.tilesRevealedText.y = startY;
    this.addChild(this.tilesRevealedText);
    
    this.minesText.x = columnWidth + 15;
    this.minesText.y = startY + lineHeight;
    this.addChild(this.minesText);
    
    // Game state at bottom, less spacing
    this.gameStateText.x = this.panelWidth / 2 - this.gameStateText.width / 2;
    this.gameStateText.y = this.panelHeight * 0.7; // Higher up
    this.addChild(this.gameStateText);
  }
  
  private createLandscapeLayout(): void {
    // For landscape mode, arrange stats in one column
    const startY = this.panelHeight * 0.25;
    const lineHeight = this.panelHeight * 0.15;
    
    // Stack items vertically
    this.multiplierText.x = 15;
    this.multiplierText.y = startY;
    this.addChild(this.multiplierText);
    
    this.winAmountText.x = 15;
    this.winAmountText.y = startY + lineHeight;
    this.addChild(this.winAmountText);
    
    this.tilesRevealedText.x = 15;
    this.tilesRevealedText.y = startY + lineHeight * 2;
    this.addChild(this.tilesRevealedText);
    
    this.minesText.x = 15;
    this.minesText.y = startY + lineHeight * 3;
    this.addChild(this.minesText);
    
    // Game state at the bottom
    this.gameStateText.x = 15;
    this.gameStateText.y = startY + lineHeight * 4;
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
    
    // Re-center in portrait mode
    if (this.isPortrait) {
      this.gameStateText.x = this.panelWidth / 2 - this.gameStateText.width / 2;
    }
  }
}