# IluminaCity — Plataforma de Gestão de Iluminação Pública

## Visão geral
O IluminaCity é uma plataforma centralizada para gestão de denúncias de postes queimados e manutenção da iluminação pública.

Fluxo principal:
1. Cidadãos registram denúncias pelo app/portal com geolocalização e descrição.
2. As denúncias chegam automaticamente ao painel web administrativo.
3. Secretários e administradores validam as denúncias.
4. Técnicos executam manutenção e atualizam o status dos postes.
5. Gestores acompanham tudo por dashboard, mapa e relatórios.

## Perfis de acesso do sistema
- **Cidadão (CITIZEN):** registra denúncia de poste queimado.
- **Técnico (TECHNICAL):** visualiza demandas de manutenção e atualiza execução.
- **Secretário (SECRETARY):** analisa denúncias e opera o fluxo de aprovação/rejeição.
- **Administrador municipal (CITY_HALL_ADMIN):** gestão da prefeitura e operação completa local.
- **Administrador geral (ADMIN):** visão global, gestão de prefeituras e usuários.


## Arquitetura multi-tenant
- **Modelo multi-tenant com isolamento por prefeitura:** cada prefeitura acessa somente seus próprios dados e usuários.
- **Banco de dados separado por município:** cada tenant (prefeitura) deve operar com base dedicada para garantir isolamento forte, segurança e governança dos dados.
- **Escopo por tenant em toda operação:** denúncias, postes, usuários, manutenção, dashboard e relatórios devem sempre respeitar o contexto da prefeitura logada.
- **Benefícios do isolamento por banco:**
  - redução de risco de vazamento entre municípios;
  - maior facilidade para backup, restauração e auditoria por prefeitura;
  - suporte a políticas específicas de retenção e conformidade por município.

## Funcionalidades disponíveis

### 1) Portal/App de denúncias do cidadão
- Formulário com:
  - nome, CPF, telefone (opcional), estado e cidade;
  - descrição do problema;
  - captura de geolocalização automática;
  - orientação para foto (placeholder de integração com backend).
- Validações de formulário e bloqueio de envio sem localização.
- Mensagens de sucesso/erro no envio.

### 2) Recebimento centralizado no sistema web
- Página de **Denúncias** para consulta e triagem.
- Lista com status e dados do chamado.
- Filtro por status (todas, pendentes, aprovadas, rejeitadas).

### 3) Análise e decisão das denúncias
- Secretário/gestão pode:
  - aprovar denúncias válidas;
  - rejeitar com motivo padronizado (ex.: denúncia duplicada, localização incorreta etc.);
  - registrar observações para rastreabilidade.

### 4) Operação de manutenção
- Fila de manutenção com prioridade (alta/média/baixa).
- Abertura de detalhes do item e conclusão do atendimento.
- Atualização de status do poste após reparo.

### 5) Gestão de postes
- Cadastro e visualização de postes.
- Status operacional do poste (funcionando/queimado).
- Histórico de alterações de status e observações.

### 6) Mapa operacional
- Visualização geográfica dos postes.
- Identificação rápida de áreas críticas para despacho técnico.

### 7) Dashboard executivo
- KPIs gerais:
  - total de postes;
  - postes funcionando;
  - postes queimados;
  - tempo médio de resolução.
- Gráficos de desempenho por período e por status.
- Acompanhamento de denúncias recebidas x resolvidas.

### 8) Gestão de usuários e permissões
- Controle de acesso por perfil.
- Rotas protegidas para área administrativa.
- Login com contas por papel (demo) e persistência de sessão.

### 9) Gestão multi-prefeitura
- Estrutura para múltiplas prefeituras (tenants).
- Acesso isolado por prefeitura (dados e usuários segregados).
- Banco de dados separado por município para isolamento forte.
- Visão consolidada apenas para administrador geral.

### 10) Relatórios gerenciais
- Página de relatórios para apoio à prestação de contas e acompanhamento estratégico.

## Módulos/telas da aplicação web
- Página inicial institucional.
- Login.
- Denúncia do cidadão.
- Dashboard.
- Mapa.
- Denúncias.
- Manutenção.
- Postes.
- Usuários.
- Prefeituras.
- Relatórios.

## Stack técnica
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Execução local
```sh
npm i
npm run dev
```
