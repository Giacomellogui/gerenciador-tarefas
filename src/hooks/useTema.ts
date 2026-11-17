import { useEffect, useState } from 'react';

export type Tema = 'claro' | 'escuro';

export function useTema() {
  // Prioriza a escolha salva. Sem escolha, usa a preferência do sistema.
  const [tema, setTema] = useState<Tema>(() => {
    try {
      const salvo = localStorage.getItem('tema');
      if (salvo === 'claro' || salvo === 'escuro') return salvo;
    } catch {
      // Mesmo sem acesso ao armazenamento, ainda é possível trocar o tema.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  });

  useEffect(() => {
    // O atributo no HTML permite que o CSS aplique as cores à página inteira.
    document.documentElement.dataset.tema = tema;
    // Ajusta também a cor da barra do navegador onde houver suporte.
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', tema === 'escuro' ? '#141519' : '#f6f7f9'
    );
    try {
      localStorage.setItem('tema', tema);
    } catch {
      // Falha ao salvar a preferência não impede o uso do aplicativo.
    }
  }, [tema]);

  return { tema, setTema };
}
