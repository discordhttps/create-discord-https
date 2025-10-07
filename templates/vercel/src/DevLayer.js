/*

------------It is recommended not to modify this layer of code without proper knowledge------------


For Info:

Summary: This code is a development layer designed to ease development, with automation features such as auto local tunnel and automatic command registration.


1. Automatic command registration

This layer provides support for automatic command registration by storing the last run command definitions in a file.
Later, these definitions are read and compared with the current command definitions.
If they are the same, there is no need to re-register, as nothing has changed.
If they are different, the command definitions have changed and require re-registration.


2.Local Tunnel

Local tunnels establish secure pathways between your localhost and the Internet, making it possible to expose web applications for access from anywhere.

What LocalTunnel does:

- Imagine you’re running a website on your computer at http://localhost:3000.
- Normally, only you can see it because it’s “local” — it is only on your computer.
- LocalTunnel gives it a public URL, like https://awesome-name.domain.com, so discord can send a request to your computer.


Why this matters for Discord:

- Normally, when you open Discord, your computer sends requests to Discord’s servers — everything works because Discord is public.
- But if you want Discord to **send data to your computer** (like a webhook), your computer needs a public address.
- LocalTunnel provides that public URL, so Discord knows where to send the requests.

Why it’s useful:

- Testing webhooks (like Discord)
- Debugging APIs without deploying to a server
*/

export async function tunnelLayer() {
  if (process.env.NODE_ENV !== "production") {
    const chalk = await import("chalk");
    const localtunnel = (await import("localtunnel")).default;
    const tunnel = await localtunnel({
      port: 3000,
      subdomain: "discord-https",
    });
    console.log(
      chalk.default.yellow(
        "[DevLayer] Warning: This URL is intended only for testing and developing your bot.\n" +
          "Never use it in production or hosting.\n" +
          "1. It may be slower, but this is not an issue for bot development.\n" +
          "2. This message should not appear in a production/hosting environment. If it does, your environment variables are incorrect and need to be fixed.\n" +
          "For more information, visit https://discord.com/invite/pSgfJ4K5ej\n\n"
      )
    );
    console.log(
      chalk.default.blue(
        `[DevLayer] Interactions Endpoint URL: ${tunnel.url}/api/interactions\n`
      )
    );

    console.log(
      chalk.default.yellow(
        `[DevLayer] Modify your interaction url with the above\n`
      )
    );

    process.on("SIGINT", async () => {
      tunnel.close();
      console.log("[DevLayer] Tunnel has been shut down");
      process.exit();
    });
  }
}

export async function commandRegistrarLayer(client, guildId) {
  if (process.env.NODE_ENV !== "production") {
    const FILENAME = "__dev_layer_cache__";
    const chalk = (await import("chalk")).default;
    const isEqual = (await import("fast-deep-equal")).default;
    const { writeFile, access, readFile, constants } = await import(
      "node:fs/promises"
    );
    const { join } = await import("node:path");

    let localDump = [];
    const filePath = join(import.meta.dirname, FILENAME);

    try {
      await access(filePath, constants.F_OK);
      const contains = await readFile(filePath, {
        encoding: "utf-8",
      });
      const json = JSON.parse(contains);
      localDump = json;
    } catch {
      await writeFile(filePath, "[]");
    }

    try {
      // https://github.com/discordhttps/discord.https/blob/main/src/interactionRouter/internal.ts#L271
      if (
        !isEqual(
          localDump,
          // To remove undefined properties
          JSON.parse(JSON.stringify(client.router.CommandDefinitions))
        )
      ) {
        console.log(
          chalk.yellowBright(
            `[DevLayer] Command change detected, re-registering with discord in ${
              guildId ? `Guild - ${guildId}` : "Global"
            }...`
          )
        );
        const registar = await client.getRegistar();

        if (guildId) {
          await registar.localSlashRegistar(guildId);
        } else {
          await registar.globalSlashRegistar();
        }
        writeFile(filePath, JSON.stringify(client.router.CommandDefinitions));
        console.log(
          chalk.greenBright("[DevLayer] Commands synced successfully!")
        );
      }
    } catch (err) {
      console.error("[DevLayer] Failed to sync commands:", err);
    }
  }
}
