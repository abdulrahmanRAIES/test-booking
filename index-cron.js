const cron = require("node-cron");
const { exec } = require("child_process");

cron.schedule("*/5 * * * *", () => {
  console.log("⏰ Running job at", new Date().toLocaleTimeString());
  exec("node booking_availability_check.js", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error:", err.message);
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });
});
