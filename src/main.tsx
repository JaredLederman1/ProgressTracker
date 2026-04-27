import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';
import App from './App';
import './index.css';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast('A new version is available', {
      duration: Infinity,
      action: {
        label: 'Reload',
        onClick: () => updateSW(true),
      },
    });
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
