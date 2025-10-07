// ------------It is recommended not to modify this spawner code------------

import { spawn } from "child_process";
import chalk from "chalk"; // npm install chalk

import { tunnelLayer } from "./DevLayer.js";

await tunnelLayer();
console.log(chalk.greenBright("Tunnel spawned and ready!\n\n"));

const vercel = spawn("vercel", ["dev"], {
  stdio: "inherit", // we’ll handle colors ourselves
});
3;

vercel.on("close", (code) => {
  console.log(chalk.yellow(`Vercel dev exited with code ${code}`));
});
