/**
 * Playwright script to discover and log all API calls made by the OSRS Wiki.
 * Run with: npx ts-node scripts/discover-apis.ts
 */

import { chromium, Browser, Page } from '@playwright/test';

const BASE = 'https://oldschool.runescape.wiki';

async function main() {
  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage();

  const apiCalls: Array<{
    url: string;
    method: string;
    params: Record<string, string>;
    responseSnippets: string;
  }> = [];

  // Intercept all API calls
  await page.route(/\/api\.php/, (route) => {
    const url = route.request().url();
    const params: Record<string, string> = {};
    new URL(url).searchParams.forEach((v, k) => { params[k] = v; });

    route.continue().catch(() => {});
    apiCalls.push({
      url,
      method: route.request().method(),
      params,
      responseSnippets: '',
    });
  });

  console.log('🔍 Navigating to OSRS Wiki...\n');

  // 1. Load main page
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  console.log('✅ Loaded main page\n');

  // 2. Trigger OpenSearch autocomplete
  await page.goto(`${BASE}/api.php?action=opensearch&search=dragon&limit=5&format=json`, { waitUntil: 'networkidle' });
  console.log('✅ OpenSearch autocomplete triggered\n');

  // 3. Trigger full search
  await page.goto(`${BASE}/api.php?action=query&list=search&srsearch=dragon&srlimit=5&format=json`, { waitUntil: 'networkidle' });
  console.log('✅ Full search triggered\n');

  // 4. Trigger page parse
  await page.goto(`${BASE}/api.php?action=parse&page=Dragon&format=json`, { waitUntil: 'networkidle' });
  console.log('✅ Page parse triggered\n');

  // 5. Trigger page extract
  await page.goto(`${BASE}/api.php?action=query&titles=Dragon&prop=extracts&exintro=true&explaintext=true&format=json`, { waitUntil: 'networkidle' });
  console.log('✅ Page extract triggered\n');

  await browser.close();

  // Pretty-print discovered APIs
  console.log('\n📡 Discovered API Endpoints:\n');
  console.log('─'.repeat(80));

  const seen = new Set<string>();
  for (const call of apiCalls) {
    const key = `${call.method} ${call.params.action}/${call.params.list ?? call.params.prop ?? call.params.page ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    console.log(`\n▶ ${call.method} ${call.url.split('?')[0]}`);
    console.log('  Params:', JSON.stringify(call.params, null, 2));
  }

  console.log('\n\n✅ Discovery complete.\n');
}

main().catch((err) => {
  console.error('Discovery failed:', err);
  process.exit(1);
});
