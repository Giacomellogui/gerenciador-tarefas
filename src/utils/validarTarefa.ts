import type { Tarefa } from '../types/Tarefa';

// Exporta a validação para ser usada no armazenamento e na importação.
// unknown exige verificações; "valor is Tarefa" refina o tipo quando retorna true.
export function ehTarefa(valor: unknown): valor is Tarefa {
  // null também tem typeof "object", por isso precisa ser rejeitado à parte.
  if (typeof valor !== 'object' || valor === null) return false;

  // Confere as propriedades em execução; tarefas antigas podem não ter prioridade.
  return (
    // in confere a presença; typeof verifica o tipo de cada propriedade obrigatória.
    'id' in valor &&
    typeof valor.id === 'string' &&
    'texto' in valor &&
    typeof valor.texto === 'string' &&
    'concluida' in valor &&
    typeof valor.concluida === 'boolean' &&
    // O status é opcional para manter compatibilidade com dados anteriores ao Kanban.
    (!('status' in valor) || valor.status === 'afazer' ||
      valor.status === 'andamento' || valor.status === 'concluida') &&
    (
      // Ausência é aceita para manter compatibilidade com tarefas antigas.
      !('prioridade' in valor) ||
      valor.prioridade === 'baixa' ||
      valor.prioridade === 'media' ||
      valor.prioridade === 'alta'
    )
  );
}
