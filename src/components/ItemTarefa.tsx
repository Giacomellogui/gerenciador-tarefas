// ../ sobe da pasta components para src e acessa o tipo compartilhado.
import type { Tarefa } from '../types/Tarefa';

// Dados e ações que o cartão recebe do App.
type ItemTarefaProps = {
  tarefa: Tarefa;
  onAlternar: (id: string) => void;
  onEditar: () => void;
  onExcluir: (id: string) => void;
};

export default function ItemTarefa({
  tarefa,
  onAlternar,
  onEditar,
  onExcluir,
}: ItemTarefaProps) {
  return (
    <>
      <label className="tarefa">
        <input
          type="checkbox"
          checked={tarefa.concluida}
          onChange={() => onAlternar(tarefa.id)}
        />

        <span className={tarefa.concluida ? 'concluida' : ''}>
          {tarefa.texto}
        </span>
      </label>

      {/* Recebe a função; ela só será executada quando houver clique. */}
      <button
        type="button"
        onClick={onEditar}
        aria-label={`Editar tarefa: ${tarefa.texto}`}
      >
        Editar
      </button>

      <button
        type="button"
        className="excluir"
        onClick={() => onExcluir(tarefa.id)}
        aria-label={`Excluir tarefa: ${tarefa.texto}`}
      >
        Excluir
      </button>
    </>
  );
}
