import * as PIXI from 'pixi.js';

export class Tile extends PIXI.Container {
  public index: number;
  public size: number;
  public padding: number;
  public isRevealed: boolean;
  public isMine: boolean;
  public isSelected: boolean;
  
  private background: PIXI.Graphics;
  private content: PIXI.Container;
  
  constructor(index: number, size: number = 80, padding: number = 5) {
    super();
    
    this.index = index;
    this.size = size;
    this.padding = padding;
    this.isRevealed = false;
    this.isMine = false;
    this.isSelected = false;
    
    // Create the background
    this.background = new PIXI.Graphics();
    this.addChild(this.background);
    
    // Create the content container (for gem or mine)
    this.content = new PIXI.Container();
    this.addChild(this.content);
    
    // Set up initial state
    this.drawCoveredTile();
    
    // Make it interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', this.onTileClick.bind(this));
  }
  
  private onTileClick(): void {
    if (!this.isRevealed && !this.isSelected) {
      this.emit('tileClicked', this.index);
    }
  }
  
  public drawCoveredTile(): void {
    const { size, padding } = this;
    
    this.background.clear();
    this.background.beginFill(0x555555);
    this.background.lineStyle(2, 0x333333);
    this.background.drawRoundedRect(padding, padding, size - padding * 2, size - padding * 2, 10);
    this.background.endFill();
    
    // Add some depth effect
    this.background.beginFill(0x444444);
    this.background.lineStyle(0);
    this.background.drawRoundedRect(padding + 3, padding + 3, size - padding * 2 - 6, size - padding * 2 - 6, 8);
    this.background.endFill();
  }
  
  public drawSelectedTile(): void {
    const { size, padding } = this;
    
    this.isSelected = true;
    
    this.background.clear();
    this.background.beginFill(0x222222);
    this.background.lineStyle(2, 0x333333);
    this.background.drawRoundedRect(padding, padding, size - padding * 2, size - padding * 2, 10);
    this.background.endFill();
  }
  
  public revealGem(): void {
    this.isRevealed = true;
    this.isMine = false;
    
    // Draw selected background
    this.drawSelectedTile();
    
    // Clear previous content
    this.content.removeChildren();
    
    // Create gem
    const gem = new PIXI.Graphics();
    gem.beginFill(0x00FFFF);
    gem.lineStyle(1, 0x00CCCC);
    
    // Draw a diamond shape
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const gemSize = this.size / 3;
    
    gem.moveTo(centerX, centerY - gemSize);
    gem.lineTo(centerX + gemSize, centerY);
    gem.lineTo(centerX, centerY + gemSize);
    gem.lineTo(centerX - gemSize, centerY);
    gem.lineTo(centerX, centerY - gemSize);
    
    gem.endFill();
    
    // Add some shine
    gem.beginFill(0xFFFFFF, 0.7);
    gem.lineStyle(0);
    gem.drawCircle(centerX - gemSize / 3, centerY - gemSize / 3, gemSize / 5);
    gem.endFill();
    
    this.content.addChild(gem);
  }
  
  public revealMine(): void {
    this.isRevealed = true;
    this.isMine = true;
    
    // Draw exploded background
    const { size, padding } = this;
    this.background.clear();
    this.background.beginFill(0xFF3333);
    this.background.lineStyle(2, 0x990000);
    this.background.drawRoundedRect(padding, padding, size - padding * 2, size - padding * 2, 10);
    this.background.endFill();
    
    // Clear previous content
    this.content.removeChildren();
    
    // Create mine
    const mine = new PIXI.Graphics();
    const centerX = this.size / 2;
    const centerY = this.size / 2;
    const mineSize = this.size / 4;
    
    // Main body of mine
    mine.beginFill(0x333333);
    mine.lineStyle(1, 0x000000);
    mine.drawCircle(centerX, centerY, mineSize);
    mine.endFill();
    
    // Spikes
    const spikeLength = mineSize / 1.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const startX = centerX + Math.cos(angle) * mineSize;
      const startY = centerY + Math.sin(angle) * mineSize;
      const endX = centerX + Math.cos(angle) * (mineSize + spikeLength);
      const endY = centerY + Math.sin(angle) * (mineSize + spikeLength);
      
      mine.lineStyle(2, 0x000000);
      mine.moveTo(startX, startY);
      mine.lineTo(endX, endY);
    }
    
    // Highlight
    mine.beginFill(0x666666, 0.5);
    mine.lineStyle(0);
    mine.drawCircle(centerX - mineSize / 3, centerY - mineSize / 3, mineSize / 3);
    mine.endFill();
    
    this.content.addChild(mine);
  }
  
  public reset(): void {
    this.isRevealed = false;
    this.isMine = false;
    this.isSelected = false;
    this.content.removeChildren();
    this.drawCoveredTile();
    this.eventMode = 'static';
  }
}