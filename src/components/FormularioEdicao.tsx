import SeletorPrioridade from './SeletorPrioridade';
import type { FormEvent } from 'react';
import type { Prioridade } from '../types/Tarefa';

// O App fornece os valores e as funções que alteram o rascunho.
type FormularioEdicaoProps = {
    id: string;
    texto: string;
    prioridade: Prioridade;
    onTextoChange: (texto: string) => void;
    onPrioridadeChange: (prioridade: Prioridade) => void;
    onSalvar: (evento: FormEvent<HTMLFormElement>) => void;
    onCancelar: () => void;
};

export default function FormularioEdicao({
    id,
    texto,
    prioridade,
    onTextoChange,
    onPrioridadeChange,
    onSalvar,
    onCancelar,
}: FormularioEdicaoProps) {
    return (
        <form className="edicao" onSubmit={onSalvar}>
            <label htmlFor={`editar-${id}`}>Editar tarefa</label>

            {/* Os valores continuam guardados no App. */}
            <input
                id={`editar-${id}`}
                autoFocus
                value={texto}
                onChange={(evento) => onTextoChange(evento.target.value)}
                onKeyDown={(evento) => {
                    if (evento.key === 'Escape') onCancelar();
                }}
            />

            <label htmlFor={`prioridade-${id}`}>Prioridade</label>

            {/* Atualiza somente o rascunho da edição. */}
            <SeletorPrioridade
                id={`prioridade-${id}`}
                valor={prioridade}
                onChange={onPrioridadeChange}
            />
            <button type="submit" disabled={!texto.trim()}>
                Salvar
            </button>

            {/* type="button" evita enviar o formulário ao cancelar. */}
            <button type="button" className="cancelar" onClick={onCancelar}>
                Cancelar
            </button>
        </form>
    );
}