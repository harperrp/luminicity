# Tarefas para o Codex — LuminiCity independente

Objetivo: transformar este frontend em um sistema funcional real na hospedagem com backend/API e banco MySQL.

## Regras importantes

1. Não usar .
2. Não adicionar dependência da .
3. Não conectar React direto no MySQL.
4. Criar API/backend intermediário.
5. Remover dados mockados gradualmente.
6. Nunca versionar `.env` com senha real.
7. Manter `node_modules` e `dist` fora do GitHub.

## Estado atual

- Frontend React/Vite funcionando como painel visual.
- Login ainda usa mock em `src/contexts/AuthContext.tsx`.
- Postes ainda usam `MOCK_POLES` em `src/contexts/PolesContext.tsx`.
- Dados reais devem vir da API.
- Schema MySQL inicial existe em `database/schema.mysql.sql`.

## Prioridade 1 — Backend/API

Criar backend compatível com hospedagem comum/Plesk. Preferência: PHP 8+ com MySQL/PDO.

Estrutura sugerida:

```txt
api/
  index.php
  config/
    database.example.php
  src/
    Auth.php
    Database.php
    Response.php
    Middleware.php
  routes/
    auth.php
    city-halls.php
    users.php
    poles.php
    complaints.php
    maintenance.php
    reports.php
```

## Prioridade 2 — Autenticação real

Substituir login mock por endpoint:

```txt
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

Usar senha com `password_hash` e `password_verify`.

## Prioridade 3 — Integração frontend/API

Criar cliente HTTP:

```txt
src/lib/api.ts
```

Usar variável:

```env
VITE_API_URL=https://seudominio.com.br/api
```

## Prioridade 4 — Dados reais

Trocar mocks por API:

- usuários
- prefeituras
- postes
- denúncias
- manutenção
- relatórios

## Prioridade 5 — Multi-prefeitura

Toda consulta deve respeitar `city_hall_id` do usuário logado, exceto ADMIN geral.

## Prioridade 6 — Segurança

- proteger rotas da API com token/sessão;
- validar permissões por perfil;
- sanitizar entradas;
- usar prepared statements;
- não expor erro SQL bruto ao usuário;
- configurar CORS apenas para o domínio autorizado.

## Entrega esperada

Ao final, o projeto deve ter:

- frontend React independente;
- backend API próprio;
- conexão MySQL;
- login real;
- CRUD básico de postes, denúncias, usuários e prefeituras;
- documentação de deploy.
