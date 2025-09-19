import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import App from './App.tsx';
import { SavedQuizzesPage } from '@/pages/savedQuizzes';

const root = createRoot(document.getElementById('root')!);

const render = () => {
  const hash = window.location.hash;
  if (hash === '#saved-quizzes') {
    root.render(
      <StrictMode>
        <SavedQuizzesPage />
      </StrictMode>
    );
    return;
  }
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

render();
window.addEventListener('hashchange', render);
