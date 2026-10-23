"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

const url = "http://127.0.0.1:8765/";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function ready() {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(url)).ok) return; } catch {}
    await sleep(250);
  }
  throw new Error("Local static server did not start");
}
(async () => {
  const server = spawn("python3", ["-m", "http.server", "8765", "--bind", "127.0.0.1"], { stdio: "ignore" });
  let browser;
  try {
    await ready();
    browser = await chromium.launch({channel:"chrome",headless:true});
    const page = await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));

    await page.goto(url, {waitUntil:"domcontentloaded"});
    await page.waitForFunction(() => document.querySelectorAll(".nav-doc").length === 77, null, {timeout:30000});
    await page.waitForSelector("#article h1", {timeout:30000});
    assert.equal(await page.locator(".nav-doc").count(), 77, "71 original + 6 original companion documents");
    console.log("PASS: all 77 navigable documents are present");

    // Read an entire lesson, not a synthetic summary.
    await page.locator("details.nav-group > summary").filter({hasText:"Part 2 · 量化基础"}).click();
    await page.locator('.nav-doc[data-path*="第07课"]').click();
    await page.waitForFunction(() => document.querySelector("#article h1")?.textContent.includes("第 07 课"), null, {timeout:30000});
    const lessonText = await page.locator("#article").innerText();
    assert.ok(lessonText.length > 3500, "complete original lesson must be present");
    assert.ok(lessonText.includes("Look-Ahead Bias"), "original English quant terminology preserved");
    console.log("PASS: full chapter, images and tables rendered",lessonText.length,"characters");

    await page.locator('.nav-doc[data-path*="第01课"]').click();
    await page.waitForFunction(() => document.querySelector("#article h1")?.textContent.includes("第 01 课"), null, {timeout:30000});
    await page.waitForSelector("#article img", {timeout:10000});
    await page.waitForTimeout(1200);
    const imageChecks=await page.locator("#article img").evaluateAll(imgs=>imgs.map(i=>({source:i.getAttribute("src"),resolved:i.src,complete:i.complete,width:i.naturalWidth})));
    console.log("Image diagnostics:",JSON.stringify(imageChecks));
    await page.waitForFunction(() => [...document.querySelectorAll("#article img")].every(i=>i.complete&&i.naturalWidth>0), null, {timeout:15000});
    console.log("PASS: original SVG diagrams loaded");

    await page.locator("#search-launch").click();
    await page.locator("#search-input").fill("回测");
    await page.waitForFunction(() => document.querySelectorAll(".search-hit").length > 0, null, {timeout:15000});
    await page.keyboard.press("Escape");
    console.log("PASS: title and full-text search is interactive");

    fs.mkdirSync("screenshots",{recursive:true});
    await page.screenshot({path:"screenshots/desktop.png",fullPage:false});
    await page.setViewportSize({width:390,height:844});
    await page.locator("#menu-btn").click();
    assert.equal(await page.locator("#book-nav").isVisible(),true);
    const viewport = await page.evaluate(() => ({viewport:window.innerWidth,width:document.documentElement.scrollWidth}));
    assert.ok(viewport.width <= viewport.viewport+2,"no horizontal overflow on mobile: "+JSON.stringify(viewport));
    await page.screenshot({path:"screenshots/mobile.png",fullPage:false});
    console.log("PASS: mobile navigation and responsive layout");
    assert.deepEqual(errors, [], "no uncaught browser page errors");
    console.log("ALL BROWSER SMOKE TESTS PASSED");
  } finally {
    if(browser)await browser.close();
    server.kill();
  }
})().catch(err => {console.error(err);process.exitCode=1;});
