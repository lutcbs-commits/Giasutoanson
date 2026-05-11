const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');

const CONTENT_DIR = path.resolve(__dirname, '../content');
const METADATA_FILE = path.join(CONTENT_DIR, 'metadata.json');
const AUTH_FILE = path.join(__dirname, '.zalo-auth.json');
const GROUP_KEYWORDS = ['5.4C', 'LH', '5.4c', 'Lớp 5', 'lớp 5'];
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.pptx', '.ppt'];

function getExistingFileNames() {
  try {
    return new Set(
      fs.readdirSync(CONTENT_DIR).filter(f =>
        SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase())
      )
    );
  } catch { return new Set(); }
}

async function loadMetadata() {
  try { return (await fs.readJson(METADATA_FILE)).files || []; }
  catch { return []; }
}

async function saveMetadata(files) {
  await fs.writeJson(METADATA_FILE, { files }, { spaces: 2 });
}

async function screenshot(page, name) {
  const p = path.join(__dirname, `debug-${name}.png`);
  await page.screenshot({ path: p, fullPage: false }).catch(() => {});
  console.log(`  📸 Screenshot: ${p}`);
}

async function waitForLogin(page) {
  console.log('\n>>> Vui lòng quét QR code bằng Zalo trên điện thoại (nếu cần) <<<\n');

  console.log('⏳ Chờ trang tải xong...');
  await page.waitForFunction(
    () => !document.body?.innerText?.includes('Đang đăng nhập'),
    { timeout: 30000 }
  ).catch(() => {});

  await page.waitForTimeout(2000);
  await screenshot(page, '1-after-loading');

  const pageText = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
  const pageHTML = await page.evaluate(() => document.body?.innerHTML || '').catch(() => '');

  const hasQR = pageText.includes('QR') || pageHTML.includes('qr') || pageHTML.includes('QRCode');
  const hasChat = pageHTML.includes('conv') || pageHTML.includes('message') || pageHTML.includes('chat');

  console.log(`  QR hiện?: ${hasQR} | Chat hiện?: ${hasChat}`);

  if (hasChat && !hasQR) {
    console.log('✅ Đã đăng nhập sẵn!\n');
    await page.context().storageState({ path: AUTH_FILE }).catch(() => {});
    return true;
  }

  if (hasQR) {
    console.log('📱 Màn hình QR code - vui lòng quét bằng điện thoại!');
  } else {
    console.log('⏳ Đang chờ trang xử lý đăng nhập...');
  }

  console.log('Chờ tối đa 3 phút...\n');
  try {
    await page.waitForFunction(() => {
      const html = document.body?.innerHTML || '';
      return html.includes('conv') || html.includes('sidebar') ||
             html.includes('message-list') || html.includes('chat-list') ||
             document.title.includes('Zalo') && html.length > 50000;
    }, { timeout: 180000, polling: 2000 });

    await page.waitForTimeout(3000);
    console.log('✅ Đăng nhập thành công!\n');
    await screenshot(page, '2-logged-in');
    await page.context().storageState({ path: AUTH_FILE }).catch(() => {});
    return true;
  } catch {
    console.error('❌ Hết thời gian chờ đăng nhập (3 phút).');
    await screenshot(page, '2-timeout');
    return false;
  }
}

async function findGroup(page) {
  console.log('🔍 Đang tìm nhóm 5.4C LH...');
  await page.waitForTimeout(2000);

  const searchSelectors = [
    'input[placeholder*="Tìm"]',
    'input[placeholder*="tìm"]',
    'input[placeholder*="Search"]',
    '[class*="search"] input',
    '[class*="Search"] input',
  ];

  let searchBox = null;
  for (const sel of searchSelectors) {
    searchBox = page.locator(sel).first();
    const visible = await searchBox.isVisible().catch(() => false);
    if (visible) { console.log(`  Tìm thấy ô tìm kiếm: ${sel}`); break; }
    searchBox = null;
  }

  if (!searchBox) {
    console.log('⚠️  Không tìm thấy ô tìm kiếm. Đang chờ bạn click nhóm thủ công (60s)...');
    await screenshot(page, '3-no-search');
    await page.waitForTimeout(60000);
    return true;
  }

  for (const keyword of GROUP_KEYWORDS) {
    await searchBox.click();
    await searchBox.fill('');
    await page.waitForTimeout(300);
    await searchBox.type(keyword, { delay: 60 });
    await page.waitForTimeout(2000);
    await screenshot(page, `4-search-${keyword.replace(/[^a-z0-9]/gi, '')}`);

    const itemSelectors = [
      '[class*="conv-item"]',
      '[class*="convItem"]',
      '[class*="conversation-item"]',
      '[data-testid="conversation-item"]',
      '[class*="chat-item"]',
    ];

    for (const itemSel of itemSelectors) {
      const items = await page.locator(itemSel).all();
      if (items.length > 0) {
        console.log(`  Tìm thấy ${items.length} kết quả với "${keyword}"`);
        for (const item of items) {
          const text = await item.textContent().catch(() => '');
          if (text.includes('5.4C') || text.includes('LH') || text.includes('lớp 5')) {
            console.log(`  ✅ Chọn nhóm: "${text.trim().slice(0, 60)}"`);
            await item.click();
            await page.waitForTimeout(2000);
            return true;
          }
        }
        console.log(`  Chọn kết quả đầu tiên với "${keyword}"`);
        await items[0].click();
        await page.waitForTimeout(2000);
        return true;
      }
    }
  }

  console.log('⚠️  Không tự tìm được nhóm. Chờ bạn click thủ công (60s)...');
  await screenshot(page, '5-manual-select');
  await page.waitForTimeout(60000);
  return true;
}

// Click the "File" tab in search panel and return files list
async function openFileTab(page) {
  console.log('\n📂 Tìm và click tab "File"...');
  await screenshot(page, '6-before-file-tab');

  // The left search panel should be open with tabs: Tất cả | Liên hệ | Tin nhắn | File
  // Try multiple ways to click the "File" tab
  const strategies = [
    // By role
    async () => {
      const tab = page.getByRole('tab', { name: 'File' });
      if (await tab.isVisible().catch(() => false)) { await tab.click(); return true; }
      return false;
    },
    // By text exact match in tab-like containers
    async () => {
      // Find elements with exactly "File" text that look like tabs
      const els = await page.locator('[class*="tab"]').all();
      for (const el of els) {
        const txt = await el.textContent().catch(() => '');
        if (txt.trim() === 'File') {
          await el.click();
          return true;
        }
      }
      return false;
    },
    // Generic text search for "File" - find a clickable element
    async () => {
      // Use page.evaluate to find and click element with exactly "File" text
      const clicked = await page.evaluate(() => {
        const all = document.querySelectorAll('span, div, button, a');
        for (const el of all) {
          if (el.textContent?.trim() === 'File' && el.offsetParent) {
            el.click();
            return true;
          }
        }
        return false;
      });
      return clicked;
    },
    // Try clicking via locator with text "File" - first visible
    async () => {
      const matches = await page.locator('text="File"').all();
      for (const m of matches) {
        if (await m.isVisible().catch(() => false)) {
          await m.click();
          return true;
        }
      }
      return false;
    },
  ];

  for (let i = 0; i < strategies.length; i++) {
    const ok = await strategies[i]().catch(() => false);
    if (ok) {
      console.log(`  ✅ Đã click tab File (strategy ${i + 1})`);
      await page.waitForTimeout(2500);
      await screenshot(page, '7-file-tab-clicked');
      return true;
    }
  }

  console.log('  ❌ Không tìm được tab File bằng các selector thông thường');
  console.log('  📸 Chụp HTML để debug...');
  await screenshot(page, '7-file-tab-failed');

  // Print HTML of relevant area for debugging
  const html = await page.evaluate(() => {
    // Get the left panel HTML
    const panel = document.querySelector('[class*="search-result"], [class*="searchResult"], [class*="panel"]');
    return panel ? panel.innerHTML.slice(0, 3000) : 'not found';
  }).catch(() => 'error');
  console.log('  Panel HTML (first 3000 chars):', html.slice(0, 500));

  return false;
}

async function downloadFiles(page, existingNames) {
  console.log('\n📥 Đang tải danh sách file...');
  const newFiles = [];

  const fileTabOpened = await openFileTab(page);

  if (!fileTabOpened) {
    // Try right panel approach: click the info/panel toggle button in chat header
    console.log('\n  Thử cách khác: mở panel thông tin nhóm...');
    await screenshot(page, '7b-try-right-panel');

    // Click the last icon button in the chat header area
    const headerBtns = await page.locator('[class*="header"] button, header button').all();
    console.log(`  Tìm thấy ${headerBtns.length} button trong header`);

    if (headerBtns.length > 0) {
      // Try the last few buttons (right side of header)
      for (let i = headerBtns.length - 1; i >= Math.max(0, headerBtns.length - 3); i--) {
        const btn = headerBtns[i];
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(1500);
          await screenshot(page, `7c-header-btn-${i}`);

          // Check if a file list appeared
          const hasFiles = await page.locator('[class*="file"]').count().catch(() => 0);
          console.log(`  Button ${i}: file elements = ${hasFiles}`);
          if (hasFiles > 2) break;
        }
      }
    }

    // Try to find File tab/section in whatever is now visible
    const altSelectors = [
      '[class*="file-section"]',
      'div[class*="tab"]:has-text("Tệp")',
      '[role="tab"]:has-text("Tệp")',
      'button:has-text("Tệp")',
    ];

    for (const sel of altSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        await page.waitForTimeout(2000);
        console.log(`  Click: ${sel}`);
        await screenshot(page, '7d-alt-file-section');
        break;
      }
    }
  }

  await screenshot(page, '8-file-list');

  // Now find file items in the list
  // Try various selectors for file items
  const fileItemSelectors = [
    '[class*="file-item"]',
    '[class*="fileItem"]',
    '[class*="file_item"]',
    '[class*="media-item"]',
    '[class*="mediaItem"]',
    '[class*="storage-item"]',
    '[class*="result-item"]',
    '[class*="resultItem"]',
    '[class*="item"][class*="file"]',
  ];

  let fileItems = [];
  for (const sel of fileItemSelectors) {
    const items = await page.locator(sel).all();
    if (items.length > 0) {
      console.log(`  Tìm thấy ${items.length} file items với: ${sel}`);
      fileItems = items;
      break;
    }
  }

  if (fileItems.length === 0) {
    // Try to find items that contain supported file extensions
    console.log('  Thử tìm file theo text chứa extension...');
    const allItems = await page.locator('[class*="item"]').all();
    for (const item of allItems) {
      const text = await item.textContent().catch(() => '');
      const ext = path.extname(text.trim()).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        fileItems.push(item);
      }
    }
    console.log(`  Tìm thấy ${fileItems.length} items theo extension text`);
  }

  if (fileItems.length === 0) {
    console.log('  ❌ Không tìm thấy file nào trong danh sách.');
    console.log('  📸 Chụp HTML của page để debug...');

    // Debug: print visible text of page
    const visibleText = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
    console.log('  Page text (500 chars):', visibleText.slice(0, 500));

    // Print class names of elements to help identify correct selectors
    const classes = await page.evaluate(() => {
      const els = document.querySelectorAll('[class]');
      const classSet = new Set();
      els.forEach(el => {
        el.className.split(' ').forEach(c => {
          if (c.toLowerCase().includes('file') || c.toLowerCase().includes('item') || c.toLowerCase().includes('media')) {
            classSet.add(c);
          }
        });
      });
      return [...classSet].slice(0, 30);
    }).catch(() => []);
    console.log('  Relevant classes:', classes.join(', '));

    return newFiles;
  }

  console.log(`\n  Tổng ${fileItems.length} file, bắt đầu tải...\n`);

  for (let i = 0; i < fileItems.length; i++) {
    const item = fileItems[i];
    try {
      const itemText = await item.textContent().catch(() => '');

      // Extract file name from item
      let fileName = null;

      // Try finding name element within item
      const nameSelectors = [
        '[class*="file-name"]', '[class*="fileName"]', '[class*="name"]',
        'span', 'p', 'div > span:first-child',
      ];
      for (const nSel of nameSelectors) {
        const nameEl = item.locator(nSel).first();
        const text = await nameEl.textContent().catch(() => '');
        if (text && SUPPORTED_EXTENSIONS.includes(path.extname(text.trim()).toLowerCase())) {
          fileName = text.trim();
          break;
        }
      }

      // Try regex on full item text
      if (!fileName) {
        const match = itemText.match(/[\w\sÀ-ɏḀ-ỿ\[\]()._-]+\.(pdf|docx?|pptx?)/i);
        if (match) fileName = match[0].trim();
      }

      if (!fileName) {
        console.log(`  [${i + 1}] Bỏ qua (không xác định được tên file): "${itemText.trim().slice(0, 50)}"`);
        continue;
      }

      const ext = path.extname(fileName).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;

      if (existingNames.has(fileName)) {
        console.log(`  [${i + 1}] ⏭  Đã có: ${fileName.slice(0, 60)}`);
        continue;
      }

      console.log(`  [${i + 1}] ⬇️  Tải: ${fileName.slice(0, 60)}`);

      // Hover over item to reveal download button
      await item.hover().catch(() => {});
      await page.waitForTimeout(400);

      // Click download button
      const dlSelectors = [
        '[class*="download"]', '[class*="btn-download"]', '[class*="downloadBtn"]',
        'button[title*="tải"]', 'button[title*="Tải"]', 'button[title*="Download"]',
        'a[download]',
        // SVG download icon buttons
        'button svg[*|href*="download"]',
        'button:last-child',
      ];

      const dlPromise = page.waitForEvent('download', { timeout: 20000 });
      let clicked = false;

      for (const dlSel of dlSelectors) {
        const btn = item.locator(dlSel).first();
        const visible = await btn.isVisible().catch(() => false);
        if (visible) {
          await btn.click().catch(() => {});
          clicked = true;
          console.log(`    Click download: ${dlSel}`);
          break;
        }
      }

      // If no download button found, try clicking the item itself
      if (!clicked) {
        await item.click().catch(() => {});
        console.log('    Click item trực tiếp');
      }

      const download = await dlPromise.catch(() => null);
      if (download) {
        const suggestedName = download.suggestedFilename() || fileName;
        const savePath = path.join(CONTENT_DIR, suggestedName);
        await download.saveAs(savePath);
        const size = (await fs.stat(savePath)).size;
        console.log(`  ✅ Lưu: ${suggestedName} (${(size / 1024).toFixed(1)} KB)`);

        newFiles.push({
          fileName: suggestedName,
          sender: 'MathExpress',
          sentAt: new Date().toISOString().split('T')[0],
          downloadedAt: new Date().toISOString(),
          filePath: savePath,
          fileType: path.extname(suggestedName).replace('.', '').toUpperCase(),
          fileSize: size,
        });
        existingNames.add(suggestedName);
      } else {
        console.log(`  ⚠️  Không nhận được download event cho: ${fileName.slice(0, 40)}`);
        await screenshot(page, `fail-${i}`);
      }

    } catch (err) {
      console.error(`  ❌ Lỗi item ${i + 1}:`, err.message.slice(0, 80));
    }
  }

  return newFiles;
}

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Zalo Downloader - Nhóm 5.4C LH    ║');
  console.log('╚══════════════════════════════════════╝\n');

  await fs.ensureDir(CONTENT_DIR);
  const existingNames = getExistingFileNames();
  console.log(`📁 File đã có trong /content: ${existingNames.size} file`);
  if (existingNames.size > 0) {
    console.log('  Sẽ bỏ qua:', [...existingNames].slice(0, 5).join(', '), existingNames.size > 5 ? '...' : '');
  }

  let storageState;
  if (fs.existsSync(AUTH_FILE)) {
    console.log('\n🔑 Tìm thấy session đã lưu, thử dùng lại...');
    storageState = AUTH_FILE;
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized', '--no-sandbox'],
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: null,
    acceptDownloads: true,
    storageState: storageState || undefined,
  });

  const page = await context.newPage();

  console.log('\n🌐 Mở chat.zalo.me...');
  await page.goto('https://chat.zalo.me', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const alreadyLoggedIn = await page.evaluate(() =>
    !!document.querySelector('[class*="conv-list"], [class*="conversation-list"], [class*="sidebar"]')
  ).catch(() => false);

  if (!alreadyLoggedIn) {
    const ok = await waitForLogin(page);
    if (!ok) { await browser.close(); return; }
  } else {
    console.log('✅ Session hợp lệ, đã đăng nhập sẵn!\n');
  }

  await findGroup(page);

  const existingMeta = await loadMetadata();
  const newFiles = await downloadFiles(page, existingNames);

  if (newFiles.length > 0) {
    const allFiles = [...existingMeta, ...newFiles];
    await saveMetadata(allFiles);
    console.log(`\n🎉 Hoàn thành! Tải ${newFiles.length} file mới.`);
    newFiles.forEach(f => console.log(`   ✅ ${f.fileName}`));
  } else {
    console.log('\n📭 Không có file mới (đã có tất cả hoặc không tìm thấy file).');
  }

  await screenshot(page, '9-done');
  console.log('\n⏳ Đóng trình duyệt sau 5 giây...');
  await page.waitForTimeout(5000);
  await browser.close();
  console.log('✔️  Xong!');
}

main().catch(err => {
  console.error('\n❌ Lỗi nghiêm trọng:', err.message);
  process.exit(1);
});
