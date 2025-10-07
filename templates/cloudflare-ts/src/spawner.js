// ------------It is recommended not to modify this spawner code------------

import { spawn } from "child_process";
import chalk from "chalk";

import { tunnelLayer } from "./DevLayer.js";

await tunnelLayer();
console.log(chalk.greenBright("Tunnel spawned and ready!\n\n"));

const wrangler = spawn("npx", ["wrangler", "dev", "--env", "dev"], {
  stdio: "inherit",
});

wrangler.on("close", (code) => {
  console.log(chalk.yellow(`Wrangler dev exited with code ${code}`));
});
