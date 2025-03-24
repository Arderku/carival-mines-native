import * as PIXI from 'pixi.js';

/**
 * Creates a simple, reliable gradient background that works with PIXI v8
 * Using the updated PIXI v8 Graphics API
 */
export class AnimatedGradientBackground extends PIXI.Container {
  private bgGraphics: PIXI.Graphics;
  private time: number = 0;
  private bgWidth: number;
  private bgHeight: number;
  
  constructor(width: number, height: number) {
    super();
    
    this.bgWidth = width;
    this.bgHeight = height;
    
    // Create a graphics object for drawing
    this.bgGraphics = new PIXI.Graphics();
    this.addChild(this.bgGraphics);
    
    // Initial draw
    this.draw(0);
  }
  
  /**
   * Draw the gradient background using a series of rectangle strips
   * Using PIXI v8 compliant methods
   */
  private draw(phase: number): void {
    // Make sure the graphics object exists
    if (!this.bgGraphics) return;
    
    const g = this.bgGraphics;
    g.clear();
    
    // Use many small rectangles for smoother gradients
    const steps = 100; // More steps = smoother gradient
    const stepHeight = this.bgHeight / steps;
    
    for (let i = 0; i < steps; i++) {
      // Position from 0 (top) to 1 (bottom)
      const t = i / steps;
      
      // Add a very subtle wave effect based on time
      const waveFactor = Math.sin(phase + t * Math.PI * 2) * 0.02;
      const adjustedT = Math.max(0, Math.min(1, t + waveFactor));
      
      // Calculate color
      let color;
      if (adjustedT < 0.4) {
        // Blue to purple (0 to 40%)
        const factor = adjustedT / 0.4;
        color = this.lerpColor(0x1e6388, 0x55237a, factor);
      } else {
        // Purple to black (40% to 100%)
        const factor = (adjustedT - 0.4) / 0.6;
        color = this.lerpColor(0x55237a, 0x000000, factor);
      }
      
      // Draw a thin rectangle - PIXI v8 style
      g.fill({ color: color });
      g.rect(0, i * stepHeight, this.bgWidth, stepHeight + 1); // +1 to avoid gaps
    }
    
    // Add a subtle glow effect at the top
    g.fill({ color: 0xFFFFFF, alpha: 0.05 });
    g.rect(0, 0, this.bgWidth, this.bgHeight * 0.2);
  }
  
  /**
   * Linear interpolation between two colors
   */
  private lerpColor(c1: number, c2: number, t: number): number {
    const r1 = (c1 >> 16) & 0xFF;
    const g1 = (c1 >> 8) & 0xFF;
    const b1 = c1 & 0xFF;
    
    const r2 = (c2 >> 16) & 0xFF;
    const g2 = (c2 >> 8) & 0xFF;
    const b2 = c2 & 0xFF;
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return (r << 16) | (g << 8) | b;
  }
  
  /**
   * Update method for animation
   */
  public update(delta: number): void {
    // Increment time for animation
    this.time += delta * 0.01;
    
    // Redraw with new phase
    this.draw(this.time);
  }
  
  /**
   * Handle resizing
   */
  public resize(width: number, height: number): void {
    this.bgWidth = width;
    this.bgHeight = height;
    
    // Redraw at new size
    this.draw(this.time);
  }
}