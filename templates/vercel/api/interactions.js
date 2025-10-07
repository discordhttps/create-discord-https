import client from "./src/index.js";

export default async function handler(req, res) {
  return await client.listen("api/interactions", req, res);
}
