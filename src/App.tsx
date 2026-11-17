import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

type Tarefa = {
  id: string;
  texto: string;
  concluida: boolean;
};

function App() {
  const [novaTarefa, setNovaTarefa] = useState('');
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  const [textoEmEdicao, setTextoEmEdicao] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    try {
      const salvas = localStorage.getItem('tarefas');

      return salvas ? JSON.parse(salvas) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  function adicionarTarefa(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const texto = novaTarefa.trim();

    if (!texto) return;

    const tarefa: Tarefa = {
      id: crypto.randomUUID(),
      texto,
      concluida: false,
    };

    setTarefas((atuais) => [...atuais, tarefa]);
    setNovaTarefa('');
  }

  function alternarTarefa(id: string) {
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa
      )
    );
  }

  function excluirTarefa(id: string) {
    if (idEmEdicao === id) setIdEmEdicao(null);
    setTarefas((atuais) =>
      atuais.filter((tarefa) => tarefa.id !== id)
    );
  }

  function iniciarEdicao(tarefa: Tarefa) {
    setIdEmEdicao(tarefa.id);
    setTextoEmEdicao(tarefa.texto);
  }

  function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = textoEmEdicao.trim();
    if (!texto) return;

    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === idEmEdicao ? { ...tarefa, texto } : tarefa
      )
    );
    setIdEmEdicao(null);
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === 'pendentes') return !tarefa.concluida;
    if (filtro === 'concluidas') return tarefa.concluida;
    return true;
  });

  return (
    <main>
      <h1>Minhas tarefas</h1>
      <p>Organize seu dia, uma tarefa por vez.</p>

      <form onSubmit={adicionarTarefa}>
        <label htmlFor="nova-tarefa">Nova tarefa</label>

        <input
          id="nova-tarefa"
          type="text"
          placeholder="O que você precisa fazer?"
          value={novaTarefa}
          onChange={(evento) => setNovaTarefa(evento.target.value)}
        />

        <button type="submit" disabled={!novaTarefa.trim()}>
          Adicionar
        </button>
      </form>

      <div className="filtros" role="group" aria-label="Filtrar tarefas">
        <button type="button" aria-pressed={filtro === 'todas'} onClick={() => setFiltro('todas')}>
          Todas
        </button>
        <button type="button" aria-pressed={filtro === 'pendentes'} onClick={() => setFiltro('pendentes')}>
          Pendentes
        </button>
        <button type="button" aria-pressed={filtro === 'concluidas'} onClick={() => setFiltro('concluidas')}>
          Concluídas
        </button>
      </div>

      {tarefasFiltradas.length === 0 && <p>Nenhuma tarefa neste filtro.</p>}

      <ul>
        {tarefasFiltradas.map((tarefa) => (
          <li key={tarefa.id}>
            {idEmEdicao === tarefa.id ? (
              <form className="edicao" onSubmit={salvarEdicao}>
                <label htmlFor={`editar-${tarefa.id}`}>Editar tarefa</label>
                <input
                  id={`editar-${tarefa.id}`}
                  autoFocus
                  value={textoEmEdicao}
                  onChange={(evento) => setTextoEmEdicao(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Escape') setIdEmEdicao(null);
                  }}
                />
                <button type="submit" disabled={!textoEmEdicao.trim()}>Salvar</button>
                <button type="button" className="cancelar" onClick={() => setIdEmEdicao(null)}>
                  Cancelar
                </button>
              </form>
            ) : (
              <>
            <label className="tarefa">
              <input
                type="checkbox"
                checked={tarefa.concluida}
                onChange={() => alternarTarefa(tarefa.id)}
              />

              <span className={tarefa.concluida ? 'concluida' : ''}>
                {tarefa.texto}
              </span>
            </label>

            <button
              type="button"
              onClick={() => iniciarEdicao(tarefa)}
              aria-label={`Editar tarefa: ${tarefa.texto}`}
            >
              Editar
            </button>

            <button
              type="button"
              className="excluir"
              onClick={() => excluirTarefa(tarefa.id)}
              aria-label={`Excluir tarefa: ${tarefa.texto}`}
            >
              Excluir
            </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
