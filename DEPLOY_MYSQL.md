# Deploy do IluminaCity em hospedagem PHP/MySQL

Este projeto agora segue o mesmo modelo pratico do painel da camara: frontend React compilado, pasta `api/` em PHP e banco MySQL/MariaDB na hospedagem.

## Arquitetura

```txt
Navegador
  -> React/Vite compilado em dist/
  -> /api/*.php
  -> MySQL/MariaDB
```

O React nunca acessa o MySQL diretamente. Toda leitura e escrita passa pela API PHP.

## 1. Criar o banco

No phpMyAdmin ou painel da hospedagem:

1. Crie o banco `radgov_city_light` ou outro nome desejado.
2. Importe `database/schema.mysql.sql`.
3. Importe `database/seed.mysql.sql` para criar dados iniciais.

Usuarios iniciais do seed:

- `admin@sistema.gov.br`
- `prefeitura@cidade.gov.br`
- `secretario@cidade.gov.br`
- `tecnico@cidade.gov.br`
- `iluminacao@cidade.gov.br`

Senha temporaria de todos: `Admin@123456`

Troque as senhas imediatamente apos o primeiro acesso.

## 2. Configurar a API

Na hospedagem, copie:

```txt
api/config.example.php -> api/config.php
```

Edite `api/config.php` com dados reais:

```php
<?php
return [
  'db_host' => 'localhost',
  'db_port' => '3306',
  'db_name' => 'radgov_city_light',
  'db_user' => 'usuario_do_banco',
  'db_pass' => 'senha_do_banco',
  'session_name' => 'luminicity_admin',
  'allowed_origins' => [],
];
```

O arquivo `api/config.php` esta no `.gitignore` e nao deve ser enviado ao GitHub com senhas reais.

## 3. Compilar o frontend

Localmente:

```sh
npm install
npm run build
```

Para deploy no mesmo dominio da API, mantenha:

```env
VITE_API_URL=/api
```

Se a API ficar em outro subdominio durante testes, ajuste `.env` antes do build:

```env
VITE_API_URL=https://seudominio.com.br/api
```

## 4. Enviar arquivos para hospedagem

Envie para a raiz publica da hospedagem:

- conteudo da pasta `dist/`;
- pasta `api/`.

Nao envie:

- `node_modules/`;
- `.env`;
- `api/config.php` com senha real para repositorio publico;
- arquivos `.sql` se a hospedagem publica permitir download direto deles.

## 5. Endpoints implementados

- `api/auth.php`
- `api/city-halls.php`
- `api/modules.php`
- `api/poles.php`
- `api/complaints.php`
- `api/maintenance.php`
- `api/users.php`
- `api/banned-cpfs.php`

Fluxos ja conectados ao MySQL:

- login por sessao PHP;
- prefeituras e modulos ativos;
- usuarios e permissoes;
- postes, importacao e status;
- denuncia publica;
- aprovacao/rejeicao de denuncias;
- CPFs bloqueados;
- ordens de manutencao criadas ao aprovar denuncia;
- conclusao de manutencao atualizando o poste.

## Observacoes

O projeto ainda mantem alguns mocks como fallback visual para desenvolvimento sem API configurada e para relatorios historicos. Em producao, configure a API e importe o seed para usar os dados reais.
