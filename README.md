# Painel Axis — BMs & WhatsApp

Dashboard interno, **somente leitura**, para monitorar a saúde dos números de
WhatsApp Business distribuídos nas Business Managers dos clientes, além dos
padrões de disparo, dos erros de envio e do teto diário de mensagens por BM.
Os dados vêm de um Postgres no Supabase: view `public.v_phone_health`,
`public.v_bm_usage_live` e tabelas `public.health_events`,
`public.messaging_stats` e `public.message_events`.

Cinco telas, todas organizadas por cliente:

- **Saúde** — qualidade/status dos números, alertas e tendência de qualidade.
  Cada cliente tem um botão **Disparos** ao lado do nome (no cabeçalho do
  grupo) que abre o log completo de sucesso/erro de todos os números daquele
  cliente, filtrável por número e por dia, e exportável em `.csv` ou `.xls`.
- **Disparos** — volume enviado/entregue e taxa de entrega por cliente e por dia
  (`messaging_stats`), e uma seção **Logs de disparos por cliente** com o
  mesmo log detalhado de sucesso/erro por mensagem (`message_events`) que
  existe na tela Saúde, com filtro por número/dia e exportação.
- **Erros** — ranking de erros por código, falhas por cliente e feed de falhas recentes.
- **Limites** — consumo do teto diário de mensagens por Business Manager, ao
  vivo (`v_bm_usage_live`, contagem em tempo real vinda dos webhooks,
  atualizada a cada ~15s), organizado por cliente: "usado / teto" com barra de
  progresso (verde <70%, âmbar 70–90%, vermelho >90% ou estourado), "%" do
  limite consumido hoje, "X entregues" e um badge de "X falhas" quando houver.
  BMs com `messaging_limit` ilimitado mostram "0 / ∞" com barra neutra. Cada
  card já aceita uma prop `sentOverride` (não conectada ainda) para um futuro
  contador alternativo.
- **Monitor** — visão compacta para deixar ligada numa tela: resumo no topo
  (números OK / atenção / críticos / sem atualização, enviadas e falhas do dia)
  e um bloco por número com qualidade, status, consumo do limite da BM e
  tempo desde a última atualização. Números sem evento há mais de 3h aparecem
  como **Sem atualização**. Tem botão de tela cheia e mantém a tela ligada
  (Wake Lock) onde o navegador suporta.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui
- `@supabase/supabase-js` + `@supabase/ssr` (autenticação com cookies)
- Recharts (gráficos de tendência de qualidade e de disparos)

## Pré-requisitos

- Node.js 20+ instalado.

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` na raiz do projeto (se ainda não existir) com:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://stxuuxrphdkqqysbwolr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_EWrJNc_BOZ1HpgDz5mMQUQ_vVKWnTVf
   ```

   > Apenas a chave pública (`anon`/`publishable`) é usada — nunca a
   > `service_role`. O app não faz nenhuma escrita no banco.

3. Login **só com senha**: a tela de login pede apenas a senha e entra com um
   usuário compartilhado do Supabase Auth (`painel@axisfunnel.app`, ou o valor de
   `NEXT_PUBLIC_DASHBOARD_LOGIN_EMAIL`). Para trocar a senha, altere a senha
   desse usuário em **Authentication → Users**. O login continua necessário
   porque o RLS do banco só libera leitura para usuários autenticados.

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000) — você será
   redirecionado para `/login` até autenticar.

## Build de produção

```bash
npm run build
npm run start
```

Pronto para deploy na Vercel (ou qualquer host Node) — basta configurar as
mesmas variáveis de ambiente no provedor.

## Estrutura

```
src/
  app/
    login/            # tela de login (Supabase Auth)
    page.tsx           # tela Saúde (protegida por middleware + guarda server-side)
    disparos/page.tsx  # tela Disparos
    erros/page.tsx     # tela Erros
    limites/page.tsx   # tela Limites
    monitor/page.tsx   # tela Monitor (visão compacta para TV)
  components/
    NavHeader.tsx           # cabeçalho + navegação entre Saúde/Disparos/Erros/Limites/Monitor
    OverviewBar.tsx          # cards de resumo (totais, qualidade, problemas, críticos 24h)
    Filters.tsx               # busca + filtros de qualidade/status (tela Saúde)
    AttentionBlock.tsx        # destaque geral de números RED/RESTRICTED
    ClientSection.tsx         # agrupamento por cliente (tela Saúde)
    NumberCard.tsx             # card de um número
    NumberDetailModal.tsx      # detalhe: info, tendência de qualidade, timeline
    ClientDispatchLogModal.tsx # log de sucesso/erro de todos os números do cliente, por número/dia, exportável (.csv/.xls)
    QualityTrendChart.tsx      # gráfico de tendência de qualidade (Recharts)
    AlertsFeed.tsx             # feed de eventos warning/critical
    health-badges.tsx          # badges de qualidade/status/severidade
    DashboardShell.tsx         # orquestra a tela Saúde
    PeriodSelector.tsx         # seletor de período (7/30 dias), usado em Disparos e Erros
    DispatchScreen.tsx         # orquestra a tela Disparos
    dispatch/
      DispatchSummaryCards.tsx # totais enviados/entregues/taxa de entrega
      DispatchTrendChart.tsx   # enviados vs. entregues por dia (Recharts)
      ClientDispatchList.tsx   # lista por cliente, expansível por número (messaging_stats)
      ClientLogList.tsx        # lista por cliente que abre o ClientDispatchLogModal (message_events)
    ErrorsScreen.tsx           # orquestra a tela Erros
    errors/
      ErrorFilters.tsx         # período + filtros de cliente/número/código
      ErrorRankingTable.tsx    # ranking de erros por código
      ErrorsByClientList.tsx   # falhas por cliente
      FailuresFeed.tsx         # últimas mensagens com erro (recipient_masked)
      DeliveryBreakdown.tsx    # proporção sent/delivered/read/failed no período
    MonitorScreen.tsx          # orquestra a tela Monitor (resumo + grade compacta, tela cheia, wake lock)
    monitor/
      MonitorTile.tsx          # bloco compacto de um número
    LimitsScreen.tsx           # orquestra a tela Limites
    limits/
      ClientLimitsSection.tsx  # agrupamento por cliente (tela Limites)
      BmLimitCard.tsx          # card "usado/teto" com barra de progresso por BM
  hooks/
    useDashboardData.ts      # polling da view + eventos a cada ~25s (Saúde)
    usePhoneEvents.ts        # histórico de eventos de um número (sob demanda)
    useClientDispatchLogs.ts # log de message_events de todos os números de um cliente (sob demanda)
    useDispatchData.ts       # polling de messaging_stats a cada ~25s (Disparos)
    useErrorsData.ts         # polling de message_events (falhas) a cada ~25s (Erros)
    useBmUsageLive.ts        # polling de v_bm_usage_live a cada ~15s (Limites)
  lib/
    supabase/                # clients (browser, server, middleware)
    health.ts                 # regras de cor/ordenação/agrupamento (Saúde)
    dispatch.ts                # agregação por cliente/dia + junção via meta_phone_number_id
    errors.ts                  # ranking de erros e contagem por cliente
    messageEvents.ts           # labels/agrupamento por dia dos logs de disparo de um cliente
    limits.ts                  # tierParaNumero + cor/percentual/agrupamento por cliente (Limites)
    export.ts                  # exportação de tabelas para .csv e .xls (sem dependências)
    format.ts                  # datas relativas em pt-BR
  types/database.ts           # tipos de v_phone_health, v_bm_usage_live, health_events, messaging_stats, message_events
middleware.ts                 # protege todas as rotas exceto /login
```

## Notas

- Somente leitura: nenhuma operação de insert/update/delete é feita.
- RLS ativo no Supabase — a leitura só funciona com um usuário autenticado.
- Atualização automática a cada ~25s em todas as telas; o cabeçalho mostra "atualizado há X".
- `messaging_stats` e `message_events` usam o `phone_number_id` da Meta — a
  junção com clientes é feita no app via `v_phone_health.meta_phone_number_id`.
- A tela Erros nunca exibe o número de destinatário completo, apenas
  `recipient_masked`.
