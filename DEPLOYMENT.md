# VPS Deployment

This project runs as a Docker Compose service. The container listens on port 3000 and is published on localhost by default, for use behind a reverse proxy with TLS.

## First deployment

1. Install Docker Engine and the Docker Compose plugin on the VPS.
2. Clone the repository and enter the `dating-admin` directory.
3. Create the production environment file and set the real API and Firebase values:

   ```sh
   cp .env.example .env.production
   nano .env.production
   ```

   Set `NEXT_PUBLIC_BASE_URL` to the production backend URL. Set `NEXT_PUBLIC_APP_BASE_PATH` only when the app is served below a URL path. These `NEXT_PUBLIC_*` values are embedded during the image build, so rebuild after changing them.

4. Build and start the service:

   ```sh
   docker compose --env-file .env.production -f compose.production.yml up -d --build
   ```

5. Check the service locally on the VPS:

   ```sh
   curl -I http://127.0.0.1:3000
   docker compose --env-file .env.production -f compose.production.yml logs -f
   ```

Configure the VPS reverse proxy to forward the public HTTPS host to `http://127.0.0.1:3000`. Keep `.env.production` out of version control and allow inbound traffic only on the ports needed by SSH and the TLS reverse proxy.

## Serving under a path (e.g. `/admin`)

Set `NEXT_PUBLIC_APP_BASE_PATH=/admin` (no trailing slash) before building. Pages, public assets and login redirects are then all served below that path, so the proxy only needs to forward `/admin` to the app:

```nginx
location ^~ /admin {
    proxy_pass http://127.0.0.1:5001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

In code, reference public assets and hard redirects through `basePath` from `src/utils/config.ts` (`${basePath}/images/...`); `next/link` and `router.push` add the prefix on their own.

## Running without Docker (PM2)

```sh
npm ci
npm run build          # reads .env.production
pm2 start npm --name dating-admin -- start   # next start -p 5001
pm2 save
```

## Updating

Pull the latest code, then rebuild and replace the running container:

```sh
git pull
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

To stop the service:

```sh
docker compose --env-file .env.production -f compose.production.yml down
```