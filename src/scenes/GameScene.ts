import * as PIXI from 'pixi.js';
import { Board } from '../ui/Board';
import { BetPanel } from '../ui/BetPanel';
import { StatsPanel } from '../ui/StatsPanel';
import { GameManager } from '../managers/GameManager';
import { ConnectionManager } from '../managers/ConnectionManager';
import { AnimatedGradientBackground } from '../ui/AnimatedGradientBackground';

export class GameScene extends PIXI.Container {
  private app: PIXI.Application;
  private gameManager: GameManager;
  private connectionManager: ConnectionManager;
  private board: Board;
  private betPanel: BetPanel;
  private statsPanel: StatsPanel;
  private background: AnimatedGradientBackground;
  private isInitialized: boolean = false;
  
  constructor(app: PIXI.Application) {
    super();
    
    this.app = app;
    this.gameManager = GameManager.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    
    // Create animated background with current screen dimensions
    this.background = new AnimatedGradientBackground(
      this.app.screen.width,
      this.app.screen.height
    );
    
    // Add the background as the first child (bottom layer)
    this.addChild(this.background);
    
    // Create UI components
    this.board = new Board(500, 500);
    this.betPanel = new BetPanel(300, 200);
    this.statsPanel = new StatsPanel(300, 200);
    
    // Add UI components
    this.addChild(this.board);
    this.addChild(this.betPanel);
    this.addChild(this.statsPanel);
    
    // Initial layout
    this.onResize();
  }
  
  public async initialize(authToken: string): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Set authentication token
      this.connectionManager.setAuthToken(authToken);
      
      // Request user information
      await this.connectionManager.requestUserInformation();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize game scene:', error);
      throw error;
    }
  }
  
  public onResize(): void {
    // Update background size
    this.background.resize(this.app.screen.width, this.app.screen.height);
    
    // Get current app dimensions
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Position the board in the center
    this.board.x = (width - 500) / 2;
    this.board.y = (height - 500) / 2;
    
    // Position panels on the sides
    this.betPanel.x = this.board.x - this.betPanel.width - 20;
    this.betPanel.y = this.board.y + (this.board.height - this.betPanel.height) / 2;
    
    this.statsPanel.x = this.board.x + this.board.width + 20;
    this.statsPanel.y = this.board.y + (this.board.height - this.statsPanel.height) / 2;
    
    // For narrow screens, stack panels below the board
    if (width < 900) {
      this.betPanel.x = this.board.x;
      this.betPanel.y = this.board.y + this.board.height + 20;
      
      this.statsPanel.x = this.board.x + this.betPanel.width + 20;
      this.statsPanel.y = this.board.y + this.board.height + 20;
    }
  }
  
  public update(delta: number): void {
    // Update animated background
    if (this.background) {
      this.background.update(delta);
    }
    
    // Update other game components as needed
  }
}