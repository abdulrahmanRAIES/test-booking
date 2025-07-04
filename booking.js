const puppeteer = require("puppeteer");
const TELEGRAM_TOKEN = "7775218746:AAFbprwzBX5FR_0mzKruJoCekBht5GMikFw";
const TELEGRAM_CHAT_ID = "-4821920818";

const ACCOUNTS = [
  { email: "slakhou.98@gmail.com", password: "Aa0555320629" },
  // Add more accounts here:
  { email: "mhmdsalakho@gmail.com", password: "Aa123456789" },
  { email: "pamacef432@movfull.com", password: "Aa123456789" },
  { email: "tarima3890@inveitro.com", password: "Hh123456789" },
  // { email: "user3@example.com", password: "pass3" },
];

// --- helpers ---------------------------------------------------------------
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Run a promise with a timeout; if it exceeds `ms`, reject with an Error
async function withTimeout(promise, ms, step) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, rej) => {
      timer = setTimeout(
        () => rej(new Error(`${step} timed out after ${ms / 1000}s`)),
        ms
      );
    }),
  ]);
}

async function sendTelegram(text) {
  const stamp = new Date().toLocaleString("en-GB", { hour12: false });
  const message = `[${stamp}] ${text}`;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const fetchFn = global.fetch
      ? global.fetch
      : (await import("node-fetch")).default;
    await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
    });
  } catch (err) {
    console.warn("⚠️ Telegram failure:", err.message);
  }
}

async function login(page, email, password) {
  console.log(`➡️  Logging in as ${email}`);
  await page.goto("https://www.ecsc-expat.sy/login", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });
  await page.waitForSelector("#mat-input-0");
  await page.type("#mat-input-0", email, { delay: 30 });
  await page.waitForSelector("#mat-input-1");
  await page.type("#mat-input-1", password, { delay: 35 });
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 }),
    page.click('button[type="submit"]'),
  ]);
  console.log("✅ Logged in");
  await sleep(1500);
}

async function openBookingDialog(page) {
  console.log("🔍 Opening booking dialog…");
  await page.waitForSelector("a[mat-button]", { timeout: 15000 });
  const handle = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll("a[mat-button]")).find((b) =>
      (b.textContent || "").includes("حجز دور السفارة")
    );
  });
  if (!handle) throw new Error("Booking button not found");
  await handle.click();
  await page.waitForSelector("mat-dialog-container", { timeout: 15000 });
  await sleep(2000);
}

async function prepareForm(page) {
  // Select mission
  const centerSelect =
    (await page.$('mat-select[formcontrolname="centerFormControl"]')) ||
    (await page.$("#mat-select-0"));
  if (centerSelect) {
    await centerSelect.click();
    await page.waitForSelector("mat-option");
    await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll("mat-option"));
      const mission = opts.find(
        (o) => (o.textContent || "").trim() === "بعثة ستوكهولم"
      );
      if (mission) mission.click();
    });
    await sleep(500);
  }

  // Select service
  const serviceSelect =
    (await page.$('mat-select[formcontrolname="servicesFormControl"]')) ||
    (await page.$("#mat-select-2"));
  if (serviceSelect) {
    await serviceSelect.click();
    await page.waitForSelector("mat-option");
    await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll("mat-option"));
      const svc = opts.find((o) =>
        (o.textContent || "").trim().includes("اصدار أو تجديد جواز سفر (عادي)")
      );
      if (svc) svc.click();
    });
    await sleep(500);
  }

  // Number of transactions => 1
  const numInput =
    (await page.$('input[formcontrolname="mate_count"]')) ||
    (await page.$("#mat-input-2"));
  if (numInput) {
    await numInput.click();
    await page.evaluate((el) => (el.value = ""), numInput);
    await numInput.type("1");
    await sleep(300);
  }
}

async function openCalendar(page) {
  const dateSel =
    'input[formcontrolname="dateTimeValFormControl"], #mat-input-5, input[data-placeholder="اختر موعد الحجز"]';

  // Wait up to 15 s (in 1-s increments) for the input to appear
  let dateInput = null;
  for (let i = 0; i < 15; i++) {
    dateInput = await page.$(dateSel);
    if (dateInput) break;
    await sleep(1000);
  }

  if (!dateInput) throw new Error("Date input not found after waiting");

  const waitCalendar = async (timeout = 7000) => {
    try {
      await page.waitForSelector(".mat-calendar-body", {
        visible: true,
        timeout,
      });
      return true;
    } catch {
      return false;
    }
  };

  let calendarVisible = false;

  // 0) Try clicking the datepicker toggle button first
  try {
    const toggleBtn = await page.$('button[aria-label="Open calendar"]');
    if (toggleBtn) {
      await toggleBtn.click();
      calendarVisible = await waitCalendar(5000);
    }
  } catch (_) {}

  // 1) If still not visible, click the input itself
  if (!calendarVisible) {
    await dateInput.click({ clickCount: 1 });
    calendarVisible = await waitCalendar(5000);
  }

  // 2) If still not visible, try fallback selectors for button
  if (!calendarVisible) {
    const fallbackBtn =
      (await page.$(".mat-datepicker-toggle button")) ||
      (await page.$("button.mat-icon-button"));
    if (fallbackBtn) {
      await fallbackBtn.click();
      calendarVisible = await waitCalendar(5000);
    }
  }

  if (!calendarVisible) {
    throw new Error("Calendar overlay did not appear.");
  }
}

async function findSelectableDay(page) {
  const days = await page.evaluate(() => {
    const today = new Date().getDate();
    return Array.from(document.querySelectorAll(".mat-calendar-body-cell")).map(
      (cell) => {
        const num = parseInt(cell.textContent.trim(), 10);
        return {
          num,
          selectable: !cell.classList.contains("mat-calendar-body-disabled"),
          past: isNaN(num) || num <= today,
        };
      }
    );
  });
  const candidate = days.find((d) => !d.past && d.selectable);
  return candidate ? candidate.num : null;
}

async function pickDay(page, dayNum) {
  await page.evaluate((d) => {
    const cells = Array.from(
      document.querySelectorAll(".mat-calendar-body-cell")
    );
    const target = cells.find((c) => parseInt(c.textContent.trim(), 10) === d);
    if (target) target.click();
  }, dayNum);
  await sleep(500);
}

async function submitBooking(page) {
  const saveBtn =
    (await page.$(
      'button[type="submit"][mat-raised-button][color="primary"]'
    )) || (await page.$('button.mat-primary[type="submit"]'));
  if (!saveBtn) throw new Error("Save button not found");
  await saveBtn.click();
  await sleep(3000);
}

// --- main flow -------------------------------------------------------------
(async () => {
  // 1) Check availability with the first (master) account
  let availableDay = null;
  {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      timeout: 0,
    });
    const page = await browser.newPage();
    try {
      await login(page, ACCOUNTS[0].email, ACCOUNTS[0].password);
      await openBookingDialog(page);
      await prepareForm(page);
      await openCalendar(page);
      availableDay = await findSelectableDay(page);
      if (availableDay) {
        await sendTelegram(
          `✅ Day ${availableDay} is selectable. Starting full booking run.`
        );
      } else {
        await sendTelegram("❌ No selectable dates available at the moment.");
      }
    } catch (err) {
      await sendTelegram(`❌ Error during availability check: ${err.message}`);
    } finally {
      await browser.close();
    }
  }

  if (!availableDay) return; // nothing to book

  // 2) Iterate over each account and book
  for (const { email, password } of ACCOUNTS) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      timeout: 0,
    });
    const page = await browser.newPage();
    // page.setDefaultTimeout(30_000);  // still keeps internal waits short if desired

    const tag = `[${email}]`;

    // --- 2-minute watchdog ---
    let done = false;
    const WATCHDOG_MS = 2 * 60 * 1000;
    const watchdog = setTimeout(async () => {
      if (done) return;
      done = true;
      await sendTelegram(
        `${tag} ⏰ Timed out after 2 minutes – skipping to next account`
      );
      try {
        await browser.close();
      } catch (_) {}
    }, WATCHDOG_MS);

    try {
      const STEP_MS = 30_000;
      await withTimeout(login(page, email, password), STEP_MS, `${tag} login`);
      await withTimeout(openBookingDialog(page), STEP_MS, `${tag} open dialog`);
      await withTimeout(prepareForm(page), STEP_MS, `${tag} prepare form`);
      await withTimeout(openCalendar(page), STEP_MS, `${tag} open calendar`);
      await withTimeout(
        pickDay(page, availableDay),
        STEP_MS,
        `${tag} pick day`
      );
      await withTimeout(submitBooking(page), STEP_MS, `${tag} submit booking`);

      //   await login(page, email, password);
      //   await openBookingDialog(page);
      //   await prepareForm(page);
      //   await openCalendar(page);
      //   await pickDay(page, availableDay);
      //   await submitBooking(page);
      if (!done)
        await sendTelegram(
          `${tag} ✅ Booking submitted for day ${availableDay}`
        );
    } catch (err) {
      if (!done) await sendTelegram(`${tag} ❌ Booking failed: ${err.message}`);
    } finally {
      done = true;
      clearTimeout(watchdog);
      await browser.close();
    }
  }
})();
