import { App } from './App';
import './style.css';

// Create an immediately-invoked async function expression
(async () => {
  try {
    // Create the application
    new App();
  } catch (error) {
    console.error('Failed to start application:', error);
    
    // Show fallback error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Failed to start the application. Please check your browser compatibility.';
    
    document.body.appendChild(errorDiv);
  }
})();