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
        <section className="resumo" aria-label="Resumo das tarefas">
            {/* Cartões destacam os totais sem misturar com as ações da lista. */}
            <div className="indicadores">
              <div className="indicador"><span>Total de tarefas</span><strong>{total}</strong></div>
              <div className="indicador pendentes"><span>Pendentes</span><strong>{pendentes}</strong></div>
              <div className="indicador finalizadas"><span>Concluídas</span><strong>{concluidas}</strong></div>
            </div>
            <div className="progresso">
            {/* htmlFor conecta o rótulo à barra pelo id. */}
            <label htmlFor="progresso-tarefas">
                Seu progresso <strong>{percentual}%</strong>
            </label>

            {/* A barra usa as contagens reais; total || 1 garante máximo positivo. */}
            <progress
                id="progresso-tarefas"
                value={concluidas}
                max={total || 1}
            />
            </div>
        </section>
    );
}
