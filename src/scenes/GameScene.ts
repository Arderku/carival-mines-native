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
  private board!: Board;
  private betPanel!: BetPanel;
  private statsPanel!: StatsPanel;
  private background: AnimatedGradientBackground;
  private isInitialized: boolean = false;
  private isMobile: boolean;
  private authToken: string = '';
  
  constructor(app: PIXI.Application, isMobile: boolean = false) {
    super();
    
    this.app = app;
    this.isMobile = isMobile;
    this.gameManager = GameManager.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    
    // Create animated background with current screen dimensions
    this.background = new AnimatedGradientBackground(
      this.app.screen.width,
      this.app.screen.height
    );
    
    // Add the background as the first child (bottom layer)
    this.addChild(this.background);
    
    // Calculate sizes based on orientation
    if (this.isMobile) {
      // Portrait layout for mobile
      this.createPortraitLayout();
    } else {
      // Landscape layout for desktop
      this.createLandscapeLayout();
    }
    
    // Initial layout
    this.onResize();
  }
  
  private createPortraitLayout(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Board size - optimized for portrait view
    const boardSize = Math.min(width * 0.9, height * 0.45);
    
    // Create board with appropriate size
    this.board = new Board(boardSize, boardSize);
    
    // Panel sizes for portrait mode - wider but shorter
    const panelWidth = width * 0.95;
    const statsPanelHeight = height * 0.15;
    const betPanelHeight = height * 0.25;
    
    // Create panels
    this.statsPanel = new StatsPanel(panelWidth, statsPanelHeight);
    this.betPanel = new BetPanel(panelWidth, betPanelHeight, true); // true = portrait mode
    
    // Add UI components
    this.addChild(this.statsPanel);
    this.addChild(this.board);
    this.addChild(this.betPanel);
  }
  
  private createLandscapeLayout(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Board size - centered for landscape view
    const boardSize = Math.min(width * 0.5, height * 0.8);
    
    // Create board
    this.board = new Board(boardSize, boardSize);
    
    // Panel sizes for landscape - narrower but taller
    const panelWidth = width * 0.22;
    const panelHeight = height * 0.8;
    
    // Create panels
    this.statsPanel = new StatsPanel(panelWidth, panelHeight * 0.3);
    this.betPanel = new BetPanel(panelWidth, panelHeight * 0.65, false); // false = landscape mode
    
    // Add UI components
    this.addChild(this.statsPanel);
    this.addChild(this.board);
    this.addChild(this.betPanel);
  }
  
  public async initialize(authToken: string): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Save auth token
      this.authToken = authToken;
      
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
  
  public getAuthToken(): string {
    return this.authToken;
  }
  
  public onResize(): void {
    // Update background size
    this.background.resize(this.app.screen.width, this.app.screen.height);
    
    if (this.isMobile) {
      this.updatePortraitLayout();
    } else {
      this.updateLandscapeLayout();
    }
  }
  
  private updatePortraitLayout(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // More aggressive component sizing for portrait mode
    // Stats panel at top - keep small and compact
    const statsPanelHeight = Math.min(height * 0.1, 80);
    const panelWidth = width * 0.95;
    
    // Bet panel at bottom - ensure fixed reasonable height
    const betPanelHeight = Math.min(height * 0.32, 240);
    
    // Board gets the remaining space, with some margins
    const availableHeight = height - statsPanelHeight - betPanelHeight - height * 0.07;
    const boardSize = Math.min(width * 0.9, availableHeight);
    
    // Update component sizes
    this.statsPanel.resize(panelWidth, statsPanelHeight);
    this.board.resize(boardSize, boardSize);
    this.betPanel.resize(panelWidth, betPanelHeight);
    
    // Position components with minimal spacing
    // Stats panel at top
    this.statsPanel.x = (width - panelWidth) / 2;
    this.statsPanel.y = height * 0.01;
    
    // Board in the middle, pushed up slightly
    this.board.x = (width - boardSize) / 2;
    this.board.y = this.statsPanel.y + statsPanelHeight + height * 0.01;
    
    // Bet panel at bottom - set absolute position to ensure visibility
    this.betPanel.x = (width - panelWidth) / 2;
    this.betPanel.y = height - betPanelHeight - height * 0.01;
  }
  
  private updateLandscapeLayout(): void {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Calculate appropriate sizes for landscape mode
    // Make board slightly smaller to ensure all components fit
    const boardSize = Math.min(width * 0.45, height * 0.75);
    const panelWidth = width * 0.22;
    const statsHeight = height * 0.2;
    // Reduce bet panel height to ensure it fits with all buttons visible
    const betPanelHeight = Math.min(height * 0.5, height - statsHeight - height * 0.1);
    
    // Update component sizes
    this.board.resize(boardSize, boardSize);
    this.statsPanel.resize(panelWidth, statsHeight);
    this.betPanel.resize(panelWidth, betPanelHeight);
    
    // Position components in landscape layout
    // Board in center
    this.board.x = (width - boardSize) / 2;
    this.board.y = (height - boardSize) / 2;
    
    // Bet panel on right side with more space at the bottom
    this.betPanel.x = this.board.x + boardSize + width * 0.02;
    // Center the bet panel vertically but ensure it's not too low
    this.betPanel.y = Math.min((height - betPanelHeight) / 2, height * 0.45);
    
    // Stats panel above bet panel
    this.statsPanel.x = this.betPanel.x;
    this.statsPanel.y = this.betPanel.y - statsHeight - height * 0.01;
    
    // If stats panel goes off-screen, put it below bet panel
    if (this.statsPanel.y < 10) {
      // Move bet panel higher up
      this.betPanel.y = height * 0.15;
      this.statsPanel.y = this.betPanel.y + betPanelHeight + height * 0.01;
    }
  }
  
  public update(delta: number): void {
    // Update animated background
    if (this.background) {
      this.background.update(delta);
    }
  }
}