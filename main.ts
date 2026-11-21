// gta6-meme-x-01 entry: "Leonida Customs" supercar build sheet.
// Node 22, standard library only, no network calls.
//
// The meme itself lives in supercar.html / supercar.png and in the X post
// named by POST.json. This program exists only because the bounty harness
// runs main.ts and reads the judged post address from the output directory:
// it copies POST.json from the bot directory into /output.
//
// Usage (local check):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const POST_FILE = 'POST.json';

const source = join(BOT_DIR, POST_FILE);
if (!existsSync(source)) {
  console.error(`POST.json not found in bot dir: ${BOT_DIR}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, join(OUTPUT_DIR, POST_FILE));

const posted = JSON.parse(readFileSync(join(OUTPUT_DIR, POST_FILE), 'utf8')) as { post?: string; url?: string };

// The gate only accepts a real public X post address. Reject anything else
// now, while the failure is still cheap and obvious, instead of letting a
// bad POST.json sail through and fail the submission later.
// The site's entry_link check reads the `url` field; accept `post` too as
// a fallback for older POST.json files.
const postUrl = posted.url ?? posted.post;
if (typeof postUrl !== 'string' || !/^https:\/\/x\.com\/[^/]+\/status\/\d+/.test(postUrl)) {
  console.error(`POST.json does not name a valid X post URL: ${postUrl ?? '(missing url/post field)'}`);
  process.exit(1);
}
console.log(`Copied ${POST_FILE} to ${OUTPUT_DIR}; post: ${postUrl}`);
