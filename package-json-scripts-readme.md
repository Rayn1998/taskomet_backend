start: "node dist/index.js", // запуск приложения после компиляции
build: "tsc", // компиляция typescript в javascript
buildAndStart: "tsc && node dist/index.js", // комбинация двух первых команд
dev: "tsnd --respawn -T -r tsconfig-paths/register src/index.ts",
// 1. tsnd - сокращение ts-node-dev
// 2. --respawn - перезапускает сервер после изменений в файлах
// 3. -T - алиас для --transpile-only - пропускает проверку типов в файлах при компиляции для быстрого запуска в режиме dev
// 4. -r - require - подгрузка скрипта до запуска файла
migratedb: "tsnd -T src/db/migrate.js" // создание базы с нуля и заполнение тестовыми данными
