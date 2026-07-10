import { createServer } from "node:http";
import next from "next";

const port = Number(process.env.PORT || 3000);
const hostname = "0.0.0.0";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      void handle(req, res);
    }).listen(port, hostname, () => {
      console.log(`> Hormon ready on http://${hostname}:${port}`);
      console.log(`> PORT env: ${process.env.PORT ?? "(not set, using 3000)"}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Next.js:", error);
    process.exit(1);
  });
