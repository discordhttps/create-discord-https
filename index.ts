#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mri from "mri";
import * as prompts from "@clack/prompts";

import colors from "picocolors";
const {
  blueBright,
  greenBright,
  magenta,
  reset,
  yellow,
  white,
  yellowBright,
  cyanBright,
} = colors;

const argv = mri<{
  template?: string;
  help?: boolean;
  overwrite?: boolean;
}>(process.argv.slice(2), {
  alias: { h: "help", t: "template" },
  boolean: ["help", "overwrite"],
  string: ["template"],
});

const cwd = process.cwd();

// prettier-ignore
const helpMessage = `\
Usage: create-discord-https [OPTION]... [DIRECTORY]

Create a new discord.https project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${greenBright ('node-js')}
${white   ('vercel-js')}
${yellowBright   ('cloudflare-js')}
${blueBright ('node-ts')}
${magenta   ('vercel-ts')}
${cyanBright   ('cloudflare-ts')}`

type ColorFunc = (str: string | number) => string;
type ServerType = {
  name: string;
  display: string;
  color: ColorFunc;
  flavour: ServerFlavour[];
};
type ServerFlavour = {
  name: string;
  display: string;
  color: ColorFunc;
  customCommands?: string;
  secret: {
    token: [number, number];
    publicKey: [number, number];
  };
};

const SERVERTYPE: ServerType[] = [
  {
    name: "node",
    display: "⬡ Nodejs (persistent)",
    color: greenBright,
    flavour: [
      {
        name: "node",
        display: "JavaScript",
        color: yellow,
        secret: {
          token: [10 - 1, 11 - 1],
          publicKey: [11 - 1, 15 - 1],
        },
      },
      {
        name: "node-ts",
        display: "TypeScript (recommend)",
        color: blueBright,
        secret: {
          token: [10 - 1, 11 - 1],
          publicKey: [11 - 1, 15 - 1],
        },
      },
    ],
  },
  {
    name: "vercel",
    display: "▲ Vercel serverless",
    color: white,
    flavour: [
      {
        name: "vercel",
        display: "JavaScript",
        color: yellow,
        secret: {
          token: [10 - 1, 11 - 1],
          publicKey: [11 - 1, 15 - 1],
        },
      },
      {
        name: "vercel-ts",
        display: "TypeScript (recommend)",
        color: blueBright,
        secret: {
          token: [10 - 1, 11 - 1],
          publicKey: [11 - 1, 15 - 1],
        },
      },
    ],
  },
  {
    name: "cloudflare",
    // https://www.compart.com/en/unicode/U+2601
    display: "☁ Cloudflare worker",
    color: yellowBright,
    flavour: [
      {
        name: "cloudflare",
        display: "JavaScript",
        color: yellow,
        secret: {
          token: [12 - 1, 15 - 1],
          publicKey: [13 - 1, 19 - 1],
        },
      },
      {
        name: "cloudflare-ts",
        display: "TypeScript (recommend)",
        color: blueBright,
        secret: {
          token: [12 - 1, 15 - 1],
          publicKey: [13 - 1, 19 - 1],
        },
      },
    ],
  },
];

const TEMPLATES = SERVERTYPE.map((f) => f.flavour.map((v) => v.name)).reduce(
  (a, b) => a.concat(b),
  []
);

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const defaultTargetDir = "mybot";

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined;
  const argTemplate = argv.template;
  const argOverwrite = argv.overwrite;

  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const cancel = () => prompts.cancel("Operation cancelled");

  // 1. Get project name and target dir
  let targetDir = argTargetDir;
  if (!targetDir) {
    const projectName = await prompts.text({
      message: "Project name:",
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir,
      validate: (value) => {
        return value.length === 0 || formatTargetDir(value).length > 0
          ? undefined
          : "Invalid project name";
      },
    });
    if (prompts.isCancel(projectName)) return cancel();
    targetDir = formatTargetDir(projectName);
  }

  // 2. Handle directory if exist and not empty
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = argOverwrite
      ? "yes"
      : await prompts.select({
          message:
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. choose how to proceed:`,
          options: [
            {
              label: "Cancel operation",
              value: "no",
            },
            {
              label: "Remove existing files and continue",
              value: "yes",
            },
            {
              label: "Ignore files and continue",
              value: "ignore",
            },
          ],
        });
    if (prompts.isCancel(overwrite)) return cancel();
    switch (overwrite) {
      case "yes":
        emptyDir(targetDir);
        break;
      case "no":
        cancel();
        return;
    }
  }

  // 3. Get package name
  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
    const packageNameResult = await prompts.text({
      message: "Package name:",
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir) {
        if (!isValidPackageName(dir)) {
          return "Invalid package.json name";
        }
      },
    });
    if (prompts.isCancel(packageNameResult)) return cancel();
    packageName = packageNameResult;
  }

  // 4. Choose a framework and flavour
  let template = argTemplate;
  let hasInvalidArgTemplate = false;
  if (argTemplate && !TEMPLATES.includes(argTemplate)) {
    template = undefined;
    hasInvalidArgTemplate = true;
  }
  if (!template) {
    const framework = await prompts.select({
      message: hasInvalidArgTemplate
        ? `"${argTemplate}" isn't a valid template. choose from below: `
        : "Select a environment:",
      options: SERVERTYPE.map((framework) => {
        const frameworkColor = framework.color;
        return {
          label: frameworkColor(framework.display || framework.name),
          value: framework,
        };
      }),
    });
    if (prompts.isCancel(framework)) return cancel();

    const flavour = await prompts.select({
      message: "Select a flavour:",
      options: framework.flavour.map((flavour) => {
        const flavourColor = flavour.color;
        return {
          label: flavourColor(flavour.display || flavour.name),
          value: flavour.name,
        };
      }),
    });
    if (prompts.isCancel(flavour)) return cancel();

    template = flavour;
  }

  const root = path.join(cwd, targetDir);
  fs.mkdirSync(root, { recursive: true });

  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  const { secret } = SERVERTYPE.flatMap((f) => f.flavour).find(
    (v) => v.name === template
  )!;

  prompts.log.step(`Initializing project...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `templates/${template}`
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  pkg.name = packageName;

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");
  const ext = template.split("-")[1] ? "ts" : "js";
  await setupSecret(root, `src/index.${ext}`, secret);
  await setupSubdomain(root, `src/DevLayer.${ext}`);
  let doneMessage = "";
  const cdProjectName = path.relative(cwd, root);
  doneMessage += `All done! Execute:\n`;
  if (root !== cwd) {
    doneMessage += `\n  cd ${
      cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
    }`;
  }
  switch (pkgManager) {
    case "yarn":
      doneMessage += "\n  yarn";
      doneMessage += "\n  yarn dev";
      break;
    default:
      doneMessage += `\n  ${pkgManager} install`;
      doneMessage += `\n  ${pkgManager} run dev`;
      break;
  }
  prompts.outro(doneMessage);
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, "");
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

interface PkgInfo {
  name: string;
  version: string;
}

function pkgFromUserAgent(userAgent: string | undefined): PkgInfo | undefined {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

async function setupSecret(
  root: string,
  entryPoint: string,
  secret: ServerFlavour["secret"]
) {
  const botToken = await prompts.text({
    message: "Enter your Discord Bot Token:",
    validate: (value) =>
      value.length === 0 ? "Token cannot be empty" : undefined,
  });

  if (prompts.isCancel(botToken)) return prompts.cancel("Operation cancelled");

  const publicKey = await prompts.text({
    message: "Enter your Discord Public Key:",
    validate: (value) =>
      value.length === 0 ? "Public Key cannot be empty" : undefined,
  });
  if (prompts.isCancel(publicKey)) return prompts.cancel("Operation cancelled");

  const entryFile = path.join(root, entryPoint);

  if (!fs.existsSync(entryFile)) {
    prompts.cancel("Error while writing token: file not found.");
    return; // stop execution
  }

  let fileContent = fs.readFileSync(entryFile, "utf-8").split("\n");

  const tokenPlaceholder = "PUT_YOUR_TOKEN_HERE";
  const publickeyPlaceholder = "PUT_YOUR_PUBLIC_KEY_HERE";

  const tokenLine = fileContent[secret.token[0]];
  fileContent[secret.token[0]] =
    tokenLine.slice(0, secret.token[1]) +
    botToken +
    tokenLine.slice(secret.token[1] + tokenPlaceholder.length);

  const publicKeyLine = fileContent[secret.publicKey[0]];
  fileContent[secret.publicKey[0]] =
    publicKeyLine.slice(0, secret.publicKey[1]) +
    publicKey +
    publicKeyLine.slice(secret.publicKey[1] + publickeyPlaceholder.length);
  fs.writeFileSync(entryFile, fileContent.join("\n"));
  prompts.log.success(
    "Done, Secrets have been hardcoded however, it is recommended to switch to environment variables!"
  );
}

async function setupSubdomain(root: string, DevLayerEntryPoint: string) {
  const entryFile = path.join(root, DevLayerEntryPoint);
  if (!fs.existsSync(entryFile)) {
    prompts.cancel("Error while writing sub domain: file not found.");
    return; // stop execution
  }

  let fileContent = fs.readFileSync(entryFile, "utf-8").split("\n");

  const SubDomainPrefix = "discord-https";

  // discord-https-timestamp-number
  const subdomain = `${SubDomainPrefix}-${Date.now()}-${Math.floor(
    Math.random() * 9
  )}`;

  const row = 48 - 1; //0th index
  const column = 19 - 1; //0th index
  const tokenLine = fileContent[row];
  fileContent[row] =
    tokenLine.slice(0, column) +
    subdomain +
    tokenLine.slice(column + SubDomainPrefix.length);

  fs.writeFileSync(entryFile, fileContent.join("\n"));
  prompts.log.info(
    "Use `npm run dev` over directly invoking the command, as this will create a tunnel layer except for server environment `nodejs` with a flavor of `typescript`."
  );
  prompts.log.info("For more information, see the README.md file.");
}

init().catch((e) => {
  console.error(e);
});
