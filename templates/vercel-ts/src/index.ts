import Client from "discord.https";
import VercelAdapter from "@discordhttps/vercel-adapter";

import commands from "./commands/index.js";

const adapter = new VercelAdapter();

const client = new Client({
  token: "PUT_YOUR_TOKEN_HERE",
  publicKey: "PUT_YOUR_PUBLIC_KEY_HERE",
  httpAdapter: adapter,
});

// client.middleware() creates a global middleware, which is always executed before
// route middleware/handlers.

// https://discordhttps.js.org/classes/index.default.html#middleware
client.middleware(async (interaction) => {
  const username = interaction.inGuild()
    ? interaction.member.user.username
    : interaction.user.username;
  console.log("[Global Middleware]: A command has been invoked by: ", username);
});

// Everything here is middleware. A middleware can be defined as a function that takes a parameter
// and transforms the output in our case.

// client.register() mounts a middleware. This means that if the client receives a request from Discord
// and the corresponding middleware exists, the client will pass it to the appropriate middleware
// one by one in the order they were registered.

// simply, .register() lets the client know that these are the handlers.
client.register(commands);

if (process.env.NODE_ENV !== "production") {
  const { commandRegistrarLayer } = await import("./DevLayer.js");

  // if (!(globalThis as any).__TUNNEL_LAYER__)
  //   (globalThis as any).__TUNNEL_LAYER__ = await tunnelLayer();

  // automatic command registration to discord.
  // The second parameter is the guild ID. If a guild ID is provided, the command will be registered for that guild; otherwise, it will be registered globally.
  await commandRegistrarLayer(client, undefined);
}

// Only api/<file.js/ts> can be serverless function, exporting it for api/interaction
// so, it cloud be imported from api/interaction.js and use there due to vercel way of serverless
export default client;
