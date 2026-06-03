# Plano para colocar o IluminaCity em produção com MySQL

## Situação atual do projeto

O projeto atual é um frontend Vite + React + TypeScript. Ele já possui telas, rotas protegidas, painel, módulos e dados de demonstração, mas ainda não está pronto como sistema real de produção porque:

- o login está simulado no frontend;
- usuários e senhas demo estão dentro do código;
- postes, denúncias e demais dados ainda usam mocks/contextos locais;
- não existe backend persistente conectado ao MySQL;
- o frontend não deve conectar diretamente ao banco de dados.

## Caminho correto para produção

Arquitetura recomendada:

```txt
Navegador do usuário
   ↓
Frontend React/Vite compilado em /dist
   ↓ HTTPS
API backend na hospedagem
   ↓ conexão privada
MySQL
```

## O que subir no GitHub

Subir:

- `src/`
- `public/`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig*.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `.gitignore`
- `README.md`
- documentação do projeto

Não subir:

- `node_modules/`
- `dist/`
- `build/`
- `.env`
- `.env.*`, exceto `.env.example`
- logs
- arquivos de backup `.zip`, `.rar`, `.7z`
- dumps de banco `.sql`
- arquivos locais de configuração da hospedagem
- senhas, tokens, chaves ou credenciais

## Comandos locais

```sh
npm install
npm run dev
npm run build
```

A pasta `node_modules` é recriada com `npm install`. Ela não deve ser enviada ao GitHub.

## Variáveis de ambiente sugeridas

Crie um arquivo `.env.example` sem senhas reais:

```env
VITE_API_URL=https://seudominio.com.br/api
```

No servidor/backend, use variáveis privadas como:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nome_do_banco
DB_USER=usuario_do_banco
DB_PASSWORD=senha_forte_aqui
JWT_SECRET=troque_esta_chave
```

Nunca coloque essas credenciais dentro do React.

## Próximas tarefas para o Codex

1. Criar uma API backend separada para autenticação e dados reais.
2. Remover dependência de `MOCK_USERS` no `AuthContext`.
3. Trocar `MOCK_POLES` e demais mocks por chamadas HTTP para API.
4. Criar migrations SQL para tabelas principais.
5. Implementar login com senha criptografada e token de sessão.
6. Adicionar controle multi-prefeitura por `city_hall_id`.
7. Criar endpoints para denúncias, postes, manutenção, usuários, prefeituras e relatórios.
8. Preparar deploy do frontend compilado e API na hospedagem.

## Modelo inicial de tabelas MySQL

```sql
CREATE TABLE city_halls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  state VARCHAR(2) NOT NULL,
  city VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_hall_id INT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_hall_id) REFERENCES city_halls(id)
);

CREATE TABLE poles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_hall_id INT NOT NULL,
  code VARCHAR(80) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'WORKING',
  address VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_hall_id) REFERENCES city_halls(id)
);

CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_hall_id INT NOT NULL,
  pole_id INT NULL,
  citizen_name VARCHAR(150) NOT NULL,
  citizen_cpf VARCHAR(20) NULL,
  citizen_phone VARCHAR(30) NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_hall_id) REFERENCES city_halls(id),
  FOREIGN KEY (pole_id) REFERENCES poles(id)
);

CREATE TABLE maintenance_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_hall_id INT NOT NULL,
  complaint_id INT NULL,
  pole_id INT NULL,
  assigned_user_id INT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_hall_id) REFERENCES city_halls(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id),
  FOREIGN KEY (pole_id) REFERENCES poles(id),
  FOREIGN KEY (assigned_user_id) REFERENCES users(id)
);
```

## Observação sobre multi-tenant

O README fala em banco separado por município. Isso é mais seguro, mas mais complexo. Para começar mais rápido na hospedagem, uma primeira versão pode usar um banco único com coluna `city_hall_id` em todas as tabelas e regras fortes na API. Depois, se necessário, evolui para banco separado por prefeitura.
