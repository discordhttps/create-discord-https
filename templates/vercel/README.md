## Discord.https

Vercel’s serverless functions must be placed inside the `api` directory.

By default, the URL is: `<vercel_url>/api/interactions`

More details:

- [Vercel](https://vercel.com)
- [Vercel Functions Documentation](https://vercel.com/docs/functions)

### How to deploy

Run this command to deploy to production:

```bash
npx vercel --prod
```

### Local development

Run your project locally with:

```bash
npm run dev
```

**A layer of local tunnel is embedded into the code for easier development**. This means requests pass through multiple layers: Discord → local tunnel → local Vercel server on your computer → your functions. The Induced latency is usually just a few milliseconds and depends on your internet connection. **This local tunneling layer only runs on your machine during development and can be removed if desired.**

For more information, view `DevLayer.ts` or, `DevLayer.js`
