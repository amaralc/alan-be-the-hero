pnpm prisma:generate &&
pnpm prisma:migrate:deploy &&
pnpm nx run back-end:build --prod
