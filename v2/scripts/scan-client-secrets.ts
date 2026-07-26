import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const roots = ['App.tsx', 'app.json', 'src'];
const forbidden = [
  { label: 'OpenAI secret name', pattern: /OPENAI_API_KEY/ },
  { label: 'Supabase service role name', pattern: /SUPABASE_SERVICE_ROLE_KEY/ },
  { label: 'OpenAI-style secret value', pattern: /sk-[A-Za-z0-9_-]{20,}/ },
];

function filesAt(path: string): string[] {
  const absolute = resolve(path);
  if (!statSync(absolute).isDirectory()) {
    return [absolute];
  }

  return readdirSync(absolute).flatMap((entry) =>
    filesAt(resolve(absolute, entry)),
  );
}

for (const file of roots.flatMap(filesAt)) {
  const content = readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(content)) {
      throw new Error(rule.label + ' found in client path ' + file + '.');
    }
  }
}

console.log('Client secret boundary is clean.');
