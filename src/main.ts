import { App } from './App';
//import './styles.css';

// Create an immediately-invoked async function expression
(async () => {
  try {
    // Create the application
    new App();
  } catch (error) {
    console.error('Failed to start application:', error);
    
    // Show fallback error message
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
    errorDiv.textContent = 'Failed to start the application. Please check your browser compatibility.';
    
    document.body.appendChild(errorDiv);
  }
})();