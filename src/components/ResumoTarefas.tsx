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
    // Valor derivado das props: não precisa de estado ou efeito próprio.
    // Evita dividir por zero; Math.round arredonda para uma porcentagem inteira.
    const percentual = total === 0
        ? 0
        : Math.round((concluidas / total) * 100);
    return (
        <section aria-label="Resumo das tarefas">
            {/* htmlFor conecta o rótulo à barra pelo id. */}
            <label htmlFor="progresso-tarefas">
                Progresso: {percentual}%
            </label>

            {/* A barra usa as contagens reais; total || 1 garante máximo positivo. */}
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
