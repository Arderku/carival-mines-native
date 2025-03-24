import { Application, Container } from 'pixi.js';
import { GameScene } from './scenes/GameScene';

export class App {
  public app: Application;
  private gameScene: GameScene | null = null;
  private isMobile: boolean = false;
  
  constructor() {
    // Create the application instance
    this.app = new Application();
    
    // Check if running on mobile
    this.isMobile = this.checkIfMobile();
    
    // Initialize application
    this.init();
  }
  
  private checkIfMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || (window.innerWidth < 768);
  }
  
  private async init(): Promise<void> {
    try {
      // Show loading indicator
      this.showLoading();
      
      // Initialize the PIXI application with adaptive dimensions
      await this.app.init({
        background: '#1a1a1a',
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        hello: false // Disable the Pixi.js logo
      });
      
      // Append the canvas to the container
      document.getElementById('pixi-container')!.appendChild(this.app.canvas);
      
      
      // Create and initialize the game scene
      this.gameScene = new GameScene(this.app, this.isMobile);
      this.app.stage.addChild(this.gameScene);
      
      // Hide loading indicator
      this.hideLoading();
      
      // Set up the auth token (in a real app, this would come from your auth system)
      const authToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2N2QzMTdkM2VjNjdiZWY4OWZhMzdmYjAiLCJ0aWQiOiJtbnMiLCJmTmFtZSI6IlVuaXR5IiwibE5hbWUiOiJEZXZlbG9wZXIiLCJ1c2VybmFtZSI6IkFyZGVya3UiLCJ0Z1ByZW1pdW0iOmZhbHNlLCJpYXQiOjE3NDI3ODY0NzksImV4cCI6MTc0Mjc5MDA3OX0.c1Y1ihTpLWUCSzLlfx46lR1kui8K_rxQ6eeiHw3gr3B4TEqABpDd1kloTG5pqz_4R2y0Ne-fJtI80nUJOF4REdpvlfGuXcl7HiCJSAieL4pTuYoivCDgi5skogICt8CpihUt4AoWBJG4p6Vd0PNdYTpN9Q-8rPkGuz3dT9IpU8cQuAc0TcQCMkn0d_LAdQTTaQ9m90ZOVRzEPzJIN4JuB_T3ua4NM8AeoOWSuzkeA0HxaSshWysJx-JOqw-9j3dLcEcSlbW1tI5zKcCyzfd0oymNhO02X6uIUN4YQzGYyaPZiWh-RcZKqGqs_tdZwB3qysSdr0BBVD3KVxpTxecbkmbuLdOznsfpCQlDT-bM9UmIp1MU5tJ_-sT1TAImsIKNCmffRrR2Fi8vCCEnVjXVieM4vzKoBc7JkLwlawyvlDAQO-SrK-FLzntlKlIQDaRQNW005R7G9Y5QNJks8q369bynmGh6s8dqwxfLve0z9yVcifk1phIsqHvun0F7t8Vvk0Y1yi2Qhb3kLBXednuOeNbeSGTIaJ1p5thPuWRDn-5_E2EHkAInMAku1EDAtnn9fqVn4QXyvZlPOFWTaOdwVKKzW9afjPLvrlYsBIZhX7GPRq0cftD6_Wq06QfZnfsgykXxCF8zrbKoa4Pa1B24G1CB15SqoCQJmsfWe9dbaWg';
      await this.gameScene.initialize(authToken);
      
      // Set up the game loop with the ticker
      this.app.ticker.add((time) => {
        if (this.gameScene) {
          this.gameScene.update(time.deltaTime);
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', () => {
        this.handleResize();
      });
      
      // Initial resize
      this.handleResize();
      
    } catch (error) {
      console.error('Failed to initialize the application:', error);
      this.hideLoading();
      this.showError('Failed to initialize the game. Please try again later.');
    }
  }
  
  private handleResize(): void {
    // Check if mobile status has changed
    const wasMobile = this.isMobile;
    this.isMobile = this.checkIfMobile();
    
    // If mobile status changed, recreate the game scene
    if (wasMobile !== this.isMobile && this.gameScene) {
      const authToken = this.gameScene.getAuthToken();
      this.app.stage.removeChild(this.gameScene);
      this.gameScene = new GameScene(this.app, this.isMobile);
      this.app.stage.addChild(this.gameScene);
      this.gameScene.initialize(authToken);
    }
    
    // Resize renderer to match window
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    
    // Update game scene layout
    if (this.gameScene) {
      this.gameScene.onResize();
    }
  }
  
  private addLogo(): void {
    const logo = document.createElement('img');
    logo.src = 'assets/logo.svg';
    logo.alt = 'Casino Mines Logo';
    logo.className = 'game-logo';
    logo.style.position = 'absolute';
    logo.style.top = '10px';
    logo.style.left = '10px';
    logo.style.height = '40px';
    logo.style.zIndex = '100';
    document.body.appendChild(logo);
  }
  
  private showLoading(): void {
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'loading';
    loadingContainer.id = 'loading-container';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    const text = document.createElement('div');
    text.className = 'loading-text';
    text.textContent = 'Loading game...';
    
    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(text);
    document.body.appendChild(loadingContainer);
  }
  
  private hideLoading(): void {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
      loadingContainer.remove();
    }
  }
  
  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
  }
}