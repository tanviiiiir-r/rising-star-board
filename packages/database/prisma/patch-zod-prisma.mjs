import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(fileURLToPath(import.meta.url)), "zod/index.ts");
const source = readFileSync(file, "utf8");
const importLine = "import { Prisma } from '../generated/client';\n";

if (!source.includes("from '../generated/client'")) {
	writeFileSync(file, source.replace("import * as z from 'zod';\n", `import * as z from 'zod';\n${importLine}`));
}
