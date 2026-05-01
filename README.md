# Pull-Ups Tracker (Web, Material Design 3)

Минималистичное веб-приложение для ежедневного трекинга подтягиваний:
- экран Today с быстрым добавлением;
- экран History с историей по дням;
- экран Stats с базовой статистикой.

Данные хранятся локально в `localStorage` браузера.

## Локальный запуск

```bash
npm install
npm run dev
```

Открыть: `http://localhost:5173`

## Production сборка

```bash
npm install
npm run build
npm run preview
```

## Docker

### Сборка образа

```bash
docker build -t pullups-tracker:latest .
```

### Запуск контейнера

```bash
docker run --rm -p 8080:80 pullups-tracker:latest
```

Открыть: `http://localhost:8080`

## Деплой (универсально)

1. Соберите и протестируйте Docker-образ локально.
2. Отправьте образ в registry (Docker Hub/GHCR):
   ```bash
   docker tag pullups-tracker:latest <registry>/<namespace>/pullups-tracker:latest
   docker push <registry>/<namespace>/pullups-tracker:latest
   ```
3. На сервере:
   ```bash
   docker pull <registry>/<namespace>/pullups-tracker:latest
   docker run -d --name pullups-tracker -p 80:80 <registry>/<namespace>/pullups-tracker:latest
   ```
4. Настройте домен и reverse proxy при необходимости.
