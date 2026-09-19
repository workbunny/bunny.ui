/**
 * bny-image 堆叠分组回归（puppeteer + 本地静态服务 + 真实浏览器）
 *
 * 覆盖卡牌堆叠的层级语义：
 * - 第一张即最前：nth-child 计数 + z-index 递减（1→6，2→5，3→4…）
 * - 第一张为堆叠基准位（无 transform），后面卡片错位旋转
 * - 悬停扇形展开生效且不破坏层级（第一张仍最前）
 * - 点击最前一张（= 第一张）打开灯箱显示第一张，DOM 序 = 灯箱翻页序不变
 *
 * 运行：npm run test:image（先 vite build --debug 产出 debug/bunny.*）
 * 环境变量：IMAGE_TEST_PORT 覆盖端口（默认 8895）
 *
 * 片段演示页无 <head>，通过内存壳页 hx-get 加载后测试；
 * 断言均为 CSS/DOM 层面，不依赖外链图片（picsum）真实加载完成。
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.normalize(path.join(__dirname, '..'));
const PORT = Number(process.env.IMAGE_TEST_PORT || 8895);
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
};

// 壳页：加载图片组件演示片段（首个 .bny-image-group 为 n06 手写堆叠分组，3 张图）
const SHELL = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<link rel="stylesheet" href="/debug/bunny.css">' +
    '<script src="/debug/bunny.js"></script></head><body>' +
    '<div id="slot" hx-get="/test/image.html" hx-trigger="load"></div></body></html>';

/** puppeteer-core 解析：优先本地/NODE_PATH，回退隔离工作区 */
function loadPuppeteer() {
    try { return require('puppeteer-core'); } catch (e) { /* 忽略 */ }
    try {
        return require('C:/Users/28249/.workbuddy/binaries/node/workspace/node_modules/puppeteer-core');
    } catch (e) {
        throw new Error('puppeteer-core 不可用（NODE_PATH 未指向隔离工作区且本地未安装）');
    }
}

/** 浏览器可执行文件：Edge 优先，回退 Chrome */
function loadBrowserPath() {
    const candidates = [
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files/Google/Chrome/Application/chrome.exe'
    ];
    for (const p of candidates) { if (fs.existsSync(p)) return p; }
    throw new Error('未找到 Edge / Chrome 可执行文件');
}

function startServer() {
    return new Promise(function (resolve) {
        const srv = http.createServer(function (req, res) {
            const urlPath = decodeURIComponent(req.url.split('?')[0]);
            if (urlPath === '/__shell.html') {
                res.writeHead(200, { 'Content-Type': MIME['.html'] });
                res.end(SHELL);
                return;
            }
            const file = path.normalize(path.join(ROOT, urlPath));
            if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
                res.writeHead(404); res.end('404'); return;
            }
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(fs.readFileSync(file));
        });
        srv.listen(PORT, '127.0.0.1', function () { resolve(srv); });
    });
}

// ---------------- 断言计数 ----------------
let passed = 0, failed = 0;
const failures = [];

function ok(name, cond, extra) {
    if (cond) { passed++; console.log('  ✓ ' + name); }
    else {
        failed++;
        const msg = '  ✗ ' + name + (extra !== undefined ? ' 【实际: ' + extra + '】' : '');
        console.log(msg);
        failures.push(msg.trim());
    }
}

(async function () {
    const puppeteer = loadPuppeteer();
    const browserPath = loadBrowserPath();
    const server = await startServer();

    const browser = await puppeteer.launch({
        executablePath: browserPath,
        headless: 'new',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', function (e) {
        pageErrors.push(String(e && e.message || e));
    });

    // domcontentloaded：不等外链图片（断言不依赖图片加载完成）
    await page.goto('http://127.0.0.1:' + PORT + '/__shell.html', { waitUntil: 'domcontentloaded' });

    // 等首个堆叠分组完成 item 包裹（JS 同步包裹，DOM ready 即有）
    const start = Date.now();
    const limit = 15000;
    let ready = false;
    while (Date.now() - start < limit) {
        ready = await page.evaluate(function () {
            var g = document.querySelector('.bny-image-group');
            return !!g && g.querySelectorAll(':scope > .bny-image-item').length >= 3;
        });
        if (ready) break;
        await new Promise(function (r) { setTimeout(r, 150); });
    }
    ok('堆叠分组 item 包裹就绪（3 张）', ready);

    // ---- 层级断言 ----
    const z = await page.evaluate(function () {
        var g = document.querySelector('.bny-image-group');
        var items = g.querySelectorAll(':scope > .bny-image-item');
        function info(el) {
            var cs = getComputedStyle(el);
            return { z: cs.zIndex, tf: cs.transform, name: cs.transform === 'none' ? 'none' : 'matrix' };
        }
        return { i1: info(items[0]), i2: info(items[1]), i3: info(items[2]), total: items.length };
    });
    ok('组内 3 张卡片', z.total === 3, z.total);
    ok('第一张最前：z-index 6', z.i1.z === '6', z.i1.z);
    ok('第二张次之：z-index 5', z.i2.z === '5', z.i2.z);
    ok('第三张靠后：z-index 4', z.i3.z === '4', z.i3.z);
    ok('第一张为基准位（无 transform）', z.i1.name === 'none', z.i1.tf);
    ok('第二/三张错位旋转（有 transform）', z.i2.name === 'matrix' && z.i3.name === 'matrix',
        z.i2.name + ' / ' + z.i3.name);

    // ---- 悬停扇形：第二张 transform 变化，第一张仍最前 ----
    await page.hover('.bny-image-group');
    await new Promise(function (r) { setTimeout(r, 400); }); // 等 280ms 过渡结束
    const hov = await page.evaluate(function () {
        var g = document.querySelector('.bny-image-group');
        var items = g.querySelectorAll(':scope > .bny-image-item');
        return { i1z: getComputedStyle(items[0]).zIndex, i2tf: getComputedStyle(items[1]).transform };
    });
    ok('悬停后第一张仍最前', hov.i1z === '6', hov.i1z);
    ok('悬停扇形展开（第二张 transform 变化）', hov.i2tf !== z.i2.tf, hov.i2tf);

    // ---- 点击最前一张（= 第一张）→ 灯箱显示第一张 ----
    // 灯箱大图 src 在预载 onload 后才赋值（防闪图），断言不依赖外链网络：用计数器验证当前索引
    await page.evaluate(function () {
        var g = document.querySelector('.bny-image-group');
        g.querySelector(':scope > .bny-image-item:nth-child(1) img').click();
    });
    await new Promise(function (r) { setTimeout(r, 150); });
    let viewer = await page.evaluate(function () {
        var v = document.querySelector('.bny-image-viewer');
        if (!v || !v.classList.contains('show')) return { open: false };
        return { open: true, counter: v.querySelector('.bny-image-counter').textContent.trim() };
    });
    ok('点击最前一张打开灯箱', viewer.open);
    ok('灯箱当前为第一张（计数 1 / 3）', viewer.counter === '1 / 3', viewer.counter);

    // 点击最后一张卡片 → 灯箱翻到第三张（DOM 序 = 翻页序，层级翻转不改变映射）
    await page.evaluate(function () {
        var g = document.querySelector('.bny-image-group');
        g.querySelector(':scope > .bny-image-item:nth-child(3) img').click();
    });
    await new Promise(function (r) { setTimeout(r, 150); });
    viewer = await page.evaluate(function () {
        var v = document.querySelector('.bny-image-viewer');
        return { counter: v ? v.querySelector('.bny-image-counter').textContent.trim() : '' };
    });
    ok('点击第三张卡片灯箱翻到第三张（计数 3 / 3）', viewer.counter === '3 / 3', viewer.counter);

    ok('无页面脚本错误', pageErrors.length === 0, pageErrors.join(' | '));

    await browser.close();
    server.close();

    console.log('\n结果: ' + passed + ' 通过, ' + failed + ' 失败');
    if (failed) {
        console.log('失败项:\n' + failures.join('\n'));
        process.exit(1);
    }
})().catch(function (e) {
    console.error('测试执行异常:', e);
    process.exit(1);
});
