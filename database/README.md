# Banco de dados MySQL

Arquivos principais:

- `schema.mysql.sql`: cria a estrutura do banco.
- `seed.mysql.sql`: cria dados iniciais, usuarios temporarios, prefeituras, modulos, postes e denuncias de exemplo.

Ordem de importacao:

1. `schema.mysql.sql`
2. `seed.mysql.sql`

Depois da importacao, copie `api/config.example.php` para `api/config.php` na hospedagem e preencha as credenciais reais do banco.

Senha temporaria dos usuarios do seed: `Admin@123456`.

Troque as senhas no primeiro acesso.
