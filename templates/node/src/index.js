import Client from "discord.https";
import NodeHttpAdapter from "@discordhttps/nodejs-adapter";

import commands from "./commands/index.js";

const adapter = new NodeHttpAdapter();

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
  const { commandRegistrarLayer, tunnelLayer } = await import("./DevLayer.js");
  // Used to tunnel stuff
  await tunnelLayer();

  // automatic command registration to discord.
  // The first parameter is the guild ID. If a guild ID is provided, the command will be registered for that guild; otherwise, it will be registered globally.
  await commandRegistrarLayer(client, undefined);
}

client.listen("interactions", 8080, () => {
  console.log(
    "Listening for interactions at http://localhost:8080/interactions"
  );
});
