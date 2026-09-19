/**
 * bny-table 单元格模板冒烟测试（puppeteer + 本地静态服务 + 真实浏览器）
 *
 * 覆盖 cell-template 模板引擎三种写法与安全行为：
 * - {{#...}} 多行语句块（const + return）→ 正常生成结构
 * - {{#...}} 单个表达式（一行 map+join）→ 正常生成结构
 * - {{#...}} 语句块缺 return（forEach 丢弃返回值）→ 输出为空 + 控制台告警一次
 * - {{表达式}} 转义输出口 → 三元等表达式正常，注入数据不产生弹窗/DOM 属性
 * - 求值失败/语法错误保留原文，页面无脚本错误
 *
 * 运行：npm run test:table（先 vite build --debug 产出 debug/bunny.*）
 * 环境变量：TABLE_TEST_PORT 覆盖端口（默认 8896）
 *
 * 片段演示页无 <head>，通过内存壳页 hx-get 加载后测试；
 * 语句块/缺 return/单表达式三个模板直接放在壳页里（spec-mini 表）。
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.normalize(path.join(__dirname, '..'));
const PORT = Number(process.env.TABLE_TEST_PORT || 8896);
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf'
};

// 壳页：主片段 + 三个模板写法的 mini 数据表格（首行 photo 含 3 个地址）
const SHELL = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<link rel="stylesheet" href="/debug/bunny.css">' +
    '<script src="/debug/bunny.js"></script></head><body>' +
    '<div id="slot" hx-get="/test/table.html" hx-trigger="load"></div>' +
    '<div id="mini" class="p-12">' +
    '<table hx-ext="bny-table" table-static table-key="spec-mini"' +
    ' hx-get="/test/data/table-static.json" hx-trigger="load"' +
    ' hx-target="find tbody" hx-swap="innerHTML">' +
    '<thead><tr>' +
    '<th cell-field="photo" cell-template="#spec-tpl-body">语句块</th>' +
    '<th cell-field="photo" cell-template="#spec-tpl-noret">缺return</th>' +
    '<th cell-field="photo" cell-template="#spec-tpl-expr">表达式</th>' +
    '</tr></thead><tbody></tbody></table>' +
    '<template id="spec-tpl-body">{{#\n' +
    '    const photo = data.photo.split(",").filter(Boolean);\n' +
    '    return photo.map(function (item) {\n' +
    '        return \'&lt;img src="\' + bny.escapeChars(item) + \'"\&gt;\';\n' +
    '    }).join("");\n' +
    '}}</template>' +
    '<template id="spec-tpl-noret">{{#\n' +
    '    const photo = data.photo.split(",");\n' +
    '    photo.forEach(function (item) {\n' +
    '        return \'&lt;img src="\' + bny.escapeChars(item) + \'"\&gt;\';\n' +
    '    });\n' +
    '}}</template>' +
    '<template id="spec-tpl-expr">{{#data.photo.split(",").filter(Boolean).map(function(item){ return \'&lt;img src="\' + bny.escapeChars(item) + \'"\&gt;\'; }).join("")}}</template>' +
    '</div></body></html>';

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
    const warns = [];
    let dialogFired = false;
    page.on('pageerror', function (e) {
        pageErrors.push(String(e && e.message || e));
    });
    page.on('console', function (m) {
        if (m.type() === 'warn' || m.type() === 'warning') warns.push(m.text());
    });
    page.on('dialog', function (d) {
        dialogFired = true;
        d.dismiss().catch(function () { });
    });

    await page.goto('http://127.0.0.1:' + PORT + '/__shell.html', { waitUntil: 'networkidle0' });

    // 等主片段（typed-users 表）与 mini 表都渲染出行
    const start = Date.now();
    const limit = 15000;
    let ready = false;
    while (Date.now() - start < limit) {
        ready = await page.evaluate(function () {
            function rows(key) {
                var t = document.querySelector('table[table-key="' + key + '"]');
                return t ? t.querySelectorAll('tbody tr').length : 0;
            }
            // 空 photo 行渲染占位 img 数为 0，行本身存在即可
            return rows('typed-users') >= 5 && rows('spec-mini') >= 1;
        });
        if (ready) break;
        await new Promise(function (r) { setTimeout(r, 150); });
    }
    ok('主片段与 mini 表渲染就绪', ready);

    const r = await page.evaluate(function () {
        function t(key) { return document.querySelector('table[table-key="' + key + '"]'); }
        var main = t('typed-users');
        var rows = main ? main.querySelectorAll('tbody tr') : [];
        function td(row, i) { return row ? row.querySelectorAll('td')[i] : null; }
        function imgs(row, i) { var c = td(row, i); return c ? c.querySelectorAll('img').length : -1; }
        function text(row, i) { var c = td(row, i); return c ? c.textContent.trim() : null; }
        var mini = t('spec-mini');
        var mrow = mini ? mini.querySelector('tbody tr') : null;
        var mtds = mrow ? mrow.querySelectorAll('td') : [];
        var img4 = td(rows[3], 5) ? td(rows[3], 5).querySelector('img') : null;
        return {
            mainRows: rows.length,
            r1Photo: imgs(rows[0], 5),
            r2Photo: imgs(rows[1], 5),
            r4Photo: imgs(rows[3], 5),
            r4NoOnerror: img4 ? img4.getAttribute('onerror') === null : false,
            r5Photo: imgs(rows[4], 5),
            r1Status: text(rows[0], 3),
            r1NameBold: td(rows[0], 1) ? !!td(rows[0], 1).querySelector('b') : false,
            noRawPlaceholder: main ? main.querySelector('tbody').textContent.indexOf('{{#') === -1 : false,
            miniBody: mtds[0] ? mtds[0].querySelectorAll('img').length : -1,
            miniNoretImgs: mtds[1] ? mtds[1].querySelectorAll('img').length : -1,
            miniNoretText: mtds[1] ? mtds[1].textContent.trim() : null,
            miniExpr: mtds[2] ? mtds[2].querySelectorAll('img').length : -1
        };
    });

    // ---- 主片段（多行语句块模板，即用户写法）----
    ok('数据表格渲染 5 行', r.mainRows === 5, r.mainRows);
    ok('图片列（语句块模板）首行渲染 3 张图', r.r1Photo === 3, r.r1Photo);
    ok('图片列 filter(Boolean) 过滤空项：第 2 行 2 张图', r.r2Photo === 2, r.r2Photo);
    ok('图片列注入数据（引号逃逸）仍渲染 1 张图', r.r4Photo === 1, r.r4Photo);
    ok('注入数据未产生 onerror DOM 属性', r.r4NoOnerror);
    ok('图片列空值行渲染 0 张图', r.r5Photo === 0, r.r5Photo);
    ok('状态列三元表达式正常（转义输出口）', r.r1Status === '正常', r.r1Status);
    ok('姓名列模板富内容正常', r.r1NameBold);
    ok('单元格无未求值的 {{# 占位残留', r.noRawPlaceholder);

    // ---- mini 表（三种 {{# 写法对照）----
    ok('mini 表：多行语句块（const+return）渲染 3 张图', r.miniBody === 3, r.miniBody);
    ok('mini 表：缺 return 语句块输出为空（不渲染图）', r.miniNoretImgs === 0, r.miniNoretImgs);
    ok('mini 表：缺 return 单元格为空而非保留原文', r.miniNoretText === '', r.miniNoretText);
    ok('mini 表：单表达式一行写法渲染 3 张图', r.miniExpr === 3, r.miniExpr);
    ok('缺 return 有控制台告警提示', warns.some(function (t) {
        return t.indexOf('[bny.table]') !== -1 && t.indexOf('return') !== -1;
    }), warns.filter(function (t) { return t.indexOf('[bny.table]') !== -1; }).join(' | '));

    // ---- 页面健康 ----
    ok('无页面脚本错误（含 data is not defined / 语法错误）',
        pageErrors.length === 0, pageErrors.join(' | '));
    ok('无 alert 弹窗（注入数据未逃逸）', !dialogFired);

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
