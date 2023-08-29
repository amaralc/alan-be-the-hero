pnpm prisma:generate:postgres &&
pnpm prisma:migrate:deploy &&
pnpm nx run back-end:build --prod
