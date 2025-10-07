import { InteractionRouterCollector } from "discord.https/router";

// Recommend using PascalCase and ending with the 'Route' suffix
// for variable naming convention

import HelpRoute from "./help.js";
import InfoRoute from "./info.js";
import ProfileRoute from "./profile.js";

export default new InteractionRouterCollector().register(
  HelpRoute,
  InfoRoute,
  ProfileRoute
);
