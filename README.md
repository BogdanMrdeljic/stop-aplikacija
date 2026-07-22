# Stop - aplikacija za automatizaciju porudzbina

Baza podataka i backend za "Stop" - aplikaciju za brzu hranu.

- [`database/schema.dbml`](database/schema.dbml) - DBML sema baze (paste u [dbdiagram.io](https://dbdiagram.io))
- [`backend/`](backend/) - Node.js / Express / TypeScript / Prisma / Socket.IO API

## Pokretanje backend-a

### Preduslovi

- [Node.js](https://nodejs.org) 20+
- Pokrenut PostgreSQL server (lokalno instaliran ili u Docker-u)

### 1. Instaliraj zavisnosti

```bash
cd backend
npm install
```

### 2. Napravi bazu

Ako imas lokalno instaliran PostgreSQL:

```bash
createdb -U postgres stop_db
```

**Ili koristi hostovanu bazu (Neon)** - nema potrebe da instaliras PostgreSQL lokalno:

1. Napravi nalog na [neon.tech](https://neon.tech) i projekat
2. Iz projekta kopiraj connection string (izgleda kao `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Nalepi ga kao `DATABASE_URL` u koraku 3 ispod

Ceo tim moze da koristi istu Neon bazu tokom razvoja - nema potrebe da svako drzi lokalni PostgreSQL.

### 3. Podesi environment promenljive

Kopiraj `.env.example` u `.env` i upiši svoje vrednosti:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://postgres:TVOJA_LOZINKA@localhost:5432/stop_db?schema=public"
JWT_SECRET="bilo-koji-dugacak-nasumican-string"
```

### 4. Pokreni migraciju

Ovo pravi svih 10 tabela u bazi na osnovu `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name init
```

### 5. (Opciono) Ubaci test podatke

```bash
npx tsx prisma/seed.ts
```

Ovo pravi test kategoriju, proizvod, modifikator i zaposlenog (`marko@stop.rs` / `employee123`).

### 6. Pokreni server

```bash
npm run dev
```

Server slusa na `http://localhost:4000`. Proveri da li radi:

```bash
curl http://localhost:4000/api/health
```

## Korisne komande

| Komanda | Sta radi |
|---|---|
| `npm run dev` | Pokrece server u dev modu (auto-restart na izmene) |
| `npm run build` | Kompajlira TypeScript u `dist/` |
| `npm start` | Pokrece kompajlirani build (`dist/index.js`) |
| `npx prisma studio` | Vizuelni pregled/izmena podataka u bazi kroz browser |
| `npx prisma migrate dev` | Kreira novu migraciju posle izmene `schema.prisma` |

## Struktura API-ja

Sve rute su pod `/api` prefiksom:

- `GET /api/health` - provera da li server radi
- `POST /api/auth/customers/register`, `POST /api/auth/customers/login`
- `POST /api/auth/employees/login`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/products`, `POST/PUT/DELETE /api/products/:productId/modifiers`
- `GET/POST/PUT/DELETE /api/addresses` (zahteva ulogovanog kupca)
- `GET/POST /api/orders`, `PATCH /api/orders/:id/status` (zahteva ulogovanog zaposlenog)
- `GET/POST /api/employees` (zahteva ulogovanog zaposlenog)

Rute koje menjaju podatke (`POST`/`PUT`/`DELETE`, osim registracije/login-a) zahtevaju `Authorization: Bearer <token>` header sa JWT-om dobijenim kroz login.

Socket.IO dogadjaji (`order:new`, `order:status`) se emituju uzivo ka dashboard sobi i ka sobi konkretne porudzbine kad se kreira ili promeni status porudzbine.
