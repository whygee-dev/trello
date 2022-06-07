# Thullo

A mini clone of Trello made in SvelteKit, TypeScript & Prisma.

## Goal

The main goal of this project is to try and play around with SvelteKit in a close to real life project scenario.

## Installation

Clone the repo:

```
git clone https://github.com/whygee-dev/trello.git
```

### Install dependencies

```bash
yarn
```

or

```bash
npm i
```

### Environment Variables

```
# Database URL. Example: postgresql://postgres:@localhost:5432/trello?schema=publi
DATABASE_URL=

# Random secret for JWT signing
JWT_SECRET=

# Root URL
URL=http://localhost:3000

# PubNub secret key: https://www.pubnub.com/docs/security/access-control#initialize-with-a-secret-key
PUBNUB_SECRET=

```

### Apply prisma migrations

```
npx prisma migrate dev
```

### Run the local server

```
yarn dev
```

## Database

Our project uses by default Postgresql. However Prisma supports multiple databases including MySQL, MSSQL, CockroachDB you can change the provider variable in schema.prisma file:

```
provider = "postgresql"
```

to

```
provider = "mysql" // or sqlserver, cockroachdb
```

If any database other than postgresql is used you also need to delete the migration folder and run

```
npx prisma migrate dev
```

to generate the correct SQL for your database.

## Features

- Login / Register

![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/auth.gif?raw=true)

- User profil

![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/profil.png?raw=true)

- Workspace, Board CRUD
  ![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/board-workspace-crud.gif?raw=true)

- Cards & Lists drag & drop
  ![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/card-crud.gif?raw=true)

- Real time board sync across members
  ![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/sync-drag&drop.gif?raw=true)

- Cards cover, labels, members, title, description
  ![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/card-crud.gif?raw=true)

- Invite collaborators

![App Screenshot](https://github.com/whygee-dev/public_gifs/blob/main/thullo/invite.gif?raw=true)

## Production

A showcase production is available here: https://thullo-sveltekit.netlify.app/

**Disclaimer**: Due to the free nature of the host, it is limited and therefore its availability cannot be guaranteed.

## Can be improved

- CSS / Responsivity in some pages

- SvelteKit doesn't support websockets natively yet, for simplicity sake we choosed to use PubNub which isn't satisfactory especially in production; removing it and using a custom node server will improve latency drastically.

- More flexible member roles

- Better image upload handling. Right now they are stored in base64 form raw in the database, this is bad as it makes requests slower since the images are fully requested in a everything or nothing fashion and not streamed / lazy loaded.

- When the user profile is changed, a relogin is required for changes to be reflected on Navbar. This is because of the jwt not being refreshed.
