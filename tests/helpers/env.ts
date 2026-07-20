import { execSync } from "child_process"

process.env.DATABASE_URL = "postgresql://postgres@localhost:5432/veltrik_test"
process.env.NEXTAUTH_SECRET = "test-secret-not-used-in-production"
process.env.NEXTAUTH_URL = "http://localhost:3000"
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"

execSync("npx prisma db push --skip-generate --force-reset", {
  env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  stdio: "pipe",
})
