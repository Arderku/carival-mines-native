import * as PIXI from 'pixi.js';
import { GameManager } from '../managers/GameManager';
import { GameStatusType } from '../models/GameStatusType';
import { UserInfoData } from '../models/UserInfoData';
import { GameSessionData } from '../models/GameSessionData';
import { PickTileResponse } from '../models/PickTileResponse';

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
  private cashoutButton: PIXI.Container;
  private nextWinText: PIXI.Text;
  
  constructor(width: number = 300, height: number = 200) {
    super();
    
    this.gameManager = GameManager.getInstance();
    this.panelWidth = width;
    this.panelHeight = height;
    
    // Default bet values
    this.betAmount = 1.0;
    this.mines = 3;
    this.balance = 0;
    
    // Initialize UI elements - updated for PIXI v8
    this.balanceText = new PIXI.Text({
      text: '0.00',
      style: { 
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.betAmountText = new PIXI.Text({
      text: '1.00',
      style: { 
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.minesText = new PIXI.Text({
      text: '3',
      style: { 
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF 
      }
    });
    
    this.playButton = this.createButton('PLAY', 0, 0, 120, 40, 0x44AA44);
    this.cashoutButton = this.createButton('CASHOUT', 0, 0, 120, 40, 0xAA4444);
    
    this.nextWinText = new PIXI.Text({
      text: 'Next win: 0.00',
      style: { 
        fontFamily: 'Arial',
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
    const title = new PIXI.Text('BET CONTROLS', {
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xFFFFFF
    });
    title.x = 10;
    title.y = 10;
    this.addChild(title);
    
    // Balance
    const balanceLabel = new PIXI.Text('Balance:', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xCCCCCC
    });
    balanceLabel.x = 10;
    balanceLabel.y = 40;
    this.addChild(balanceLabel);
    
    this.balanceText.x = 80;
    this.balanceText.y = 40;
    this.addChild(this.balanceText);
    
    // Bet Amount
    const betLabel = new PIXI.Text('Bet:', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xCCCCCC
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
    const minesLabel = new PIXI.Text('Mines:', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xCCCCCC
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
    
    // Cashout button (initially hidden)
    this.cashoutButton.x = 140;
    this.cashoutButton.y = 160;
    this.cashoutButton.visible = false;
    this.addChild(this.cashoutButton);
  }
  
  private setupEventListeners(): void {
    // Listen for game events
    this.gameManager.registerCallback('userInfoUpdated', this.onUserInfoUpdated.bind(this));
    this.gameManager.registerCallback('gameSessionStarted', this.onGameSessionStarted.bind(this));
    this.gameManager.registerCallback('pickTileResponseReceived', this.onPickTileResponse.bind(this));
    this.gameManager.registerCallback('cashOutReceived', this.onCashOutReceived.bind(this));
    
    // Button event listeners
    this.playButton.on('pointerdown', this.onPlayButtonClicked.bind(this));
    this.cashoutButton.on('pointerdown', this.onCashoutButtonClicked.bind(this));
  }
  
  private onUserInfoUpdated(userInfo: UserInfoData): void {
    this.balance = userInfo.balance;
    this.updateBalanceText();
  }
  
  private onGameSessionStarted(sessionData: GameSessionData): void {
    // Update UI for active game
    this.playButton.visible = false;
    this.cashoutButton.visible = true;
    this.updateNextWinText(sessionData.nextWinAmount);
    this.updateBalanceText();
  }
  
  private onPickTileResponse(data: PickTileResponse): void {
    // Update the next win amount
    this.updateNextWinText(data.nextWinAmount);
    
    // If the game ended, update UI
    if (data.hitMine || data.status === 'COMPLETED') {
      this.playButton.visible = true;
      this.cashoutButton.visible = false;
    }
  }
  
  private onCashOutReceived(): void {
    // Update UI for game ended
    this.playButton.visible = true;
    this.cashoutButton.visible = false;
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
  
  private onCashoutButtonClicked(): void {
    // Cash out current game
    this.gameManager.cashOut()
      .catch(error => {
        console.error('Failed to cash out:', error);
      });
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
    
    // Button background
    const background = new PIXI.Graphics();
    background.beginFill(color);
    background.lineStyle(2, 0x333333);
    background.drawRoundedRect(0, 0, width, height, 5);
    background.endFill();
    container.addChild(background);
    
    // Button text
    const text = new PIXI.Text(label, {
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xFFFFFF
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