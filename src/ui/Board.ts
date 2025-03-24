import * as PIXI from 'pixi.js';
import { Tile } from './Tile';
import { GameManager } from '../managers/GameManager';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';
import { GameStatusType } from '../models/GameStatusType';

export class Board extends PIXI.Container {
  private gameManager: GameManager;
  private boardWidth: number;
  private boardHeight: number;
  private rows: number;
  private cols: number;
  private tileSize: number;
  private tiles: Tile[];
  
  constructor(width: number = 500, height: number = 500) {
    super();
    
    this.gameManager = GameManager.getInstance();
    this.boardWidth = width;
    this.boardHeight = height;
    this.rows = 5;
    this.cols = 5;
    this.tiles = [];
    
    // Calculate tile size based on board dimensions
    this.tileSize = Math.min(
      (this.boardWidth / this.cols),
      (this.boardHeight / this.rows)
    );
    
    this.createBoard();
    this.setupEventListeners();
  }
  
  private createBoard(): void {
    // Clear existing tiles if any
    this.removeChildren();
    this.tiles = [];
    
    // Create a container for the board with proper positioning
    const boardContainer = new PIXI.Container();
    this.addChild(boardContainer);
    
    // Position the board container to center it
    boardContainer.x = (this.boardWidth - (this.tileSize * this.cols)) / 2;
    boardContainer.y = (this.boardHeight - (this.tileSize * this.rows)) / 2;
    
    // Create tiles
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const index = row * this.cols + col;
        const tile = new Tile(index, this.tileSize);
        
        // Position the tile
        tile.x = col * this.tileSize;
        tile.y = row * this.tileSize;
        
        // Add to container and our tiles array
        boardContainer.addChild(tile);
        this.tiles.push(tile);
        
        // Listen for tile clicks
        tile.on('tileClicked', this.onTileClicked.bind(this));
      }
    }
  }
  
  private setupEventListeners(): void {
    // Listen for game events
    this.gameManager.registerCallback('gameSessionStarted', this.onGameSessionStarted.bind(this));
    this.gameManager.registerCallback('pickTileResponseReceived', this.onPickTileResponse.bind(this));
  }
  
  private onGameSessionStarted(sessionData: GameSessionData): void {
    // Reset the board
    this.resetBoard();
  }
  
  private onPickTileResponse(data: PickTileResponse): void {
    if (data.hitMine) {
      // Show the mine that was hit
      if (data.mineTileIndex !== undefined) {
        this.revealMine(data.mineTileIndex);
      }
      
      // Show all other mines after a short delay
      setTimeout(() => {
        this.revealAllMines(data.minePositions);
      }, 500);
    } else {
      // Reveal the selected tile as a gem
      this.revealGem(data.tiles[data.tiles.length - 1]);
    }
  }
  
  private onTileClicked(tileIndex: number): void {
    // Check if we can pick this tile
    if (!this.gameManager.currentSession || this.gameManager.gameStatus !== GameStatusType.Active) {
      console.warn('Cannot pick tile: No active game session');
      return;
    }
    
    // Update the UI immediately to show selection
    this.tiles[tileIndex].drawSelectedTile();
    
    // Disable all tiles temporarily to prevent multiple clicks
    this.setTilesInteractive(false);
    
    // Make the API request
    this.gameManager.pickTile(tileIndex)
      .catch(error => {
        console.error('Error picking tile:', error);
        // Re-enable tiles if there was an error
        this.setTilesInteractive(true);
      });
  }
  
  private revealGem(tileIndex: number): void {
    if (tileIndex >= 0 && tileIndex < this.tiles.length) {
      this.tiles[tileIndex].revealGem();
    }
    
    // Re-enable tiles for interaction
    this.setTilesInteractive(true);
  }
  
  private revealMine(tileIndex: number): void {
    if (tileIndex >= 0 && tileIndex < this.tiles.length) {
      this.tiles[tileIndex].revealMine();
    }
  }
  
  private revealAllMines(minePositions: number[]): void {
    if (Array.isArray(minePositions)) {
      minePositions.forEach(mineIndex => {
        if (mineIndex >= 0 && mineIndex < this.tiles.length) {
          this.tiles[mineIndex].revealMine();
        }
      });
    }
  }
  
  public resetBoard(): void {
    // Reset all tiles
    this.tiles.forEach(tile => tile.reset());
    
    // Enable interaction
    this.setTilesInteractive(true);
  }
  
  private setTilesInteractive(interactive: boolean): void {
    this.tiles.forEach(tile => {
      if (!tile.isRevealed) {
        tile.eventMode = interactive ? 'static' : 'none';
        tile.cursor = interactive ? 'pointer' : 'default';
      }
    });
  }
}