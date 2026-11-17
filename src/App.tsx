// useState guarda dados do componente; useEffect sincroniza com sistemas externos.
import { useEffect, useState } from 'react';
// Importa somente o tipo do evento, usado pelo TypeScript para verificar o código.
import type { FormEvent } from 'react';
import './App.css';

// Define o formato de cada objeto da lista. Tipos não validam dados em execução.
type Tarefa = {
  id: string;
  texto: string;
  concluida: boolean;
};

function App() {
  // Texto controlado pelo campo de criação. O setter atualiza o estado e a tela.
  const [novaTarefa, setNovaTarefa] = useState('');
  // null significa que nenhuma tarefa está sendo editada.
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  // Rascunho separado do texto salvo: cancelar não altera a tarefa original.
  const [textoEmEdicao, setTextoEmEdicao] = useState('');
  // A união de tipos aceita somente estes três nomes de filtro.
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');
  // Inicialização preguiçosa: lê o armazenamento ao inicializar o estado,
  // em vez de repetir a leitura a cada renderização.
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    try {
      const salvas = localStorage.getItem('tarefas');

      // localStorage guarda texto; JSON.parse reconstrói a lista de objetos.
      return salvas ? JSON.parse(salvas) : [];
    } catch {
      // Se o acesso ou a conversão falhar, começa com uma lista vazia.
      return [];
    }
  });

  // Salva após a renderização inicial e quando a referência de tarefas muda.
  // JSON.stringify converte a lista para o texto aceito pelo localStorage.
  useEffect(() => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  function adicionarTarefa(evento: FormEvent<HTMLFormElement>) {
    // Evita a navegação/recarregamento padrão do envio de um formulário.
    evento.preventDefault();

    // Remove espaços das extremidades e rejeita entradas vazias.
    const texto = novaTarefa.trim();

    if (!texto) return;

    const tarefa: Tarefa = {
      // Identificador próprio permite distinguir tarefas com textos iguais.
      id: crypto.randomUUID(),
      texto,
      concluida: false,
    };

    // Usa o estado mais recente e cria um novo array sem modificar o anterior.
    setTarefas((atuais) => [...atuais, tarefa]);
    // Como o input usa esse estado em value, isso também limpa o campo.
    setNovaTarefa('');
  }

  function alternarTarefa(id: string) {
    // map cria outro array; só o objeto com o ID escolhido é copiado e alterado.
    // ! inverte o booleano: false vira true e true vira false.
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, concluida: !tarefa.concluida }
          : tarefa
      )
    );
  }

  function excluirTarefa(id: string) {
    // Encerra a edição se a tarefa removida estiver sendo editada.
    if (idEmEdicao === id) setIdEmEdicao(null);
    // filter mantém apenas os objetos com um ID diferente do removido.
    setTarefas((atuais) =>
      atuais.filter((tarefa) => tarefa.id !== id)
    );
  }

  function iniciarEdicao(tarefa: Tarefa) {
    // Seleciona a tarefa e preenche o rascunho com o texto atual.
    setIdEmEdicao(tarefa.id);
    setTextoEmEdicao(tarefa.texto);
  }

  function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = textoEmEdicao.trim();
    if (!texto) return;

    // O spread preserva id e concluida; texto substitui apenas o texto antigo.
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === idEmEdicao ? { ...tarefa, texto } : tarefa
      )
    );
    setIdEmEdicao(null);
  }

  // Dados derivados: calculados em cada renderização, sem outro useState.
  // Filtrar a visualização não remove nada da lista original.
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === 'pendentes') return !tarefa.concluida;
    if (filtro === 'concluidas') return tarefa.concluida;
    return true;
  });

  // Conta todas as pendentes, independentemente do filtro selecionado na tela.
  const totalPendentes = tarefas.filter(
    (tarefa) => !tarefa.concluida
  ).length;

  // Seleciona as tarefas concluídas e conta quantas existem.
  const totalConcluidas = tarefas.filter(
    (tarefa) => tarefa.concluida
  ).length;

  // Somente o JSX retornado participa da interface deste componente.
  return (
    <main>
      <h1>Minhas tarefas</h1>
      <p>Organize seu dia, uma tarefa por vez.</p>
      <p>Tarefas pendentes: {totalPendentes}</p>
      {/* Exibe o total calculado a partir da lista de tarefas. */}
      <p>Tarefas concluídas: {totalConcluidas}</p>

      {/* onSubmit aceita tanto o clique no botão quanto Enter no campo. */}
      {/* htmlFor liga o rótulo ao input de mesmo id. */}
      <form onSubmit={adicionarTarefa}>
        <label htmlFor="nova-tarefa">Nova tarefa</label>

        {/* Campo controlado: value lê o estado e onChange atualiza esse estado. */}
        <input
          id="nova-tarefa"
          type="text"
          placeholder="O que você precisa fazer?"
          value={novaTarefa}
          onChange={(evento) => setNovaTarefa(evento.target.value)}
        />

        {/* disabled impede enviar um campo vazio ou contendo apenas espaços. */}
        <button type="submit" disabled={!novaTarefa.trim()}>
          Adicionar
        </button>
      </form>

      {/* aria-pressed informa a seleção e também é usado pelo CSS para destacá-la. */}
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

      {/* && mostra a mensagem somente quando a condição à esquerda é verdadeira. */}
      {tarefasFiltradas.length === 0 && <p>Nenhuma tarefa neste filtro.</p>}

      {/* map transforma os dados em elementos. key identifica cada item para o React. */}
      <ul>
        {tarefasFiltradas.map((tarefa) => (
          <li key={tarefa.id}>
            {/* O ternário escolhe entre o formulário de edição e a visualização. */}
            {idEmEdicao === tarefa.id ? (
              <form className="edicao" onSubmit={salvarEdicao}>
                <label htmlFor={`editar-${tarefa.id}`}>Editar tarefa</label>
                {/* autoFocus foca o campo ao abrir; Escape descarta o rascunho. */}
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
                {/* type="button" impede que Cancelar envie o formulário. */}
                <button type="button" className="cancelar" onClick={() => setIdEmEdicao(null)}>
                  Cancelar
                </button>
              </form>
            ) : (
              // Fragment agrupa elementos sem criar uma div extra no HTML.
              <>
                <label className="tarefa">
                  {/* checked é o estado da caixa; onChange alterna a tarefa pelo ID. */}
                  <input
                    type="checkbox"
                    checked={tarefa.concluida}
                    onChange={() => alternarTarefa(tarefa.id)}
                  />

                  {/* className aplica o estilo riscado somente às concluídas. */}
                  <span className={tarefa.concluida ? 'concluida' : ''}>
                    {tarefa.texto}
                  </span>
                </label>

                {/* A função de clique só executa ao clicar; aria-label descreve a ação. */}
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

// Permite que main.tsx importe e renderize este componente.
export default App;
