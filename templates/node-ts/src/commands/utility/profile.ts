// https://discordhttps.js.org/classes/interactionRouter.InteractionRouter.html
import { InteractionRouter } from "discord.https/router";

const router = new InteractionRouter();

// https://discordhttps.js.org/classes/interactionRouter.InteractionRouter.html#usercontextmenu

// https://discord.com/developers/docs/reference#image-formatting

router.userContextMenu(
  (builder) => builder.setName("profile"),
  async (interaction) => {
    const user = interaction.targetUser;

    // In the case of endpoints that support GIFs, the hash will begin with a_ if it is available in GIF format.
    const avatarFormat =
      user.avatar && user.avatar!.startsWith("a_") ? "gif" : "png";

    const avatarUrl = user.avatar
      ? `/avatars/${user.id}/${user.avatar}.${avatarFormat}`
      : // In the case of the Default User Avatar endpoint, the value for index depends on whether the user is migrated to the new username system.
        // For users on the new username system, index will be (user_id >> 22) % 6.
        // For users on the legacy username system, index will be discriminator % 5.
        `/embed/avatars/${
          Number(user.discriminator)
            ? Number(user.discriminator) % 5
            : (BigInt(user.id) >> 22n) % 6n
        }.png`;

    // https://discord.com/developers/docs/reference#image-formatting
    await interaction.reply(`https://cdn.discordapp.com/${avatarUrl}`);
  }
);

export default router;
