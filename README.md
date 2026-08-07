# Painel de Saúde de BMs (WhatsApp) — Axis

Dashboard interno, **somente leitura**, para monitorar a saúde dos números de
WhatsApp Business distribuídos nas Business Managers dos clientes. Os dados
vêm de um Postgres no Supabase (view `public.v_phone_health` e tabela
`public.health_events`).

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui
- `@supabase/supabase-js` + `@supabase/ssr` (autenticação com cookies)
- Recharts (gráfico de tendência de qualidade)

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

3. Crie um usuário de acesso no painel do Supabase: **Authentication → Users
   → Add user**, com e-mail e senha da sua equipe. O login do dashboard usa
   e-mail + senha (Supabase Auth). Não há autocadastro.

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
    login/          # tela de login (Supabase Auth)
    page.tsx         # dashboard (protegido por middleware + guarda server-side)
  components/
    OverviewBar.tsx        # cards de resumo (totais, qualidade, problemas, críticos 24h)
    Filters.tsx             # busca + filtros de qualidade/status
    AttentionBlock.tsx      # destaque geral de números RED/RESTRICTED
    ClientSection.tsx       # agrupamento por cliente
    NumberCard.tsx           # card de um número
    NumberDetailModal.tsx    # detalhe: info, tendência de qualidade, timeline
    QualityTrendChart.tsx    # gráfico de tendência (Recharts)
    AlertsFeed.tsx           # feed de eventos warning/critical
    health-badges.tsx        # badges de qualidade/status/severidade
    DashboardShell.tsx       # orquestra dados, filtros e layout
  hooks/
    useDashboardData.ts      # polling da view + eventos a cada ~25s
    usePhoneEvents.ts        # histórico de eventos de um número (sob demanda)
  lib/
    supabase/                # clients (browser, server, middleware)
    health.ts                 # regras de cor/ordenação/agrupamento
    format.ts                 # datas relativas em pt-BR
  types/database.ts           # tipos das linhas de v_phone_health e health_events
middleware.ts                 # protege todas as rotas exceto /login
```

## Notas

- Somente leitura: nenhuma operação de insert/update/delete é feita.
- RLS ativo no Supabase — a leitura só funciona com um usuário autenticado.
- Atualização automática a cada ~25s; o cabeçalho mostra "atualizado há X".
