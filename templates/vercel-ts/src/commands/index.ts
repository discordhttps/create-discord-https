import { InteractionRouterCollector } from "discord.https/router";

// Recommend using PascalCase and ending with the 'Route' suffix
// for variable naming convention

import JokeRoute from "./fun/joke.js";
import PingRoute from "./reply/ping.js";
import UtilityRoute from "./utility/index.js";

export default new InteractionRouterCollector().register(
  JokeRoute,
  PingRoute,
  UtilityRoute
);
