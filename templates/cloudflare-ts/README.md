## Discord.https

Cloudflare Workers let you run serverless functions at the edge. Your Discord interactions endpoint must be deployed as a Worker script.

By default, the URL is: <your_worker_subdomain>.workers.dev/interactions

**Note:** You can ignore any warnings in src\DevLayer.js, as the code will not run in production as long as the environment is set to production, which npm run deploy does automatically.

More details:

- [cloudflare](https://cloudflare.com)
- [cloudflare Workers](https://workers.cloudflare.com)

### How to deploy

Run this command to deploy to production:

```bash
npm run deploy
```

### Local development

Run your project locally with:

```bash
npx wrangler types
npm run dev
```

**A layer of local tunnel is embedded into the code for easier development**. This means requests pass through multiple layers: Discord → local tunnel → local Vercel server on your computer → your functions. The Induced latency is usually just a few milliseconds and depends on your internet connection. **This local tunneling layer only runs on your machine during development and can be removed if desired.**

For more information, view `DevLayer.ts` or, `DevLayer.js`
