// This code includes some upper-basic level concepts. If you are an absolute beginner, you may struggle to understand it.

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
const header = [
  new MediaGalleryBuilder().addItems(
    new MediaGalleryItemBuilder().setURL(
      "https://raw.githubusercontent.com/discordhttps/discord.https/refs/heads/main/assets/logo.png"
    )
  ),
  new TextDisplayBuilder().setContent(
    "**Discord.https** is a robust, modular library for implementing Discord HTTP interactions."
  ),
  new SeparatorBuilder()
    .setSpacing(SeparatorSpacingSize.Large)
    .setDivider(true),
];

const footer = [
  new SeparatorBuilder()
    .setSpacing(SeparatorSpacingSize.Large)
    .setDivider(true),
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
      .setName("jokes")
      .setDescription("Gives you random joke")
      .addStringOption((option) =>
        option
          .setName("type")
          .setDescription("Type of joke")
          .addChoices(
            { name: "general", value: "general" },
            { name: "knock-knock", value: "knock-knock" },
            { name: "programming", value: "programming" },
            { name: "dad", value: "dad" }
          )
          .setRequired(true)
      ),
  async (interaction) => {
    // Get the value of the "type" option from the slash command.
    // The 'true' argument makes this required; if it's missing, an error is thrown.
    const option = interaction.options.getString("type", true);

    // Fetch a joke from the API based on the type (e.g., "general", "programming", etc.)
    // This returns a Promise, so we await it to get the response.
    // Simplest explanation for beginners, https://www.geeksforgeeks.org/node-js/rest-api-introduction
    const response = await fetch(
      `https://official-joke-api.appspot.com/jokes/${option}/random`
    );

    // Convert the response into JSON format.
    // This allows us to access the joke's content as JavaScript objects.
    // This process is called deserilization,

    // The received data is in the format of an array: [{ setup: "", punchline: "" }]
    // [body] uses array destructuring. A simple equivalent would be:
    // var body = await response.json();
    // body = body[0];

    const [body] = await response.json();

    // Create a message component (or text display) with the joke content.
    const middlePart = new TextDisplayBuilder().setContent(
      `**Joke**: ${body.setup}\n**Punchline**: ${body.punchline}`
    );
    // send the joke to the user.
    await interaction.reply({
      // - flags: special options for the message (e.g., IsComponentsV2 indicate newer component handling)
      flags: MessageFlags.IsComponentsV2,
      //   Here we spread the arrays with `...` to flatten them into a single array.
      components: [...header, middlePart, ...footer],
    });
  }
);

export default router;
