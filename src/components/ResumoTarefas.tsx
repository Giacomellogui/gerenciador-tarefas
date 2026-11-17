// Dados recebidos do componente pai, App.
type ResumoTarefasProps = {
    pendentes: number;
    concluidas: number;
    total: number;
};

export default function ResumoTarefas({
    pendentes,
    concluidas,
    total,
}: ResumoTarefasProps) {
    // Evita dividir por zero quando não existem tarefas.
    const percentual = total === 0
        ? 0
        : Math.round((concluidas / total) * 100);
    return (
        <section aria-label="Resumo das tarefas">
            {/* htmlFor conecta o rótulo à barra pelo id. */}
            <label htmlFor="progresso-tarefas">
                Progresso: {percentual}%
            </label>

            <progress
                id="progresso-tarefas"
                value={concluidas}
                max={total || 1}
            />
            <p>Total de tarefas: {total}</p>
            <p>Tarefas pendentes: {pendentes}</p>
            <p>Tarefas concluídas: {concluidas}</p>
        </section>
    );
}