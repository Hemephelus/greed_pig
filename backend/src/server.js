import "dotenv/config.js";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Greedy Pig API running on http://localhost:${PORT}/api`);
});
