// Restringe a prioridade aos três valores permitidos.
export type Prioridade = 'baixa' | 'media' | 'alta';
// Etapas do quadro. Opcional nas tarefas para aceitar backups antigos.
export type StatusTarefa = 'afazer' | 'andamento' | 'concluida';

// Formato compartilhado pelos componentes.
export type Tarefa = {
  id: string;
  texto: string;
  concluida: boolean;
  prioridade?: Prioridade;
  status?: StatusTarefa;
};

// Usa o booleano antigo como fonte da conclusão e preserva a etapa intermediária.
export function obterStatus(tarefa: Tarefa): StatusTarefa {
  if (tarefa.concluida) return 'concluida';
  return tarefa.status === 'andamento' ? 'andamento' : 'afazer';
}
