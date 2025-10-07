// https://discordhttps.js.org/classes/interactionRouter.InteractionRouter.html
import { InteractionRouter } from "discord.https/router";

const router = new InteractionRouter();

// https://discordhttps.js.org/classes/interactionRouter.InteractionRouter.html#command
router.command(
  (builder) => builder.setName("ping").setDescription("says pong!"),
  async (interaction) => await interaction.reply("Pong! 🏓")
);

export default router;
