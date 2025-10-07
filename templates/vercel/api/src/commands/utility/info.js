import {
  MessageFlags,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.https";

// https://discordhttps.js.org/classes/interactionRouter.InteractionRouter.html
import { InteractionRouter } from "discord.https/router";

const router = new InteractionRouter();

// https://discord.com/developers/docs/change-log/2025-04-22-components-v2
const components = [
  new TextDisplayBuilder().setContent("Served via `src/utility/info.js`"),
  new TextDisplayBuilder().setContent("Related Links"),
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Github")
      .setEmoji({
        name: "⭐",
      })
      .setURL("https://google.com"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Node Package")
      .setEmoji({
        name: "📦",
      })
      .setURL("https://www.npmjs.com/package/discord.https"),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Documentation")
      .setEmoji({
        name: "📘",
      })
      .setURL("https://discordhttps.js.org/")
  ),
];

// https://discordhttps.js.org/classes/interactionRouter.InteractionRouter.html#command
router.command(
  (builder) =>
    builder
      .setName("info")
      .setDescription("Gives you information about discord.https"),
  async (interaction) =>
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: components,
    })
);

export default router;
