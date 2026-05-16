import app from "./app";
import envVars from "./app/config/env";
// import { seedSuperAdmin } from "./app/utils/seed";

console.log(envVars.PORT);

const bootstrap = async () => {
  try {
    // await seedSuperAdmin();
    app.listen(envVars.PORT, () => {
      console.log(`Server running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

bootstrap();
