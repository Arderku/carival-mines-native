import * as PIXI from 'pixi.js';

/**
 * Creates an animated gradient background similar to the reference image
 * This class creates a subtle animation for the gradient to make it more dynamic
 */
export class GradientBackground extends PIXI.Container {
  private gradientSprite: PIXI.Sprite;
  private gradientTexture: PIXI.Texture;
  private animationSpeed: number = 0.0005;
  private time: number = 0;
  
  constructor(width: number, height: number) {
    super();
    
    // Create the gradient texture
    this.gradientTexture = this.createGradientTexture(width, height);
    
    // Create sprite to display the gradient
    this.gradientSprite = new PIXI.Sprite(this.gradientTexture);
    this.addChild(this.gradientSprite);
    
    // Add a semi-transparent overlay for better UI contrast
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.3);
    overlay.drawRect(0, 0, width, height);
    overlay.endFill();
    this.addChild(overlay);
  }
  
  /**
   * Creates a gradient texture with blue to purple to black
   */
  private createGradientTexture(width: number, height: number): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d')!;
    
    // Create blue to purple to black gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e6388');    // Blue
    gradient.addColorStop(0.4, '#55237a');  // Purple
    gradient.addColorStop(1, '#000000');    // Black
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add some noise for texture
    this.addNoise(ctx, width, height, 0.03);
    
    return PIXI.Texture.from(canvas);
  }
  
  /**
   * Adds subtle noise to the gradient for texture
   */
  private addNoise(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number): void {
    ctx.save();
    ctx.globalAlpha = opacity;
    
    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        const value = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgb(${value},${value},${value})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    
    ctx.restore();
  }
  
  /**
   * Update method to be called in the game loop
   */
  public update(delta: number): void {
    this.time += delta * this.animationSpeed;
    
    // Create subtle pulsing effect
    const scale = 1 + Math.sin(this.time) * 0.01;
    this.gradientSprite.scale.set(scale);
    
    // Ensure the sprite stays centered
    this.gradientSprite.x = (1 - scale) * this.gradientSprite.width / 2;
    this.gradientSprite.y = (1 - scale) * this.gradientSprite.height / 2;
  }
}