// import { PrismaPg } from "@prisma/adapter-pg";
// import "dotenv/config";
// import { PrismaClient } from "../../generated/prisma/client";
// import envVars from "../config/env";

// const connectionString = `${envVars.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export { prisma };
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import envVars from "../config/env";

// Explicitly set strict SSL mode to future-proof your connection
const connectionString = `${envVars.DATABASE_URL}?sslmode=verify-full`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
