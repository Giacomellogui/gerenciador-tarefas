import type { Prioridade } from '../types/Tarefa';

// Cada uso fornece seu próprio ID, valor e função de atualização.
type SeletorPrioridadeProps = {
  id: string;
  valor: Prioridade;
  onChange: (prioridade: Prioridade) => void;
};

export default function SeletorPrioridade({
  id,
  valor,
  onChange,
}: SeletorPrioridadeProps) {
  return (
    <div className="campo-prioridade">
      <label htmlFor={id}>Prioridade</label>

      {/* Componente controlado: o pai guarda valor e recebe alterações via onChange. */}
      <select
        id={id}
        value={valor}
        onChange={(evento) => {
          const prioridade = evento.target.value;

          // Valida o texto recebido do HTML antes de enviá-lo ao componente pai.
          if (
            prioridade === 'baixa' ||
            prioridade === 'media' ||
            prioridade === 'alta'
          ) {
            onChange(prioridade);
          }
        }}
      >
        <option value="baixa">Baixa</option>
        <option value="media">Média</option>
        <option value="alta">Alta</option>
      </select>
    </div>
  );
}
