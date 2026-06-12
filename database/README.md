# Banco de dados MySQL

Este projeto ainda esta como front-end React/Vite com dados mockados em `src/data/mockData.ts` e estados nos Contexts. Para producao em hospedagem, esses dados devem sair de uma API conectada ao MySQL.

## Arquivo principal

- `schema.mysql.sql`: schema inicial para MySQL 8+, incluindo prefeituras, planos, limite numerico de postes, modulos, usuarios, permissoes, postes, historico, denuncias, CPFs bloqueados e ordens de manutencao.

## Regras ja refletidas no schema

- Prefeitura tem `plan_id` e `pole_limit`; o limite real usado para cadastrar postes e o numero em `city_halls.pole_limit`.
- O plano e uma referencia comercial em `subscription_plans`.
- Usuarios personalizados podem ter permissoes e modulos em tabelas separadas.
- Gerenciar prefeituras deve ser permitido somente para usuario `ADMIN` na API.
- Gerenciar usuarios deve ser permitido somente para `ADMIN` e `CITY_HALL_ADMIN` na API.
- Postes sao vinculados a uma prefeitura e possuem codigo unico por prefeitura.

## Proxima etapa de backend

Criar uma API no servidor de hospedagem para substituir os mocks do React:

- `POST /auth/login`
- `GET /city-halls`
- `POST /city-halls`
- `PUT /city-halls/:id`
- `GET /city-halls/:id/usage`
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `GET /poles`
- `POST /poles`
- `POST /poles/import`
- `DELETE /poles/:id`
- `GET /complaints`
- `POST /complaints`
- `PUT /complaints/:id/approve`
- `PUT /complaints/:id/reject`

Toda regra sensivel precisa ser repetida no backend. A validacao no React ajuda a experiencia, mas nao protege o banco sozinha.
