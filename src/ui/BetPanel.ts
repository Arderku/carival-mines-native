import * as PIXI from 'pixi.js';
import { GameManager } from '../managers/GameManager';
import { GameStatusType } from '../models/GameStatusType';
import { UserInfoData } from '../models/UserInfoData';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';
import { CashOutData } from '../models/CashOutData';

export class BetPanel extends PIXI.Container {
  private gameManager: GameManager;
  private panelWidth: number;
  private panelHeight: number;
  
  // Default bet values
  private betAmount: number;
  private mines: number;
  private balance: number;
  
  // UI elements
  private balanceText: PIXI.Text;
  private betAmountText: PIXI.Text;
  private minesText: PIXI.Text;
  private playButton: PIXI.Container;
  private actionButton: PIXI.Container; // Combined button for "Pick a Tile" and "Cash Out"
  private nextWinText: PIXI.Text;
  private hasPickedFirstTile: boolean = false;
  
  constructor(width: number = 300, height: number = 200) {
    super();
    
    this.gameManager = GameManager.getInstance();
    this.panelWidth = width;
    this.panelHeight = height;
    
    // Default bet values
    this.betAmount = 1.0;
    this.mines = 3;
    this.balance = 0;
    
    // Initialize UI elements - updated for PIXI v8 with Futura font
    this.balanceText = new PIXI.Text({
      text: '0.00',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.betAmountText = new PIXI.Text({
      text: '1.00',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.minesText = new PIXI.Text({
      text: '3',
      style: { 
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.playButton = this.createButton('PLAY', 0, 0, 120, 40, 0x44AA44);
    this.actionButton = this.createButton('PICK A TILE', 0, 0, 120, 40, 0x4444AA); 
    
    this.nextWinText = new PIXI.Text({
      text: 'Next win: 0.00',
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
    // Background panel
    const panel = new PIXI.Graphics();
    panel.beginFill(0x333333);
    panel.lineStyle(2, 0x555555);
    panel.drawRoundedRect(0, 0, this.panelWidth, this.panelHeight, 10);
    panel.endFill();
    this.addChild(panel);
    
    // Title
    const title = new PIXI.Text({
      text: 'BET CONTROLS',
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
    
    // Balance
    const balanceLabel = new PIXI.Text({
      text: 'Balance:',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fill: 0xCCCCCC
      }
    });
    balanceLabel.x = 10;
    balanceLabel.y = 40;
    this.addChild(balanceLabel);
    
    this.balanceText.x = 80;
    this.balanceText.y = 40;
    this.addChild(this.balanceText);
    
    // Bet Amount
    const betLabel = new PIXI.Text({
      text: 'Bet:',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fill: 0xCCCCCC
      }
    });
    betLabel.x = 10;
    betLabel.y = 70;
    this.addChild(betLabel);
    
    // Bet controls
    const decreaseBet = this.createButton('-', 80, 70, 25, 25);
    decreaseBet.on('pointerdown', () => this.adjustBet(-0.1));
    this.addChild(decreaseBet);
    
    this.betAmountText.x = 115;
    this.betAmountText.y = 70;
    this.addChild(this.betAmountText);
    
    const increaseBet = this.createButton('+', 160, 70, 25, 25);
    increaseBet.on('pointerdown', () => this.adjustBet(0.1));
    this.addChild(increaseBet);
    
    // Mines
    const minesLabel = new PIXI.Text({
      text: 'Mines:',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fill: 0xCCCCCC
      }
    });
    minesLabel.x = 10;
    minesLabel.y = 100;
    this.addChild(minesLabel);
    
    // Mines controls
    const decreaseMines = this.createButton('-', 80, 100, 25, 25);
    decreaseMines.on('pointerdown', () => this.adjustMines(-1));
    this.addChild(decreaseMines);
    
    this.minesText.x = 115;
    this.minesText.y = 100;
    this.addChild(this.minesText);
    
    const increaseMines = this.createButton('+', 160, 100, 25, 25);
    increaseMines.on('pointerdown', () => this.adjustMines(1));
    this.addChild(increaseMines);
    
    // Next win amount
    this.nextWinText.x = 10;
    this.nextWinText.y = 130;
    this.addChild(this.nextWinText);
    
    // Play button
    this.playButton.x = 10;
    this.playButton.y = 160;
    this.addChild(this.playButton);
    
    // Action button (initially hidden)
    this.actionButton.x = 10;
    this.actionButton.y = 160;
    this.actionButton.visible = false;
    this.addChild(this.actionButton);
  }
  
  private setupEventListeners(): void {
    // Listen for game events
    this.gameManager.registerCallback('userInfoUpdated', this.onUserInfoUpdated.bind(this));
    this.gameManager.registerCallback('gameSessionStarted', this.onGameSessionStarted.bind(this));
    this.gameManager.registerCallback('pickTileResponseReceived', this.onPickTileResponse.bind(this));
    this.gameManager.registerCallback('cashOutReceived', this.onCashOutReceived.bind(this));
    
    // Button event listeners
    this.playButton.on('pointerdown', this.onPlayButtonClicked.bind(this));
    this.actionButton.on('pointerdown', this.onActionButtonClicked.bind(this));
  }
  
  private onUserInfoUpdated(userInfo: UserInfoData): void {
    this.balance = userInfo.balance;
    this.updateBalanceText();
  }
  
  private onGameSessionStarted(sessionData: GameSessionData): void {
    // Update UI for active game
    this.playButton.visible = false;
    
    // Show "Pick a Tile" initially
    this.hasPickedFirstTile = false;
    this.updateActionButton();
    
    this.updateNextWinText(sessionData.nextWinAmount);
    this.updateBalanceText();
  }
  
  private onPickTileResponse(data: PickTileResponse): void {
    // Update the next win amount
    this.updateNextWinText(data.nextWinAmount);
    
    // If first tile picked, change button to "Cash Out"
    if (!this.hasPickedFirstTile && data.tiles.length > 0) {
      this.hasPickedFirstTile = true;
      this.updateActionButton();
    }
    
    // If the game ended, update UI
    if (data.hitMine || data.status === 'COMPLETED') {
      this.playButton.visible = true;
      this.actionButton.visible = false;
    }
  }
  
  private onCashOutReceived(): void {
    // Update UI for game ended
    this.playButton.visible = true;
    this.actionButton.visible = false;
    this.updateNextWinText(0);
    
    // Update balance
    if (this.gameManager.userInfo) {
      this.balance = this.gameManager.userInfo.balance;
      this.updateBalanceText();
    }
  }
  
  private onPlayButtonClicked(): void {
    // Start a new game
    this.gameManager.startGame(this.betAmount, this.mines)
      .catch(error => {
        console.error('Failed to start game:', error);
      });
  }
  
  private onActionButtonClicked(): void {
    // If we've picked the first tile, this is a cash out button
    if (this.hasPickedFirstTile) {
      this.gameManager.cashOut()
        .catch(error => {
          console.error('Failed to cash out:', error);
        });
    }
    // If we haven't picked the first tile, the button does nothing
    // (it just shows instruction text)
  }
  
  private updateActionButton(): void {
    // Show action button
    this.actionButton.visible = true;
    
    // Update text and color based on state
    if (this.hasPickedFirstTile) {
      // Change to "Cash Out" button
      this.updateButtonText(this.actionButton, 'CASH OUT');
      this.updateButtonColor(this.actionButton, 0xAA4444);
    } else {
      // "Pick a Tile" instruction
      this.updateButtonText(this.actionButton, 'PICK A TILE');
      this.updateButtonColor(this.actionButton, 0x4444AA);
    }
  }
  
  private updateButtonText(button: PIXI.Container, text: string): void {
    // Find the text object in the button container
    const textObject = button.children.find(child => child instanceof PIXI.Text) as PIXI.Text;
    if (textObject) {
      textObject.text = text;
    }
  }
  
  private updateButtonColor(button: PIXI.Container, color: number): void {
    // Find the background graphics in the button container
    const background = button.children.find(child => child instanceof PIXI.Graphics) as PIXI.Graphics;
    if (background) {
      background.clear();
      background.beginFill(color);
      background.lineStyle(2, 0x333333);
      background.drawRoundedRect(0, 0, (button as any).width || 120, (button as any).height || 40, 5);
      background.endFill();
    }
  }
  
  private adjustBet(amount: number): void {
    // Adjust bet amount but keep within reasonable limits
    this.betAmount = Math.max(0.1, Math.min(100, this.betAmount + amount));
    this.betAmount = Math.round(this.betAmount * 10) / 10; // Round to 1 decimal place
    this.betAmountText.text = this.betAmount.toFixed(2);
  }
  
  private adjustMines(amount: number): void {
    // Adjust mines but keep within reasonable limits (1-24 for a 5x5 board)
    this.mines = Math.max(1, Math.min(24, this.mines + amount));
    this.minesText.text = this.mines.toString();
  }
  
  private updateBalanceText(): void {
    this.balanceText.text = this.balance.toFixed(2);
  }
  
  private updateNextWinText(amount: number): void {
    this.nextWinText.text = `Next win: ${amount.toFixed(2)}`;
  }
  
  private createButton(
    label: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    color: number = 0x555555
  ): PIXI.Container {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;
    
    // Set width and height properties on the container
    (container as any).width = width;
    (container as any).height = height;
    
    // Button background
    const background = new PIXI.Graphics();
    background.beginFill(color);
    background.lineStyle(2, 0x333333);
    background.drawRoundedRect(0, 0, width, height, 5);
    background.endFill();
    container.addChild(background);
    
    // Button text
    const text = new PIXI.Text({
      text: label,
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = height / 2;
    container.addChild(text);
    
    // Make it interactive
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    // Add hover effect
    container.on('pointerover', () => {
      background.tint = 0xBBBBBB;
    });
    
    container.on('pointerout', () => {
      background.tint = 0xFFFFFF;
    });
    
    return container;
  }
}