// O formato da tarefa é compartilhado com ItemTarefa, sem duplicar a definição.
import type { Prioridade, Tarefa } from './types/Tarefa';
import ItemTarefa from './components/ItemTarefa';
import ResumoTarefas from './components/ResumoTarefas';

// useState guarda dados do componente; useEffect sincroniza com sistemas externos.
import { useEffect, useState } from 'react';
// Importa somente o tipo do evento, usado pelo TypeScript para verificar o código.
import type { FormEvent } from 'react';
import './App.css';

function App() {
  // Guarda a última tarefa excluída para permitir recuperá-la.
  const [tarefaExcluida, setTarefaExcluida] =
    useState<Tarefa | null>(null);
  // Texto controlado pelo campo de criação. O setter atualiza o estado e a tela.
  const [novaTarefa, setNovaTarefa] = useState('');
  // Prioridade escolhida para a próxima tarefa.
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  // Texto digitado no campo de busca.
  const [busca, setBusca] = useState('');
  // null significa que nenhuma tarefa está sendo editada.
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  // Rascunho separado do texto salvo: cancelar não altera a tarefa original.
  const [textoEmEdicao, setTextoEmEdicao] = useState('');
  // Rascunho do texto da tarefa em edição.
  // Rascunho da prioridade: só será aplicado quando clicar em Salvar.
  const [prioridadeEmEdicao, setPrioridadeEmEdicao] =
    useState<Prioridade>('media');
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
      // Guarda na tarefa a prioridade escolhida no formulário.
      prioridade,
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
    // Busca o objeto antes de removê-lo da lista.
    const tarefa = tarefas.find((tarefa) => tarefa.id === id);

    if (!tarefa) return;

    setTarefaExcluida(tarefa);

    // Fecha a edição se ela pertencer à tarefa removida.
    if (idEmEdicao === id) setIdEmEdicao(null);

    setTarefas((atuais) =>
      atuais.filter((tarefa) => tarefa.id !== id)
    );
  }

  function desfazerExclusao() {
    // Sem uma tarefa guardada, não há nada para recuperar.
    if (!tarefaExcluida) return;

    const tarefaParaRestaurar = tarefaExcluida;

    // Devolve a tarefa à lista sem duplicar seu ID.
    setTarefas((atuais) =>
      atuais.some((tarefa) => tarefa.id === tarefaParaRestaurar.id)
        ? atuais
        : [...atuais, tarefaParaRestaurar]
    );

    // Limpa a recuperação após desfazer.
    setTarefaExcluida(null);
  }

  function iniciarEdicao(tarefa: Tarefa) {
    // Seleciona a tarefa e preenche o rascunho com o texto atual.
    setIdEmEdicao(tarefa.id);
    setTextoEmEdicao(tarefa.texto);
    // Preenche o rascunho com a prioridade atual da tarefa.
    setPrioridadeEmEdicao(tarefa.prioridade ?? 'media');
  }

  function salvarEdicao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const texto = textoEmEdicao.trim();
    if (!texto) return;

    // Atualiza o texto e a prioridade somente da tarefa em edição.
    setTarefas((atuais) =>
      atuais.map((tarefa) =>
        tarefa.id === idEmEdicao
          ? { ...tarefa, texto, prioridade: prioridadeEmEdicao }
          : tarefa
      )
    );

    // Fecha o formulário de edição após salvar.
    setIdEmEdicao(null);
  }

  // Dados derivados: calculados em cada renderização, sem outro useState.
  // Filtrar a visualização não remove nada da lista original.
  // Ignora espaços nas pontas da busca e diferenças entre maiúsculas/minúsculas.
  const termoBusca = busca.trim().toLocaleLowerCase('pt-BR');

  // Quanto menor o número, mais cedo a prioridade aparece na lista.
  const ordemPrioridade = {
    alta: 0,
    media: 1,
    baixa: 2,
  };

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    // includes aceita trechos do texto; uma busca vazia corresponde a qualquer texto.
    const correspondeAoTexto = tarefa.texto
      .toLocaleLowerCase('pt-BR')
      .includes(termoBusca);

    const correspondeAoFiltro =
      filtro === 'todas' ||
      (filtro === 'pendentes' && !tarefa.concluida) ||
      (filtro === 'concluidas' && tarefa.concluida);

    // Exibe a tarefa somente se ela atender à busca E ao filtro de situação.
    return correspondeAoTexto && correspondeAoFiltro;
  }).sort((a, b) => {
    // Compara os pesos para ordenar: alta, média e baixa.
    return (
      ordemPrioridade[a.prioridade ?? 'media'] -
      ordemPrioridade[b.prioridade ?? 'media']
    );
  });

  // Conta todas as pendentes, independentemente do filtro selecionado na tela.
  const totalPendentes = tarefas.filter(
    (tarefa) => !tarefa.concluida
  ).length;

  // Seleciona as tarefas concluídas e conta quantas existem.
  const totalConcluidas = tarefas.filter(
    (tarefa) => tarefa.concluida
  ).length;

  function limparConcluidas() {
    // Mantém apenas as tarefas que ainda estão pendentes.
    setTarefas((atuais) =>
      atuais.filter((tarefa) => !tarefa.concluida)
    );

    // Fecha qualquer formulário de edição aberto.
    setIdEmEdicao(null);
  }

  // Somente o JSX retornado participa da interface deste componente.
  return (
    <main>
      <h1>Minhas tarefas</h1>
      <p>Organize seu dia, uma tarefa por vez.</p>
      <ResumoTarefas
        pendentes={totalPendentes}
        concluidas={totalConcluidas}
        total={tarefas.length}
      />

      {/* Só permite limpar quando existe alguma tarefa concluída. */}
      <button
        type="button"
        className="excluir"
        disabled={totalConcluidas === 0}
        onClick={limparConcluidas}
      >
        Limpar concluídas
      </button>

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

        {/* Seletor controlado: a escolha atual fica no estado prioridade. */}
        <div className="campo-prioridade">
          <label htmlFor="prioridade">Prioridade</label>
          <select
            id="prioridade"
            value={prioridade}
            onChange={(evento) => {
              const valor = evento.target.value;

              // Valida o texto recebido do HTML antes de atualizar o estado tipado.
              if (valor === 'baixa' || valor === 'media' || valor === 'alta') {
                setPrioridade(valor);
              }
            }}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        {/* disabled impede enviar um campo vazio ou contendo apenas espaços. */}
        <button type="submit" disabled={!novaTarefa.trim()}>
          Adicionar
        </button>
      </form>

      {/* A digitação atualiza busca e recalcula a lista sem alterar as tarefas salvas. */}
      <div className="busca">
        <label htmlFor="buscar-tarefas">Buscar tarefas</label>
        <input
          id="buscar-tarefas"
          type="search"
          placeholder="Digite parte do texto"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
      </div>

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
      {tarefasFiltradas.length === 0 && (
        <p>{termoBusca ? 'Nenhuma tarefa encontrada para esta busca e filtro.' : 'Nenhuma tarefa neste filtro.'}</p>
      )}

      {/* map transforma os dados em elementos. key identifica cada item para o React. */}
      {/* Mostra o aviso somente quando existe uma tarefa para recuperar. */}
      {tarefaExcluida && (
        <div className="aviso-exclusao" role="status">
          <span>Tarefa excluída: {tarefaExcluida.texto}</span>

          <button type="button" onClick={desfazerExclusao}>
            Desfazer
          </button>
        </div>
      )}
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
                {/* Permite mudar a prioridade sem alterar a tarefa até salvar. */}
                <label htmlFor={`prioridade-${tarefa.id}`}>Prioridade</label>

                <select
                  id={`prioridade-${tarefa.id}`}
                  value={prioridadeEmEdicao}
                  onChange={(evento) => {
                    const valor = evento.target.value;

                    if (valor === 'baixa' || valor === 'media' || valor === 'alta') {
                      setPrioridadeEmEdicao(valor);
                    }
                  }}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
                <button type="submit" disabled={!textoEmEdicao.trim()}>Salvar</button>
                {/* type="button" impede que Cancelar envie o formulário. */}
                <button type="button" className="cancelar" onClick={() => setIdEmEdicao(null)}>
                  Cancelar
                </button>
              </form>
            ) : (
              // Envia os dados e as ações ao cartão; o estado continua no App.
              <ItemTarefa
                tarefa={tarefa}
                onAlternar={alternarTarefa}
                onEditar={() => iniciarEdicao(tarefa)}
                onExcluir={excluirTarefa}
              />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

// Permite que main.tsx importe e renderize este componente.
export default App;