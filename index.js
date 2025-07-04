// v1
// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     timeout: 0
//   });

//   const page = await browser.newPage();

//   await page.goto('https://www.ecsc-expat.sy/login', {
//     waitUntil: 'domcontentloaded',
//     timeout: 0
//   });

//   // Wait for inputs to be ready
//   await page.waitForSelector('#mat-input-0');
//   await page.waitForSelector('#mat-input-1');

//   // Fill email and password
//   await page.type('#mat-input-0', 'pixoh98024@asimarif.com');
//   await page.type('#mat-input-1', '12345678Aa');

//   // Click login button and wait for navigation
//   await Promise.all([
//     page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }),
//     page.click('button[type="submit"]')
//   ]);

//   console.log('✅ Logged in! Browser stays open for you to check.');
//     await page.goto('https://www.ecsc-expat.sy/login/user-profile', { waitUntil: 'domcontentloaded' });
//     await page.waitForSelector('form[name="requestform"]');

//     // Fill text inputs
//     await page.type('input[formcontrolname="firstNameFormControl"]', 'محمد');
//     await page.type('input[formcontrolname="lastNameFormControl"]', 'الناصر');
//     await page.type('input[formcontrolname="fatherNameFormControl"]', 'علي');
//     await page.type('input[formcontrolname="motherNameFormControl"]', 'فاطمة');
//     await page.type('input[formcontrolname="nationalIdFormControl"]', '12345678901234');
//     await page.type('input[formcontrolname="birthDateFormControl"]', '06/02/1996');
//     await page.click('mat-select[formcontrolname="genderFormControl"]'); // open the dropdown
//     // Wait for options container to appear
//     await page.waitForSelector('mat-option');

//     // Click the option with text "ذكر"
//     await page.evaluate(() => {
//     const options = [...document.querySelectorAll('mat-option')];
//     const maleOption = options.find(opt => opt.textContent.trim() === 'ذكر');
//     if (maleOption) {
//         maleOption.click();
//     }
//     });
//  // Click to open the birthBlaceFormControl dropdown
//     await page.click('mat-select[formcontrolname="birthBlaceFormControl"]');

//     // Wait for options to appear
//     await page.waitForSelector('mat-option');

//     // Select the option with text "حماه"
//     await page.evaluate(() => {
//     const options = Array.from(document.querySelectorAll('mat-option'));
//     const option = options.find(opt => opt.textContent.trim() === 'حماه');
//     if (option) option.click();
//     });

//     console.log('✅ Reached user-profile page');
//   // Keep browser open
//   await new Promise(() => {});
// })();
// v2
// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     timeout: 0
//   });

//   const page = await browser.newPage();

//   console.log('🔄 Navigating to login page...');
//   await page.goto('https://www.ecsc-expat.sy/login', {
//     waitUntil: 'domcontentloaded',
//     timeout: 0
//   });

//   console.log('⌛ Waiting for login inputs...');
//   await page.waitForSelector('#mat-input-0');
//   await page.waitForSelector('#mat-input-1');

//   console.log('📝 Filling email and password...');
//   await page.type('#mat-input-0', 'pixoh98024@asimarif.com');
//   await page.type('#mat-input-1', '12345678Aa');

//   console.log('🚀 Clicking login button and waiting for navigation...');
//   await Promise.all([
//     page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }),
//     page.click('button[type="submit"]')
//   ]);

//   console.log('✅ Logged in successfully!');

//   console.log('🔄 Navigating to user profile...');
//   await page.goto('https://www.ecsc-expat.sy/login/user-profile', { waitUntil: 'domcontentloaded' });

//   console.log('⌛ Waiting for user profile form...');
//   await page.waitForSelector('form[name="requestform"]');

//   console.log('📝 Filling profile text inputs...');
//   await page.type('input[formcontrolname="firstNameFormControl"]', 'محمد');
//   await page.type('input[formcontrolname="lastNameFormControl"]', 'الناصر');
//   await page.type('input[formcontrolname="fatherNameFormControl"]', 'علي');
//   await page.type('input[formcontrolname="motherNameFormControl"]', 'فاطمة');
//   await page.type('input[formcontrolname="nationalIdFormControl"]', '12345678901234');
//   await page.type('input[formcontrolname="birthDateFormControl"]', '06/02/1996');

//   // Select gender
//   console.log('🔽 Opening gender dropdown...');
//   await page.click('mat-select[formcontrolname="genderFormControl"]');
//   await page.waitForSelector('mat-option');

//   console.log('🔘 Selecting gender: ذكر...');
//   await page.evaluate(() => {
//     const options = [...document.querySelectorAll('mat-option')];
//     const maleOption = options.find(opt => opt.textContent.trim() === 'ذكر');
//     if (maleOption) maleOption.click();
//   });
// //   await page.waitForTimeout(500); // small delay to ensure selection processed
//   await new Promise(resolve => setTimeout(resolve, 500));

//   // Select birthplace
// //   console.log('🔽 Opening birthplace dropdown...');
// //   await page.click('mat-select[formcontrolname="birthBlaceFormControl"]');
// //   await page.waitForSelector('mat-option');

// //   console.log('🔘 Selecting birthplace: حماه...');
// //   await page.evaluate(() => {
// //     const options = Array.from(document.querySelectorAll('mat-option'));
// //     const option = options.find(opt => opt.textContent.trim() === 'حمص');
// //     if (option) option.click();
// //   });
// console.log('🔽 Opening birthplace dropdown...');
// // 1. Open the dropdown
// await page.click('mat-select[formcontrolname="birthBlaceFormControl"]');

// // 2. Wait for the search input to appear inside the overlay container
// const searchInputSelector = '.cdk-overlay-container input[type="search"], .cdk-overlay-container input.mat-input-element';
// await page.waitForSelector(searchInputSelector);

// // 3. Type the search term
// await page.type(searchInputSelector, 'حمص');

// // 4. Wait for options container and wait until your option appears
// await page.waitForFunction(() => {
//   const overlay = document.querySelector('.cdk-overlay-container');
//   if (!overlay) return false;
//   const options = Array.from(overlay.querySelectorAll('mat-option'));
//   return options.some(opt => opt.textContent.trim() === 'حمص');
// }, { timeout: 5000 });

// // 5. Click the matched option
// await page.evaluate(() => {
//   const overlay = document.querySelector('.cdk-overlay-container');
//   const options = Array.from(overlay.querySelectorAll('mat-option'));
//   const option = options.find(opt => opt.textContent.trim() === 'حمص');
//   if (option) option.click();
// });
// //   await page.waitForTimeout(500); // small delay to ensure selection processed
// await new Promise(resolve => setTimeout(resolve, 500));

//   console.log('✅ User profile form filled successfully.');

//   // Keep browser open
//   await new Promise(() => {});
// })();
// v3
// const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     timeout: 0
//   });

//   const page = await browser.newPage();

//   console.log('🔄 Navigating to login page...');
//   await page.goto('https://www.ecsc-expat.sy/login', {
//     waitUntil: 'domcontentloaded',
//     timeout: 0
//   });

//   console.log('⌛ Waiting for login inputs...');
//   await page.waitForSelector('#mat-input-0');
//   await page.waitForSelector('#mat-input-1');

//   console.log('📝 Filling email and password...');
//   await page.type('#mat-input-0', 'pixoh98024@asimarif.com');
//   await page.type('#mat-input-1', '12345678Aa');

//   console.log('🚀 Clicking login button and waiting for navigation...');
//   await Promise.all([
//     page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }),
//     page.click('button[type="submit"]')
//   ]);

//   console.log('✅ Logged in successfully!');

//   console.log('🔄 Navigating to user profile...');
//   await page.goto('https://www.ecsc-expat.sy/login/user-profile', { waitUntil: 'domcontentloaded' });

//   console.log('⌛ Waiting for user profile form...');
//   await page.waitForSelector('form[name="requestform"]');

//   console.log('📝 Filling profile text inputs...');
//   await page.type('input[formcontrolname="firstNameFormControl"]', 'محمد');
//   await page.type('input[formcontrolname="lastNameFormControl"]', 'الناصر');
//   await page.type('input[formcontrolname="fatherNameFormControl"]', 'علي');
//   await page.type('input[formcontrolname="motherNameFormControl"]', 'فاطمة');
//   await page.type('input[formcontrolname="nationalIdFormControl"]', '02245645646');
//   await page.type('input[formcontrolname="birthDateFormControl"]', '06/02/1996');

//   // Select gender (simple dropdown)
//   try {
//     console.log('🔽 Opening gender dropdown...');
//     await page.click('mat-select[formcontrolname="genderFormControl"]');

//     await page.waitForSelector('mat-option', { timeout: 5000 });

//     console.log('🔘 Selecting gender: ذكر...');
//     await page.evaluate(() => {
//       const options = Array.from(document.querySelectorAll('mat-option'));
//       const maleOption = options.find(opt => opt.textContent.trim() === 'ذكر');
//       if (maleOption) maleOption.click();
//     });

//     await new Promise(resolve => setTimeout(resolve, 500));
//     console.log('✅ Gender selected successfully.');
//   } catch (err) {
//     console.warn('⚠️ Failed to select gender:', err);
//   }

//   // Select birthplace with search
//   try {
//     console.log('🔽 Opening birthplace dropdown...');
//     await page.click('mat-select[formcontrolname="birthBlaceFormControl"]');

//     const searchInputSelector = '.cdk-overlay-container input[type="search"], .cdk-overlay-container input.mat-input-element';
//     await page.waitForSelector(searchInputSelector, { timeout: 7000 });

//     console.log('🔍 Typing birthplace search term: حمص');
//     await page.type(searchInputSelector, 'حمص');

//     await page.waitForFunction(() => {
//       const overlay = document.querySelector('.cdk-overlay-container');
//       if (!overlay) return false;
//       const options = Array.from(overlay.querySelectorAll('mat-option'));
//       return options.some(opt => opt.textContent.trim() === 'حمص');
//     }, { timeout: 7000 });

//     console.log('🔘 Selecting birthplace: حمص');
//     await page.evaluate(() => {
//       const overlay = document.querySelector('.cdk-overlay-container');
//       const options = Array.from(overlay.querySelectorAll('mat-option'));
//       const option = options.find(opt => opt.textContent.trim() === 'حمص');
//       if (option) option.click();
//     });

//     await new Promise(resolve => setTimeout(resolve, 500));
//     console.log('✅ Birthplace selected successfully.');
//   } catch (err) {
//     console.warn('⚠️ Failed to select birthplace:', err);
//   }

//   // Click the "الخطوة التالية" (Next Step) button after filling form or if selects failed
//   try {
//     console.log('🚀 Clicking "الخطوة التالية" button...');
//     await page.click('button[type="submit"][mat-raised-button][color="primary"]');
//     console.log('✅ "الخطوة التالية" button clicked.');
//   } catch (err) {
//     console.error('❌ Failed to click "الخطوة التالية" button:', err);
//   }

//   // Keep browser open for inspection (remove this line if you want to close automatically)
//   await new Promise(() => {});
// })();
// const puppeteer = require('puppeteer');
const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    timeout: 0,
  });

  const page = await browser.newPage();

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
  await page.type("#mat-input-0", "pixoh98024@asimarif.com");
  await page.type("#mat-input-1", "12345678Aa");

  console.log("🚀 Clicking login button and waiting for navigation...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 }),
    page.click('button[type="submit"]'),
  ]);

  console.log("✅ Logged in successfully!");

  console.log("🔄 Navigating to user profile...");
  await page.goto("https://www.ecsc-expat.sy/login/user-profile", {
    waitUntil: "domcontentloaded",
  });

  console.log("⌛ Waiting for user profile form...");
  await page.waitForSelector('form[name="requestform"]');

  console.log("📝 Filling profile text inputs...");
  await page.type('input[formcontrolname="firstNameFormControl"]', "محمد");
  await page.type('input[formcontrolname="lastNameFormControl"]', "الناصر");
  await page.type('input[formcontrolname="fatherNameFormControl"]', "علي");
  await page.type('input[formcontrolname="motherNameFormControl"]', "فاطمة");
  await page.type(
    'input[formcontrolname="nationalIdFormControl"]',
    "02245645646"
  );
  await page.type(
    'input[formcontrolname="birthDateFormControl"]',
    "06/02/1996"
  );

  // Select gender dropdown
  try {
    console.log("🔽 Opening gender dropdown...");
    await page.click('mat-select[formcontrolname="genderFormControl"]');
    await page.waitForSelector("mat-option", { timeout: 5000 });

    console.log("🔘 Selecting gender: ذكر...");
    await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll("mat-option"));
      const maleOption = options.find(
        (opt) => opt.textContent.trim() === "ذكر"
      );
      if (maleOption) maleOption.click();
    });

    await page.waitForTimeout(500);
    console.log("✅ Gender selected successfully.");
  } catch (err) {
    console.warn("⚠️ Failed to select gender:", err);
  }

  // Select birthplace with search
  try {
    console.log("🔽 Opening birthplace dropdown...");
    await page.click('mat-select[formcontrolname="birthBlaceFormControl"]');

    const searchInputSelector =
      '.cdk-overlay-container input[type="search"], .cdk-overlay-container input.mat-input-element';
    await page.waitForSelector(searchInputSelector, { timeout: 7000 });

    console.log("🔍 Typing birthplace search term: حمص");
    await page.type(searchInputSelector, "حمص");

    await page.waitForFunction(
      () => {
        const overlay = document.querySelector(".cdk-overlay-container");
        if (!overlay) return false;
        const options = Array.from(overlay.querySelectorAll("mat-option"));
        return options.some((opt) => opt.textContent.trim() === "حمص");
      },
      { timeout: 7000 }
    );

    console.log("🔘 Selecting birthplace: حمص");
    await page.evaluate(() => {
      const overlay = document.querySelector(".cdk-overlay-container");
      const options = Array.from(overlay.querySelectorAll("mat-option"));
      const option = options.find((opt) => opt.textContent.trim() === "حمص");
      if (option) option.click();
    });

    await page.waitForTimeout(500);
    console.log("✅ Birthplace selected successfully.");
  } catch (err) {
    console.warn("⚠️ Failed to select birthplace:", err);
  }

  // Click the "الخطوة التالية" (Next Step) button
  try {
    console.log('🚀 Clicking "الخطوة التالية" button...');
    await page.click(
      'button[type="submit"][mat-raised-button][color="primary"]'
    );

    // Wait some time for AJAX requests to complete
    await page.waitForTimeout(5000);

    console.log('✅ "الخطوة التالية" button clicked.');
  } catch (err) {
    console.error('❌ Failed to click "الخطوة التالية" button:', err);
  }

  // Log any non-200 API responses captured during the session
  if (non200Responses.length > 0) {
    console.warn("⚠️ Non-200 API responses detected:");
    non200Responses.forEach((resp) => {
      console.warn(
        `- URL: ${resp.url} | Status: ${resp.status} ${resp.statusText}`
      );
    });
  } else {
    console.log("✅ No non-200 API responses detected.");
  }

  // Keep browser open for inspection (remove or close if you want)
  await new Promise(() => {});
})();

// logger
// const puppeteer = require('puppeteer');

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     timeout: 0
//   });

//   const page = await browser.newPage();

//   try {
//     await page.goto('https://www.ecsc-expat.sy/login', {
//       waitUntil: 'domcontentloaded',
//       timeout: 0
//     });

//     // Manual wait for Angular to render form (3 seconds)
//     await delay(3000);

//     // Log all input fields and their attributes
//     const inputIds = await page.evaluate(() => {
//       const inputs = Array.from(document.querySelectorAll('input'));
//       return inputs.map(input => ({
//         tag: input.tagName,
//         type: input.type,
//         id: input.id,
//         name: input.name,
//         ariaLabel: input.getAttribute('aria-label'),
//         placeholder: input.placeholder
//       }));
//     });

//     console.log("🔍 Found inputs:");
//     inputIds.forEach((input, index) => {
//       console.log(`${index + 1}:`, input);
//     });

//     await new Promise(() => {}); // Keeps browser open

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     await browser.close();
//   }
// })();
