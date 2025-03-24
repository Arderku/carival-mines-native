import { Application, Container } from 'pixi.js';
import { GameScene } from './scenes/GameScene';

export class App {
  public app: Application;
  private gameScene: GameScene | null = null;
  
  constructor() {
    // Create the application instance
    this.app = new Application();
    
    // Initialize application
    this.init();
  }
  
  private async init(): Promise<void> {
    try {
      // Initialize the PIXI application
      await this.app.init({
        background: '#1a1a1a',
        resizeTo: window
      });
      
      // Append the canvas to the container
      document.getElementById('pixi-container')!.appendChild(this.app.canvas);
      
      // Create and initialize the game scene
      this.gameScene = new GameScene(this.app);
      this.app.stage.addChild(this.gameScene);
      
      // Set up the auth token (in a real app, this would come from your auth system)
      const authToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2QzMTdkM2VjNjdiZWY4OWZhMzdmYjAiLCJ0aWQiOiJtbnMiLCJmTmFtZSI6IlVuaXR5IiwibE5hbWUiOiJEZXZlbG9wZXIiLCJ1c2VybmFtZSI6IkFyZGVya3UiLCJ0Z1ByZW1pdW0iOmZhbHNlLCJpYXQiOjE3NDI3ODI1MTgsImV4cCI6MTc0Mjc4NjExOH0.h77Aderrm-xORgoJwJwP5pG9lm7s5IpNOUNAyniBz711Kk0iN60H63XntQUq0_0WYdrB_TyyiLOnTIycXAjJNDrfiio8TI_bMMa1cybXeUCIdTzP1JUrAP0UkUN3Kx8bzSn2XhGif_KH6tZDZPqGBS63YCszgrzzmBYYr3lxNgkbeo1GD8Oo41qGc44JvcFp6e1O1zS6bdaZVUn7ph8xzqWqOwx8BnQLeCx-9bEPYZ2j-O2nbmIJAqXO2dFJ9E5vb9dO_OucIjYxg__i2Fcbfcb-EHZRdxqBB2e2Iok3FQeDpflMYXNL8HYQVLmSlgOFjD7nV8gm8u48ZJMCE1jEYnaheVNVE2CL8CApebc2YiIQnIwUrJici8MwXRKaRVwtYhjF81DdjMR0tfuFZW6LAOaKtfkPPefdes7xPAbU5QDQZt936OwIb1qJmdXQGIvR-2zvZuc-qLldQwGTiQ063L9BVB5B8qRwtkSPixCTYRrzbIRlepa9znZ4B102SzQiem3W3eWhxbl2MoCXSx9u9gUYLMSCaXkJO1AgBKfkubIBCojp3XMtX1MVsMO-Kygk5m9YlabKcjmNyjMsL_MLqtM85X7Di3TC28F3ru8w1xKj6WyX4tYDaTW1f7j_9hPv28elEDbOMCB3LkK3iH_F5yegCFT4EpzRcgvjZY7Oop0';
      await this.gameScene.initialize(authToken);
      
      // Set up the game loop with the ticker
      this.app.ticker.add((time) => {
        if (this.gameScene) {
          this.gameScene.update(time.deltaTime);
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        if (this.gameScene) {
          this.gameScene.onResize();
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize the application:', error);
      this.showError('Failed to initialize the game. Please try again later.');
    }
  }
  
  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.color = '#FF0000';
    errorDiv.style.fontFamily = 'Arial, sans-serif';
    errorDiv.style.fontSize = '18px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.padding = '20px';
    errorDiv.style.background = 'rgba(0, 0, 0, 0.7)';
    errorDiv.style.borderRadius = '5px';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
  }
}