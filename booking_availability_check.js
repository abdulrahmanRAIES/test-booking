const puppeteer = require("puppeteer");
// const puppeteer = require('puppeteer-core');
const TELEGRAM_TOKEN = "7775218746:AAFbprwzBX5FR_0mzKruJoCekBht5GMikFw";
const TELEGRAM_CHAT_ID = "-4821920818";

// Track whether at least one Telegram message has been sent
let telegramSent = false;

// Helper to send Telegram messages
async function sendTelegramMessage(text) {
  const timeStamp = new Date().toLocaleString("en-GB", { hour12: false }); // e.g. 2025-07-03 14:55:00
  text = `[${timeStamp}] ${text}`;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const fetchFn = global.fetch
      ? global.fetch
      : (await import("node-fetch")).default;
    await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });
    // Flag that a notification went through successfully
    telegramSent = true;
  } catch (err) {
    console.warn("⚠️ Failed to send Telegram message:", err.message);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    timeout: 0,
  });

  const page = await browser.newPage();

  // --- Force-close after a maximum runtime of 3 minutes ---
  const MAX_RUNTIME_MS = 3 * 60 * 1000; // 3 minutes
  const forceCloseTimer = setTimeout(async () => {
    console.log("⌛ 3-minute limit reached. Closing browser.");
    try {
      await browser.close();
    } catch (_) {}
    process.exit(0);
  }, MAX_RUNTIME_MS);

  // Array to store non-200 responses
  const non200Responses = [];
  page.on("response", (response) => {
    const status = response.status();
    if (status !== 200 && response.url().includes("/api")) {
      non200Responses.push({
        url: response.url(),
        status,
        statusText: response.statusText(),
      });
    }
  });

  console.log("🔄 Navigating to login page...");
  await page.goto("https://www.ecsc-expat.sy/login", {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  console.log("⌛ Waiting for login inputs...");
  await page.waitForSelector("#mat-input-0");
  await page.waitForSelector("#mat-input-1");

  console.log("📝 Filling email and password...");
  await page.type("#mat-input-0", "slakhou.98@gmail.com");
  await page.type("#mat-input-1", "Aa0555320629");

  console.log("🚀 Clicking login button and waiting for navigation...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 }),
    page.click('button[type="submit"]'),
  ]);

  console.log("✅ Logged in successfully!");

  // Wait for the page to fully load after login
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Click on "حجز دور السفارة" (Embassy Appointment Booking) button
  try {
    console.log("🔍 Looking for embassy appointment booking button...");

    // Wait for the button to be available
    await page.waitForSelector("a[mat-button]", { timeout: 10000 });

    // Find and click the button with text "حجز دور السفارة"
    const embassyButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll("a[mat-button]"));
      return buttons.find(
        (button) =>
          button.textContent.includes("حجز دور السفارة") ||
          button
            .querySelector(".mat-button-wrapper")
            ?.textContent.includes("حجز دور السفارة")
      );
    });

    if (embassyButton) {
      console.log("🔘 Clicking embassy appointment booking button...");
      await embassyButton.click();

      // Wait for the popup dialog to appear
      console.log("⌛ Waiting for popup dialog to appear...");
      await page.waitForSelector("mat-dialog-container", { timeout: 10000 });

      // Wait a bit for the dialog to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("✅ Popup dialog opened successfully.");

      // Check if the modal is properly loaded by looking for the form
      console.log("🔍 Checking if modal form is loaded...");
      const formExists = await page.evaluate(() => {
        return !!document.querySelector('form[name="deliveryForm"]');
      });

      if (!formExists) {
        console.log("⚠️ Modal form not found, waiting longer...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      // Log all available form elements for debugging
      const formElements = await page.evaluate(() => {
        const form = document.querySelector('form[name="deliveryForm"]');
        if (!form) return "Form not found";

        const selects = Array.from(form.querySelectorAll("mat-select"));
        const inputs = Array.from(form.querySelectorAll("input"));
        const buttons = Array.from(form.querySelectorAll("button"));

        return {
          selects: selects.map((s) => ({
            formcontrolname: s.getAttribute("formcontrolname"),
            id: s.id,
            class: s.className,
          })),
          inputs: inputs.map((i) => ({
            formcontrolname: i.getAttribute("formcontrolname"),
            id: i.id,
            type: i.type,
            class: i.className,
          })),
          buttons: buttons.map((b) => ({
            type: b.getAttribute("type"),
            text: b.textContent.trim(),
            class: b.className,
          })),
        };
      });

      console.log(
        "🔍 Available form elements:",
        JSON.stringify(formElements, null, 2)
      );

      // Fill the diplomatic missions dropdown (البعثات الدبلوماسية)
      try {
        console.log("🔽 Opening diplomatic missions dropdown...");

        // Try multiple selectors for the diplomatic missions dropdown
        const centerSelect =
          (await page.$('mat-select[formcontrolname="centerFormControl"]')) ||
          (await page.$("#mat-select-0")) ||
          (await page.$(
            'mat-select[aria-labelledby*="mat-form-field-label-5"]'
          ));

        if (centerSelect) {
          await centerSelect.click();

          // Wait for options to appear
          await page.waitForSelector("mat-option", { timeout: 5000 });

          console.log("🔘 Selecting 'بعثة الرياض' (Riyadh Mission)...");
          await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll("mat-option"));
            const riyadhOption = options.find(
              (opt) =>
                opt.textContent.trim() === "بعثة الرياض" ||
                opt.querySelector(".mat-option-text")?.textContent.trim() ===
                  "بعثة الرياض"
            );
            if (riyadhOption) riyadhOption.click();
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("✅ Diplomatic mission selected successfully.");
        } else {
          console.warn("⚠️ Diplomatic missions dropdown not found");
        }
      } catch (err) {
        console.warn("⚠️ Failed to select diplomatic mission:", err.message);
      }

      // Fill the available services dropdown (الخدمات المتاحة)
      try {
        console.log("🔽 Opening available services dropdown...");

        // Try multiple selectors for the services dropdown
        const servicesSelect =
          (await page.$('mat-select[formcontrolname="servicesFormControl"]')) ||
          (await page.$("#mat-select-2")) ||
          (await page.$(
            'mat-select[aria-labelledby*="mat-form-field-label-7"]'
          ));

        if (servicesSelect) {
          await servicesSelect.click();

          // Wait for options to appear
          await page.waitForSelector("mat-option", { timeout: 5000 });

          console.log(
            "🔘 Selecting 'اصدار أو تجديد جواز سفر (عادي)' (Issue or Renew Passport - Regular)..."
          );
          await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll("mat-option"));
            const passportOption = options.find(
              (opt) =>
                opt.textContent.trim() === "اصدار أو تجديد جواز سفر (عادي)" ||
                opt.querySelector(".mat-option-text")?.textContent.trim() ===
                  "اصدار أو تجديد جواز سفر (عادي)"
            );
            if (passportOption) {
              passportOption.click();
            } else {
              console.log(
                "⚠️ Passport service option not found, selecting first available option"
              );
              if (options.length > 0) options[0].click();
            }
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log("✅ Service selected successfully.");
        } else {
          console.warn("⚠️ Services dropdown not found");
        }
      } catch (err) {
        console.warn("⚠️ Failed to select service:", err.message);
      }

      // Fill the number of transactions field (عدد المعاملات)
      try {
        console.log("📝 Filling number of transactions...");

        // Try multiple selectors for the number input
        const numberInput =
          (await page.$('input[formcontrolname="mate_count"]')) ||
          (await page.$("#mat-input-2")) ||
          (await page.$(
            'input[type="number"][data-placeholder="أدخل عدد المعاملات"]'
          )) ||
          (await page.$('input[type="number"]'));

        if (numberInput) {
          // Clear the input field first, then type "1"
          await numberInput.click();
          await numberInput.evaluate((el) => (el.value = ""));
          await numberInput.type("1");

          // Verify the value is correct
          const inputValue = await numberInput.evaluate((el) => el.value);
          console.log(
            `✅ Number of transactions filled successfully. Value: ${inputValue}`
          );

          if (inputValue !== "1") {
            console.warn(`⚠️ Expected value "1", but got "${inputValue}"`);
          }
        } else {
          console.warn("⚠️ Number of transactions input not found");
        }
      } catch (err) {
        console.warn("⚠️ Failed to fill number of transactions:", err.message);
      }

      // --- Date Picker: Select 23rd of this month ---
      try {
        // Wait for the date input to be available
        const dateInput =
          (await page.$('input[formcontrolname="dateTimeValFormControl"]')) ||
          (await page.$("#mat-input-5")) ||
          (await page.$('input[data-placeholder="اختر موعد الحجز"]'));

        if (!dateInput) {
          console.warn("⚠️ Date input not found.");
        } else {
          // Helper to wait for the calendar DOM
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

          // 0) Try clicking the datepicker toggle button first
          let calendarVisible = false;
          try {
            const toggleBtn = await page.waitForSelector(
              'button[aria-label="Open calendar"]',
              { timeout: 3000 }
            );
            if (toggleBtn) {
              await toggleBtn.click();
              calendarVisible = await waitCalendar(5000);
            }
          } catch (_) {
            /* ignore, fallback to input click below */
          }

          // 1) If still not visible, click the input itself
          if (!calendarVisible) {
            await dateInput.click({ clickCount: 1 });
            calendarVisible = await waitCalendar(5000);
          }

          // 2) If still not visible, try fallback selectors for button
          if (!calendarVisible) {
            const calendarButtonFallback =
              (await page.$(".mat-datepicker-toggle button")) ||
              (await page.$("button.mat-icon-button"));
            if (calendarButtonFallback) {
              await calendarButtonFallback.click();
              calendarVisible = await waitCalendar(5000);
            }
          }

          if (!calendarVisible) {
            console.warn("⚠️ Calendar overlay did not appear.");
          } else {
            // Log availability of all days after today in this month
            const dayStatuses = await page.evaluate(() => {
              const todayDay = new Date().getDate();
              const cells = Array.from(
                document.querySelectorAll(".mat-calendar-body-cell")
              );
              return cells
                .map((cell) => {
                  const dayText = cell.textContent.trim();
                  const dayNum = parseInt(dayText, 10);
                  if (isNaN(dayNum) || dayNum <= todayDay) return null; // ignore past/today
                  const selectable = !cell.classList.contains(
                    "mat-calendar-body-disabled"
                  );
                  return { day: dayNum, selectable };
                })
                .filter(Boolean);
            });

            // Sort by day number and log each
            dayStatuses
              .sort((a, b) => a.day - b.day)
              .forEach((d) => {
                console.log(
                  `🗓️ Day ${d.day}: ${d.selectable ? "selectable" : "disabled"}`
                );
              });

            // Send to Telegram
            if (dayStatuses.length) {
              const msg =
                "🗓️ Availability for remaining days this month:\n" +
                dayStatuses
                  .sort((a, b) => a.day - b.day)
                  .map(
                    (d) =>
                      `Day ${d.day}: ${
                        d.selectable ? "✅ selectable" : "❌ disabled"
                      }`
                  )
                  .join("\n");
              // await sendTelegramMessage(msg);
            }

            // Choose the first selectable day after today and click it
            const chosenDay = await page.evaluate(() => {
              const today = new Date().getDate();
              const cells = Array.from(
                document.querySelectorAll(".mat-calendar-body-cell")
              );
              for (const cell of cells) {
                const dayNum = parseInt(cell.textContent.trim(), 10);
                if (
                  !isNaN(dayNum) &&
                  dayNum > today &&
                  !cell.classList.contains("mat-calendar-body-disabled")
                ) {
                  cell.click();
                  return dayNum;
                }
              }
              return null; // no selectable day
            });

            if (chosenDay) {
              const successMsg = `✅ Selected date ${chosenDay} of this month.`;
              console.log(successMsg);
              await sendTelegramMessage(successMsg);
              await new Promise((res) => setTimeout(res, 800));

              // Click the "حفظ وتثبيت" (Save and Confirm) button
              // try {
              //   console.log(
              //     '🚀 Clicking "حفظ وتثبيت" button after date selection...'
              //   );
              //   const saveBtn =
              //     (await page.$(
              //       'button[type="submit"][mat-raised-button][color="primary"]'
              //     )) ||
              //     (await page.$('button:has-text("حفظ وتثبيت")')) ||
              //     (await page.$('button.mat-primary[type="submit"]'));

              //   if (saveBtn) {
              //     await saveBtn.click();
              //     console.log("✅ Form submitted successfully.");
              //     await sendTelegramMessage("✅ Form submitted successfully.");
              //     // Wait a short while for backend to respond
              //     await new Promise((res) => setTimeout(res, 3000));
              //   } else {
              //     const saveWarn =
              //       "⚠️ Save button not found after selecting date.";
              //     console.warn(saveWarn);
              //     await sendTelegramMessage(saveWarn);
              //   }
              // } catch (err) {
              //   const errMsg = `⚠️ Failed to click save button: ${err.message}`;
              //   console.warn(errMsg);
              //   await sendTelegramMessage(errMsg);
              // }

              // Close browser and terminate script
              // await browser.close();
              // process.exit(0);
            } else {
              const warnMsg = "⚠️ No selectable dates remaining in this month.";
              console.warn(warnMsg);
              await sendTelegramMessage(warnMsg);
              // await browser.close();
              // process.exit(0);
            }
          }
        }
      } catch (err) {
        console.warn("⚠️ Failed to select date:", err.message);
      }
      // --- End Date Picker ---

      // Click the "حفظ وتثبيت" (Save and Confirm) button
      // try {
      //   console.log("🚀 Clicking 'حفظ وتثبيت' button...");

      //   // Try multiple selectors for the submit button
      //   const submitButton =
      //     (await page.$(
      //       'button[type="submit"][mat-raised-button][color="primary"]'
      //     )) ||
      //     (await page.$('button[type="submit"]')) ||
      //     (await page.$('button:has-text("حفظ وتثبيت")'));

      //   if (submitButton) {
      //     await submitButton.click();
      //     console.log("✅ Form submitted successfully.");

      //     // Wait for the dialog to close or for any response
      //     await new Promise((resolve) => setTimeout(resolve, 3000));
      //   } else {
      //     console.warn("⚠️ Submit button not found");
      //   }
      // } catch (err) {
      //   console.warn("⚠️ Failed to submit form:", err.message);
      // }
    } else {
      console.log(
        "⚠️ Embassy appointment button not found, continuing to user profile..."
      );
    }
  } catch (err) {
    console.warn("⚠️ Failed to click embassy appointment button:", err.message);
    console.log("🔄 Continuing to user profile...");
  }

  // console.log("🔄 Navigating to user profile...");
  // await page.goto("https://www.ecsc-expat.sy/login/user-profile", {
  //   waitUntil: "domcontentloaded",
  // });

  // console.log("⌛ Waiting for user profile form...");
  // await page.waitForSelector('form[name="requestform"]');

  // console.log("📝 Filling profile text inputs...");
  // await page.type('input[formcontrolname="firstNameFormControl"]', "محمد");
  // await page.type('input[formcontrolname="lastNameFormControl"]', "الناصر");
  // await page.type('input[formcontrolname="fatherNameFormControl"]', "علي");
  // await page.type('input[formcontrolname="motherNameFormControl"]', "فاطمة");
  // await page.type(
  //   'input[formcontrolname="nationalIdFormControl"]',
  //   "02245645646"
  // );
  // await page.type(
  //   'input[formcontrolname="birthDateFormControl"]',
  //   "06/02/1996"
  // );

  // Select gender dropdown
  // try {
  //   console.log("🔽 Opening gender dropdown...");
  //   await page.click('mat-select[formcontrolname="genderFormControl"]');
  //   await page.waitForSelector("mat-option", { timeout: 5000 });

  //   console.log("🔘 Selecting gender: ذكر...");
  //   await page.evaluate(() => {
  //     const options = Array.from(document.querySelectorAll("mat-option"));
  //     const maleOption = options.find(
  //       (opt) => opt.textContent.trim() === "ذكر"
  //     );
  //     if (maleOption) maleOption.click();
  //   });

  //   await page.waitForTimeout(500);
  //   console.log("✅ Gender selected successfully.");
  // } catch (err) {
  //   console.warn("⚠️ Failed to select gender:", err);
  // }

  // Select birthplace with search
  // try {
  //   console.log("🔽 Opening birthplace dropdown...");
  //   await page.click('mat-select[formcontrolname="birthBlaceFormControl"]');

  //   const searchInputSelector =
  //     '.cdk-overlay-container input[type="search"], .cdk-overlay-container input.mat-input-element';
  //   await page.waitForSelector(searchInputSelector, { timeout: 7000 });

  //   console.log("🔍 Typing birthplace search term: حمص");
  //   await page.type(searchInputSelector, "حمص");

  //   await page.waitForFunction(
  //     () => {
  //       const overlay = document.querySelector(".cdk-overlay-container");
  //       if (!overlay) return false;
  //       const options = Array.from(overlay.querySelectorAll("mat-option"));
  //       return options.some((opt) => opt.textContent.trim() === "حمص");
  //     },
  //     { timeout: 7000 }
  //   );

  //   console.log("🔘 Selecting birthplace: حمص");
  //   await page.evaluate(() => {
  //     const overlay = document.querySelector(".cdk-overlay-container");
  //     const options = Array.from(overlay.querySelectorAll("mat-option"));
  //     const option = options.find((opt) => opt.textContent.trim() === "حمص");
  //     if (option) option.click();
  //   });

  //   await page.waitForTimeout(500);
  //   console.log("✅ Birthplace selected successfully.");
  // } catch (err) {
  //   console.warn("⚠️ Failed to select birthplace:", err);
  // }

  // Click the "الخطوة التالية" (Next Step) button
  // try {
  //   console.log('🚀 Clicking "الخطوة التالية" button...');
  //   await page.click(
  //     'button[type="submit"][mat-raised-button][color="primary"]'
  //   );

  //   // Wait some time for AJAX requests to complete
  //   await page.waitForTimeout(5000);

  //   console.log('✅ "الخطوة التالية" button clicked.');
  // } catch (err) {
  //   console.error('❌ Failed to click "الخطوة التالية" button:', err);
  // }

  // Log any non-200 API responses captured during the session
  // if (non200Responses.length > 0) {
  //   console.warn("⚠️ Non-200 API responses detected:");
  //   non200Responses.forEach((resp) => {
  //     console.warn(
  //       `- URL: ${resp.url} | Status: ${resp.status} ${resp.statusText}`
  //     );
  //   });
  // } else {
  //   console.log("✅ No non-200 API responses detected.");
  // }

  // If we've already sent a Telegram notification, we can shut down early.
  if (telegramSent) {
    clearTimeout(forceCloseTimer);
    try {
      await browser.close();
    } catch (_) {}
    process.exit(0);
  }

  // Otherwise, keep the script alive; the force-close timer will handle shutdown.
  await new Promise(() => {});
})();
