# LuminiCity — Plataforma de Gestão de Iluminação Pública

Projeto independente para gestão de iluminação pública, denúncias, postes, manutenção, usuários, prefeituras e relatórios.

Este projeto não depende da . A base foi limpa para uso direto no GitHub, Codex, hospedagem própria e banco MySQL.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- MySQL para produção, via backend/API

## Rodar localmente

```sh
npm install
npm run dev
```

## Gerar build

```sh
npm run build
```

A saída será criada em `dist/`. Essa pasta não deve ser enviada ao GitHub; ela é gerada novamente sempre que necessário.

## O que não subir para o GitHub

- `node_modules/`
- `dist/`
- `.env`
- arquivos `.zip`, `.rar`, `.7z`
- dumps `.sql` com dados reais
- logs
- senhas, tokens e credenciais

## Banco de dados

A estrutura inicial está em:

```txt
database/schema.mysql.sql
```

Para produção, o frontend React não deve conectar direto no MySQL. O correto é:

```txt
Frontend React -> API/backend -> MySQL
```

## Próximo passo técnico

O arquivo `CODEX_TAREFAS.md` contém o plano para o Codex transformar os mocks em API real com MySQL.
