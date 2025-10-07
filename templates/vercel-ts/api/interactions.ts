import client from "./src/index.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return await client.listen("api/interactions", req, res);
}
