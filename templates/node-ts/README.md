## Discord.https

By default, the URL is: `<URL>/interactions`

note: You need to initialize the TypeScript build.

**A layer of local tunnel is embedded into the code for easier development**. This means requests pass through multiple layers: Discord → local tunnel → local Vercel server on your computer → your functions. The Induced latency is usually just a few milliseconds and depends on your internet connection. **This local tunneling layer only runs on your machine during development and can be removed if desired.**

For more information, view `DevLayer.ts` or, `DevLayer.js`

