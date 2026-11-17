import { useEffect, useState } from "react";
import type { Tarefa } from "../types/Tarefa";

// Reutiliza a validação do arquivo utils, sem duplicar sua implementação.
import { ehTarefa } from '../utils/validarTarefa';

// Hooks personalizados começam com "use" e podem chamar outros hooks.
export function useTarefas() {
  // A função inicializadora carrega a lista ao iniciar o estado, não a cada render.
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    try {
      // Dados locais deste navegador e origem; não sincroniza PC e celular.
      const salvas = localStorage.getItem("tarefas");

      // Sem dados salvos, a primeira lista é vazia.
      if (!salvas) return [];

      // Converte o texto e verifica se o resultado é uma lista.
      const dados: unknown = JSON.parse(salvas);

      if (!Array.isArray(dados)) return [];

      // Diferentemente da importação, aqui filtra itens inválidos individualmente.
      // A lista filtrada será gravada pelo efeito abaixo.
      return dados.filter(ehTarefa);
    } catch {
      // Falhas de acesso ou JSON malformado fazem o estado começar vazio.
      return [];
    }
  });

  // Executa após a montagem e quando a referência de tarefas muda.
  // JSON.stringify transforma a lista em texto, formato aceito por localStorage.
  useEffect(() => {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  // Disponibiliza a lista e sua função de atualização ao componente.
  return { tarefas, setTarefas };
}
