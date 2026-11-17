// A mesma validação é usada na importação e na leitura do armazenamento.
import { ehTarefa } from './utils/validarTarefa';
// ChangeEvent descreve a troca de arquivo; import type não gera JavaScript.
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTarefas } from './hooks/useTarefas';
import SeletorPrioridade from './components/SeletorPrioridade';
import FormularioEdicao from './components/FormularioEdicao';
// O formato da tarefa é compartilhado com ItemTarefa, sem duplicar a definição.
import type { Prioridade, Tarefa } from './types/Tarefa';
import ItemTarefa from './components/ItemTarefa';
import ResumoTarefas from './components/ResumoTarefas';
// Importa somente o tipo do evento, usado pelo TypeScript para verificar o código.
import type { FormEvent } from 'react';
import './App.css';

function App() {
  // Mostra o resultado da importação na interface.
  const [mensagemImportacao, setMensagemImportacao] = useState('');
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
  // Rascunho da prioridade: só será aplicado quando clicar em Salvar.
  const [prioridadeEmEdicao, setPrioridadeEmEdicao] =
    useState<Prioridade>('media');
  // A união de tipos aceita somente estes três nomes de filtro.
  const [filtro, setFiltro] = useState<'todas' | 'pendentes' | 'concluidas'>('todas');
  // O hook fornece a lista e cuida de carregar e salvar as tarefas.
  const { tarefas, setTarefas } = useTarefas();

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

    // Guarda somente a última exclusão individual, até desfazer ou recarregar.
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
      // some retorna true se já houver uma tarefa com esse ID.
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
    // sort modifica o array recebido, mas filter criou uma cópia do estado.
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
    // Esta remoção em lote não participa do Desfazer da exclusão individual.
    // Mantém apenas as tarefas que ainda estão pendentes.
    setTarefas((atuais) =>
      atuais.filter((tarefa) => !tarefa.concluida)
    );

    // Fecha qualquer formulário de edição aberto.
    setIdEmEdicao(null);
  }

  function exportarTarefas() {
    // Converte a lista para JSON com indentação para facilitar a leitura.
    // null mantém a conversão padrão; 2 define dois espaços de indentação.
    const conteudo = JSON.stringify(tarefas, null, 2);

    // Blob representa um arquivo em memória.
    const arquivo = new Blob([conteudo], {
      type: 'application/json',
    });

    // Cria um endereço temporário para baixar esse arquivo.
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    // A âncora é temporária: configura o download, dispara o clique e sai do DOM.
    link.href = url;
    link.download = 'minhas-tarefas.json';
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Libera o endereço após dar tempo para o download começar.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importarTarefas(evento: ChangeEvent<HTMLInputElement>) {
    // ?. evita acessar o índice se files não existir; [0] pega o primeiro arquivo.
    const arquivo = evento.target.files?.[0];

    // Limpa a seleção para permitir escolher o mesmo arquivo novamente.
    evento.target.value = '';

    // Cancelar a seleção não altera a lista.
    if (!arquivo) return;

    try {
      // Ler um arquivo é assíncrono: await aguarda o conteúdo.
      const conteudo = await arquivo.text();
      // unknown impede assumir que um JSON externo já possui o formato Tarefa[].
      const dados: unknown = JSON.parse(conteudo);

      // Rejeita o arquivo inteiro se algum item for inválido.
      // Array.isArray exige uma lista; every exige que TODOS os itens sejam válidos.
      // O retorno antecipado acontece antes de qualquer mudança nas tarefas.
      if (!Array.isArray(dados) || !dados.every(ehTarefa)) {
        setMensagemImportacao('O arquivo não contém uma lista válida de tarefas.');
        return;
      }

      setTarefas((atuais) => {
        // O atualizador recebe a lista mais recente, mesmo após o await.
        // Set guarda valores únicos; map extrai apenas os IDs das tarefas atuais.
        const ids = new Set(atuais.map((tarefa) => tarefa.id));

        // Preserva as tarefas atuais e evita IDs repetidos, inclusive no arquivo.
        const novas = dados.filter((tarefa) => {
          if (ids.has(tarefa.id)) return false;

          // Registra o ID aceito para rejeitar outra ocorrência no mesmo arquivo.
          ids.add(tarefa.id);
          return true;
        });

        // Mescla sem sobrescrever tarefas existentes, mesmo que o texto seja diferente.
        return [...atuais, ...novas];
      });

      setMensagemImportacao(
        'Importação concluída. IDs já existentes foram mantidos sem alteração.'
      );
    } catch {
      // Captura falhas ao ler o arquivo ou converter um texto JSON malformado.
      setMensagemImportacao('Não foi possível ler o arquivo JSON.');
    }
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
      {/* Baixa uma cópia de todas as tarefas, independentemente do filtro. */}
      <button type="button" onClick={exportarTarefas}>
        Exportar tarefas
      </button>
      {/* accept orienta o seletor de arquivos; a validação real ocorre na função. */}
      <div className="busca">
        <label htmlFor="importar-tarefas">Importar tarefas de um arquivo JSON</label>

        <input
          id="importar-tarefas"
          type="file"
          accept=".json,application/json"
          onChange={importarTarefas}
        />
      </div>

      {/* role="status" permite anunciar mudanças a quem usa leitor de tela. */}
      <p role="status">{mensagemImportacao}</p>

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
        {/* Atualiza a prioridade da próxima tarefa. */}
        <SeletorPrioridade
          id="prioridade"
          valor={prioridade}
          onChange={setPrioridade}
        />
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

      {/* Mostra o aviso somente quando existe uma tarefa para recuperar. */}
      {tarefaExcluida && (
        <div className="aviso-exclusao" role="status">
          <span>Tarefa excluída: {tarefaExcluida.texto}</span>

          <button type="button" onClick={desfazerExclusao}>
            Desfazer
          </button>
        </div>
      )}
      {/* map transforma os dados em elementos. key identifica cada item para o React. */}
      <ul>
        {tarefasFiltradas.map((tarefa) => (
          <li key={tarefa.id}>
            {/* O ternário escolhe entre o formulário de edição e a visualização. */}
            {idEmEdicao === tarefa.id ? (
              // O formulário recebe o rascunho e as ações; o estado fica no App.
              <FormularioEdicao
                id={tarefa.id}
                texto={textoEmEdicao}
                prioridade={prioridadeEmEdicao}
                onTextoChange={setTextoEmEdicao}
                onPrioridadeChange={setPrioridadeEmEdicao}
                onSalvar={salvarEdicao}
                onCancelar={() => setIdEmEdicao(null)}
              />
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
