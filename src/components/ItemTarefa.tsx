// ../ sobe da pasta components para src e acessa o tipo compartilhado.
import { obterStatus } from '../types/Tarefa';
import type { StatusTarefa, Tarefa } from '../types/Tarefa';

// Dados e ações que o cartão recebe do App.
type ItemTarefaProps = {
  tarefa: Tarefa;
  onAlternar: (id: string) => void;
  onEditar: () => void;
  onExcluir: (id: string) => void;
  onMover: (id: string, status: StatusTarefa) => void;
};

export default function ItemTarefa({
  tarefa,
  onAlternar,
  onEditar,
  onExcluir,
  onMover,
}: ItemTarefaProps) {
  // ?? usa média nas tarefas antigas, que ainda não possuem essa propriedade.
  const prioridade = tarefa.prioridade ?? 'media';
  // Separa os valores usados no código dos textos apresentados na tela.
  const nomesPrioridade = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };

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

      <div className="metadados-cartao">
      {/* A etiqueta mantém o nome da prioridade, além da diferença de cor. */}
      <span className={`prioridade prioridade-${prioridade}`} title={`Prioridade ${nomesPrioridade[prioridade]}`}>
        <span aria-hidden="true" />{nomesPrioridade[prioridade]}
      </span>
      {/* O seletor também permite mover cartões por teclado e em telas de toque. */}
      <label className="mover-tarefa">
        <span className="somente-leitor">Mover tarefa para</span>
        <select value={obterStatus(tarefa)} onChange={(evento) => {
          const status = evento.target.value;
          if (status === 'afazer' || status === 'andamento' || status === 'concluida') {
            onMover(tarefa.id, status);
          }
        }}>
          <option value="afazer">A fazer</option>
          <option value="andamento">Em andamento</option>
          <option value="concluida">Concluídas</option>
        </select>
      </label>
      </div>
      <div className="acoes-cartao">
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
      </div>
    </>
  );
}
