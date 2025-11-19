# EcoRecicle — Backend (Express + Supabase)

## Como rodar
1. Crie `.env` na raiz copiando de `.env.example` e preencha.
2. Instale e rode:
```
npm i
npm run dev
```
Servidor em `http://localhost:3000`.

## Endpoints
- `POST /auth/cadastro`
- `POST /auth/login`
- `GET /usuarios`
- `GET /descartes` *(JWT)*
- `POST /descartes` *(JWT)*
- `GET /recompensas/listar`
- `POST /recompensas/cadastrar` *(JWT)*
- `PUT /recompensas/resgatar/:id` *(JWT)*
