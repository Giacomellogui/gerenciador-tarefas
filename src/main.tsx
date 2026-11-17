// StrictMode faz verificações extras em desenvolvimento, inclusive repetindo
// inicializações e ciclos de efeitos para ajudar a encontrar problemas.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Conecta o React à div de id="root" do index.html e exibe App dentro dela.
// O ! informa ao TypeScript que esse elemento existe; não o cria nem o valida.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
