// Formato compartilhado pelos componentes que trabalham com tarefas.
// Usa .ts porque contém apenas TypeScript, sem interface JSX.
export type Tarefa = {
  id: string;
  texto: string;
  concluida: boolean;
};
