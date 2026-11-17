import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Configuração das ferramentas de desenvolvimento e da versão de produção.
export default defineConfig({
  // react processa os componentes; VitePWA gera manifesto e service worker no build.
  plugins: [react(), VitePWA({
    // A nova versão do service worker pode assumir o controle automaticamente.
    registerType: 'autoUpdate',
    // Arquivos de public que também precisam entrar no cache offline.
    includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
    // Metadados usados pelo navegador para instalar e apresentar o aplicativo.
    manifest: {
      name: 'Minhas tarefas',
      short_name: 'Tarefas',
      description: 'Organize seu dia, uma tarefa por vez.',
      lang: 'pt-BR',
      // Identidade, endereço inicial e caminho abrangido pelo aplicativo.
      id: '/',
      start_url: '/',
      scope: '/',
      // Abre como janela de aplicativo, sem a barra de navegação comum.
      display: 'standalone',
      theme_color: '#15161c',
      background_color: '#15161c',
      // Ícones em tamanhos diferentes; maskable permite recortes do sistema.
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    // Workbox prepara o cache dos arquivos gerados para uso offline.
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      // Usa a entrada do React como resposta às navegações atendidas pelo worker.
      navigateFallback: '/index.html',
    },
  })],
})
