// Restringe a prioridade aos três valores permitidos.
export type Prioridade = 'baixa' | 'media' | 'alta';

// Formato compartilhado pelos componentes.
export type Tarefa = {
  id: string;
  texto: string;
  concluida: boolean;
  prioridade?: Prioridade;
};