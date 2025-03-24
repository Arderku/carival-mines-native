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
  private isPortrait: boolean;
  
  // Bet values
  private betAmount: number = 1.0;
  private mines: number = 3;
  private minBetAmount: number = 0.1;
  private maxBetAmount: number = 100;
  private minMines: number = 1;
  private maxMines: number = 24;
  private balance: number = 0;
  
  // UI elements
  private background!: PIXI.Graphics;
  private balanceText!: PIXI.Text;
  private betInputField!: PIXI.Container;
  private betInputText!: PIXI.Text;
  private minesSlider!: PIXI.Container;
  private sliderTrack!: PIXI.Graphics;
  private sliderHandle!: PIXI.Graphics;
  private minesValueText!: PIXI.Text;
  private playButton!: PIXI.Container;
  private cashOutButton!: PIXI.Container;
  private nextWinText!: PIXI.Text;
  
  // For slider interaction
  private sliderDragging: boolean = false;
  private hasPickedFirstTile: boolean = false;
  
  constructor(width: number = 300, height: number = 200, isPortrait: boolean = true) {
    super();
    
    this.gameManager = GameManager.getInstance();
    this.panelWidth = width;
    this.panelHeight = height;
    this.isPortrait = isPortrait;
    
    // Create panel
    this.createPanel();
    this.setupEventListeners();
  }
  
  public resize(width: number, height: number): void {
    this.panelWidth = width;
    this.panelHeight = height;
    
    // Redraw the panel with new dimensions
    this.removeChildren();
    this.createPanel();
  }
  
  private createPanel(): void {
    // Background panel with gradient
    this.background = new PIXI.Graphics();
    this.background.beginFill(0x333333, 0.9);
    this.background.lineStyle(2, 0xE72264);
    this.background.drawRoundedRect(0, 0, this.panelWidth, this.panelHeight, 15);
    this.background.endFill();
    this.addChild(this.background);
    
    // Balance display at top
    this.balanceText = new PIXI.Text({
      text: `Balance: ${this.balance.toFixed(2)}`,
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    this.balanceText.x = 15;
    this.balanceText.y = 15;
    this.addChild(this.balanceText);
    
    if (this.isPortrait) {
      this.createPortraitLayout();
    } else {
      this.createLandscapeLayout();
    }
  }
  
  private createPortraitLayout(): void {
    // More compact layout for bet panel in portrait mode
    
    // Create bet input field with less vertical spacing
    this.createBetInputField(
      15, 
      this.balanceText.y + this.balanceText.height + 8,
      this.panelWidth - 30,
      40
    );
    
    // Create mines slider with less vertical spacing
    this.createMinesSlider(
      15,
      this.betInputField.y + this.betInputField.height + 5,
      this.panelWidth - 30,
      35
    );
    
    // Next win display
    this.nextWinText = new PIXI.Text({
      text: 'Next Win: 0.00',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    this.nextWinText.x = 15;
    this.nextWinText.y = this.minesSlider.y + this.minesSlider.height + 5;
    this.addChild(this.nextWinText);
    
    // Create play button - ensure it fits
    this.playButton = this.createButton(
      'PLAY',
      15,
      this.nextWinText.y + this.nextWinText.height + 5,
      this.panelWidth - 30,
      45,
      0x44AA44
    );
    this.addChild(this.playButton);
    
    // Create cash out button (initially hidden)
    this.cashOutButton = this.createButton(
      'CASH OUT',
      15,
      this.nextWinText.y + this.nextWinText.height + 5,
      this.panelWidth - 30,
      45,
      0xE72264
    );
    this.cashOutButton.visible = false;
    this.addChild(this.cashOutButton);
  }
  
  private createLandscapeLayout(): void {
    // Create bet input field (narrower in landscape)
    this.createBetInputField(
      15, 
      this.balanceText.y + this.balanceText.height + 25,
      this.panelWidth - 30,
      50
    );
    
    // Create mines slider (longer in landscape)
    this.createMinesSlider(
      15,
      this.betInputField.y + 80,
      this.panelWidth - 30,
      50
    );
    
    // Next win display
    this.nextWinText = new PIXI.Text({
      text: 'Next Win: 0.00',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    this.nextWinText.x = 15;
    this.nextWinText.y = this.minesSlider.y + this.minesSlider.height + 25;
    this.addChild(this.nextWinText);
    
    // Create play button
    this.playButton = this.createButton(
      'PLAY',
      15,
      this.nextWinText.y + this.nextWinText.height + 25,
      this.panelWidth - 30,
      60,
      0x44AA44
    );
    this.addChild(this.playButton);
    
    // Create cash out button (initially hidden)
    this.cashOutButton = this.createButton(
      'CASH OUT',
      15,
      this.nextWinText.y + this.nextWinText.height + 25,
      this.panelWidth - 30,
      60,
      0xE72264
    );
    this.cashOutButton.visible = false;
    this.addChild(this.cashOutButton);
  }
  
  private createBetInputField(x: number, y: number, width: number, height: number): void {
    // Create a container for the bet input
    this.betInputField = new PIXI.Container();
    this.betInputField.x = x;
    this.betInputField.y = y;
    this.addChild(this.betInputField);
    
    // Input field label
    const betLabel = new PIXI.Text({
      text: 'BET AMOUNT',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fill: 0xCCCCCC
      }
    });
    betLabel.x = 0;
    betLabel.y = 0;
    this.betInputField.addChild(betLabel);
    
    // Input field background
    const inputBackground = new PIXI.Graphics();
    inputBackground.beginFill(0x222222);
    inputBackground.lineStyle(2, 0x444444);
    inputBackground.drawRoundedRect(0, betLabel.height + 5, width, height, 10);
    inputBackground.endFill();
    this.betInputField.addChild(inputBackground);
    
    // Input field text
    this.betInputText = new PIXI.Text({
      text: this.betAmount.toFixed(2),
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    this.betInputText.x = width / 2 - this.betInputText.width / 2;
    this.betInputText.y = betLabel.height + 5 + height / 2 - this.betInputText.height / 2;
    this.betInputField.addChild(this.betInputText);
    
    // Minus button
    const minusButton = this.createCircleButton(
      '-', 
      20, 
      betLabel.height + 5 + height / 2, 
      20
    );
    minusButton.on('pointerdown', () => this.adjustBet(-0.1));
    this.betInputField.addChild(minusButton);
    
    // Plus button
    const plusButton = this.createCircleButton(
      '+', 
      width - 20, 
      betLabel.height + 5 + height / 2, 
      20
    );
    plusButton.on('pointerdown', () => this.adjustBet(0.1));
    this.betInputField.addChild(plusButton);
    
    // Make the input field interactive
    inputBackground.eventMode = 'static';
    inputBackground.cursor = 'pointer';
    inputBackground.on('pointerdown', () => this.showNumericInput());
  }
  
  private createMinesSlider(x: number, y: number, width: number, height: number): void {
    // Create slider container
    this.minesSlider = new PIXI.Container();
    this.minesSlider.x = x;
    this.minesSlider.y = y;
    this.addChild(this.minesSlider);
    
    // Slider label
    const minesLabel = new PIXI.Text({
      text: 'MINES',
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 14,
        fill: 0xCCCCCC
      }
    });
    minesLabel.x = 0;
    minesLabel.y = 0;
    this.minesSlider.addChild(minesLabel);
    
    // Mines value text - fixed position
    this.minesValueText = new PIXI.Text({
      text: this.mines.toString(),
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    // Set a fixed position at the right side of the slider
    this.minesValueText.anchor.set(0, 0); // Anchor at top-left
    this.minesValueText.x = width - 30; // Fixed position from right
    this.minesValueText.y = 0;
    this.minesSlider.addChild(this.minesValueText);
    
    // Create slider track
    this.sliderTrack = new PIXI.Graphics();
    this.sliderTrack.beginFill(0x222222);
    this.sliderTrack.lineStyle(2, 0x444444);
    this.sliderTrack.drawRoundedRect(0, minesLabel.height + 10, width, 10, 5);
    this.sliderTrack.endFill();
    this.minesSlider.addChild(this.sliderTrack);
    
    // Min/max labels
    const minLabel = new PIXI.Text({
      text: this.minMines.toString(),
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 12,
        fill: 0xAAAAAA
      }
    });
    minLabel.x = 0;
    minLabel.y = minesLabel.height + 25;
    this.minesSlider.addChild(minLabel);
    
    const maxLabel = new PIXI.Text({
      text: this.maxMines.toString(),
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 12,
        fill: 0xAAAAAA
      }
    });
    maxLabel.x = width - maxLabel.width;
    maxLabel.y = minesLabel.height + 25;
    this.minesSlider.addChild(maxLabel);
    
    // Create slider handle
    this.sliderHandle = new PIXI.Graphics();
    this.sliderHandle.beginFill(0xE72264);
    this.sliderHandle.drawCircle(0, 0, 12);
    this.sliderHandle.endFill();
    
    // Position handle based on current mines value
    const handleX = this.mapValueToPosition(
      this.mines,
      this.minMines,
      this.maxMines,
      12,
      width - 12
    );
    
    this.sliderHandle.x = handleX;
    this.sliderHandle.y = minesLabel.height + 15;
    this.minesSlider.addChild(this.sliderHandle);
    
    // Make handle interactive
    this.sliderHandle.eventMode = 'static';
    this.sliderHandle.cursor = 'pointer';
    this.sliderHandle.on('pointerdown', this.onSliderHandleDown.bind(this));
    this.sliderHandle.on('globalpointermove', this.onSliderHandleMove.bind(this));
    this.sliderHandle.on('pointerup', this.onSliderHandleUp.bind(this));
    this.sliderHandle.on('pointerupoutside', this.onSliderHandleUp.bind(this));
    
    // Make track interactive for direct clicking
    this.sliderTrack.eventMode = 'static';
    this.sliderTrack.cursor = 'pointer';
    this.sliderTrack.on('pointerdown', this.onSliderTrackClick.bind(this));
  }
  
  private onSliderHandleDown(): void {
    this.sliderDragging = true;
  }
  
  private onSliderHandleMove(event: PIXI.FederatedPointerEvent): void {
    if (!this.sliderDragging) return;
    
    const localPos = this.sliderTrack.toLocal(event.global);
    this.updateSliderFromPosition(localPos.x);
  }
  
  private onSliderHandleUp(): void {
    this.sliderDragging = false;
  }
  
  private onSliderTrackClick(event: PIXI.FederatedPointerEvent): void {
    const localPos = this.sliderTrack.toLocal(event.global);
    this.updateSliderFromPosition(localPos.x);
  }
  
  private updateSliderFromPosition(x: number): void {
    // Clamp position to track boundaries
    const trackWidth = this.panelWidth - 30;
    const minX = 12;
    const maxX = trackWidth - 12;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    
    // Move the handle
    this.sliderHandle.x = clampedX;
    
    // Update mines value based on handle position
    this.mines = Math.round(
      this.mapPositionToValue(clampedX, minX, maxX, this.minMines, this.maxMines)
    );
    
    // Update only the text content, not the position
    this.minesValueText.text = this.mines.toString();
  }
  
  private mapValueToPosition(value: number, minValue: number, maxValue: number, minPos: number, maxPos: number): number {
    return minPos + (maxPos - minPos) * (value - minValue) / (maxValue - minValue);
  }
  
  private mapPositionToValue(position: number, minPos: number, maxPos: number, minValue: number, maxValue: number): number {
    return minValue + (maxValue - minValue) * (position - minPos) / (maxPos - minPos);
  }
  
  private createCircleButton(label: string, x: number, y: number, radius: number): PIXI.Container {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;
    
    // Button background
    const background = new PIXI.Graphics();
    background.beginFill(0x444444);
    background.lineStyle(1, 0x666666);
    background.drawCircle(0, 0, radius);
    background.endFill();
    container.addChild(background);
    
    // Button text
    const text = new PIXI.Text({
      text: label,
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xFFFFFF
      }
    });
    text.anchor.set(0.5);
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
    background.drawRoundedRect(0, 0, width, height, 10);
    background.endFill();
    container.addChild(background);
    
    // Button text
    const text = new PIXI.Text({
      text: label,
      style: {
        fontFamily: 'Plus Jakarta Sans, Futura, Avenir, Arial, sans-serif',
        fontSize: 20,
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
  
  private showNumericInput(): void {
    // In a real implementation, this would show a custom numeric input
    // For now, we'll use browser's prompt
    const input = prompt('Enter bet amount:', this.betAmount.toString());
    if (input !== null) {
      const amount = parseFloat(input);
      if (!isNaN(amount)) {
        this.betAmount = Math.max(this.minBetAmount, Math.min(this.maxBetAmount, amount));
        this.updateBetInputText();
      }
    }
  }
  
  private adjustBet(amount: number): void {
    this.betAmount = Math.max(
      this.minBetAmount, 
      Math.min(this.maxBetAmount, this.betAmount + amount)
    );
    
    // Round to 2 decimal places
    this.betAmount = Math.round(this.betAmount * 100) / 100;
    
    this.updateBetInputText();
  }
  
  private updateBetInputText(): void {
    if (this.betInputText) {
      this.betInputText.text = this.betAmount.toFixed(2);
      // Center the text
      const parentWidth = this.panelWidth - 30;
      this.betInputText.x = parentWidth / 2 - this.betInputText.width / 2;
    }
  }
  
  private setupEventListeners(): void {
    // Listen for game events
    this.gameManager.registerCallback('userInfoUpdated', this.onUserInfoUpdated.bind(this));
    this.gameManager.registerCallback('gameSessionStarted', this.onGameSessionStarted.bind(this));
    this.gameManager.registerCallback('pickTileResponseReceived', this.onPickTileResponse.bind(this));
    this.gameManager.registerCallback('cashOutReceived', this.onCashOutReceived.bind(this));
    
    // Button event listeners
    this.playButton.on('pointerdown', this.onPlayButtonClicked.bind(this));
    this.cashOutButton.on('pointerdown', this.onCashOutButtonClicked.bind(this));
  }
  
  private onUserInfoUpdated(userInfo: UserInfoData): void {
    this.balance = userInfo.balance;
    this.balanceText.text = `Balance: ${this.balance.toFixed(2)}`;
    
    // Update min/max values from user data if available
    if (userInfo.config) {
      if (userInfo.config.minBetAmount !== undefined) {
        this.minBetAmount = userInfo.config.minBetAmount;
      }
      if (userInfo.config.maxBetAmount !== undefined) {
        this.maxBetAmount = userInfo.config.maxBetAmount;
      }
      if (userInfo.config.minMines !== undefined) {
        this.minMines = userInfo.config.minMines;
      }
      if (userInfo.config.maxMines !== undefined) {
        this.maxMines = userInfo.config.maxMines;
      }
    }
  }
  
  private onGameSessionStarted(sessionData: GameSessionData): void {
    // Update UI for active game
    this.playButton.visible = false;
    this.cashOutButton.visible = true;
    this.hasPickedFirstTile = false;
    
    // Update display
    this.updateNextWinText(sessionData.nextWinAmount);
    this.balanceText.text = `Balance: ${sessionData.remainingBalance.toFixed(2)}`;
  }
  
  private onPickTileResponse(data: PickTileResponse): void {
    // Update next win amount
    this.updateNextWinText(data.nextWinAmount);
    
    // First tile picked
    if (!this.hasPickedFirstTile && data.tiles.length > 0) {
      this.hasPickedFirstTile = true;
    }
    
    // Game ended?
    if (data.hitMine || data.status === 'COMPLETED') {
      this.playButton.visible = true;
      this.cashOutButton.visible = false;
    }
  }
  
  private onCashOutReceived(data: CashOutData): void {
    // Update UI for game ended
    this.playButton.visible = true;
    this.cashOutButton.visible = false;
    this.updateNextWinText(0);
    
    // Update balance
    if (this.gameManager.userInfo) {
      this.balance = this.gameManager.userInfo.balance;
      this.balanceText.text = `Balance: ${this.balance.toFixed(2)}`;
    }
  }
  
  private onPlayButtonClicked(): void {
    // Start a new game
    this.gameManager.startGame(this.betAmount, this.mines)
      .catch(error => {
        console.error('Failed to start game:', error);
      });
  }
  
  private onCashOutButtonClicked(): void {
    // Only allow cash out after first tile is picked
    if (this.hasPickedFirstTile) {
      this.gameManager.cashOut()
        .catch(error => {
          console.error('Failed to cash out:', error);
        });
    }
  }
  
  private updateNextWinText(amount: number): void {
    this.nextWinText.text = `Next Win: ${amount.toFixed(2)}`;
  }
}