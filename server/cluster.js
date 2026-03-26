require("dotenv").config();
const cluster    = require("cluster");
const os         = require("os");
const sticky     = require("sticky-session");
const { server } = require("./app");

const PORT    = parseInt(process.env.PORT    || "3000", 10);
const WORKERS = parseInt(process.env.WORKERS || os.cpus().length, 10);

if (!sticky.listen(server, PORT, { workers: WORKERS })) {
  // MASTER
  server.once("listening", () => {
    console.log(`[Master PID ${process.pid}] listening on port ${PORT}`);
    console.log(`[Master] Spawned ${WORKERS} workers`);
  });

  cluster.on("exit", (worker) => {
    console.warn(`[Master] Worker ${worker.process.pid} died — respawning…`);
    cluster.fork();
  });
} else {
  // WORKER
  console.log(`[Worker PID ${process.pid}] ready`);
}
