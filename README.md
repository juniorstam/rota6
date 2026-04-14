# Rota 6 MVP

MVP web responsivo da Rota 6, combinando planejamento de viagem, apoio de estrada e recomendações reais de motociclistas.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Supabase + PostgreSQL
- Serviços desacoplados para auth e mapas

## Estrutura

```text
.
├── app
│   ├── admin
│   ├── cadastro
│   ├── explorar
│   ├── favoritos
│   ├── login
│   ├── lugar/[slug]
│   ├── perfil/[username]
│   ├── planejar
│   ├── viagem/[slug]
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
├── db
│   ├── schema.sql
│   └── seed.sql
├── lib
│   ├── mock-data.ts
│   ├── types.ts
│   ├── utils.ts
│   └── services
├── providers
└── package.json
```

## Decisões de arquitetura

- `app/`: páginas do MVP usando App Router e rotas já alinhadas com a navegação futura.
- `components/`: blocos reutilizáveis com foco em mobile-first e visual premium.
- `lib/types.ts`: contratos de domínio compartilhados para facilitar reaproveitamento em web, backend e app mobile.
- `lib/services/map-service.ts`: interface `getRoute()`, `searchPlace()` e `getPlacesAlongRoute()` para trocar o provedor depois sem reescrever a regra de negócio.
- `providers/auth-provider.tsx`: hoje ainda usa armazenamento local, mas já está preparado para migrar para Supabase Auth.
- `lib/supabase/*`: clientes e utilitários base para conectar o app ao Supabase.
- `lib/repositories/*`: primeira camada de acesso a dados para migrar do navegador para banco sem espalhar queries no app.
- `db/schema.sql`: modelagem inicial alinhada ao Supabase (`auth.users`, `profiles`, `trips`, RLS e índices).

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Rode o projeto:

```bash
npm run dev
```

3. Abra:

```text
http://localhost:3000
```

## Variáveis de ambiente

Crie um arquivo `.env.local` com base em [.env.example](/Users/juniorstambassi/Documents/Route%206/.env.example).

```bash
cp .env.example .env.local
```

Para habilitar busca real de endereços, geocoding reverso, cálculo de rota e mapa estático com traçado:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MAPBOX_ACCESS_TOKEN`
- `MAPBOX_STYLE_OWNER`
- `MAPBOX_STYLE_ID`

Sem Supabase e Mapbox, o app continua funcionando em modo demo/local.

## Credenciais de demonstração

- E-mail: `junior@rota6.dev`
- Senha: `123456`

O MVP atual ainda usa autenticação mockada em `localStorage`, mas a base de migração para Supabase já está preparada.

## Banco de dados

- Schema inicial em [db/schema.sql](/Users/juniorstambassi/Documents/Route 6/db/schema.sql)
- Seed base em [db/seed.sql](/Users/juniorstambassi/Documents/Route 6/db/seed.sql)

Ordem recomendada de evolução:

1. criar projeto Supabase e aplicar `db/schema.sql`
2. configurar envs em `.env.local` e na Vercel
3. conectar Supabase Auth em `providers/auth-provider.tsx`
4. migrar perfis e viagens para `lib/repositories/*`
5. trocar fotos locais por Supabase Storage
6. conectar Mapbox real nas rotas `app/api/maps/*`

## Roadmap V2

- app mobile nativo com reaproveitamento do domínio
- notificações push
- geolocalização em background
- alertas de clima e risco
- modo offline
- grupos de viagem
- chat entre motociclistas
- ver motociclistas próximos com opt-in
- marketplace e parcerias
- assinatura premium

## Checklist do MVP

- [x] arquitetura modular
- [x] páginas principais do escopo
- [x] layout premium dark mobile-first
- [x] componentes reutilizáveis principais
- [x] autenticação inicial mockada
- [x] fluxo funcional do planejador de viagem
- [x] pontos de interesse e avaliações
- [x] favoritos e listas simples
- [x] painel admin inicial
- [x] modelagem relacional inicial
- [x] dados mockados para demonstração
