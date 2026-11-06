const { Builder, By, until } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const assert = require("node:assert/strict");

async function answerPrompt(driver, value) {
  await driver.wait(until.alertIsPresent(), 5000);
  const prompt = await driver.switchTo().alert();
  await prompt.sendKeys(value);
  await prompt.accept();
}

(async function hospitalTests() {
  const chromeOptions = new Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
  const driver = await new Builder().forBrowser("chrome").setChromeOptions(chromeOptions).build();
  const base = process.env.APP_URL || "http://localhost:8080";
  const email = `patient${Date.now()}@example.test`;
  const appointmentDate = "2027-01-10";
  const appointmentTime = "10:30 AM";
  try {
    await driver.get(base);
    await driver.wait(until.titleContains("CarePoint"), 10000);
    console.log("Application page opened successfully");

    await driver.findElement(By.id("regName")).sendKeys("Test Patient");
    await driver.findElement(By.id("regEmail")).sendKeys(email);
    await driver.findElement(By.id("regPassword")).sendKeys("patient123");
    await driver.findElement(By.css("#registerForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("message"))), 5000);
    assert.match(await driver.findElement(By.id("message")).getText(), /registration successful/i);
    console.log("TC01 PASS - patient registration successful");

    await driver.findElement(By.id("loginEmail")).sendKeys(email);
    await driver.findElement(By.id("loginPassword")).sendKeys("patient123");
    await driver.findElement(By.css("#loginForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("patientApp"))), 5000);
    assert.ok((await driver.findElement(By.id("doctorList")).getText()).includes("Dr."));
    console.log("TC02 PASS - patient login successful");

    await driver.findElement(By.id("specialtyFilter")).sendKeys("Cardiology");
    assert.ok((await driver.findElement(By.id("doctorList")).getText()).includes("Cardiology"));
    console.log("TC03 PASS - doctors searched by specialization");
    await driver.findElement(By.id("specialtyFilter")).sendKeys("All specializations");

    await driver.findElement(By.css("[data-book='D01']")).click();
    await answerPrompt(driver, appointmentDate);
    await answerPrompt(driver, appointmentTime);
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("message"))), 5000);
    assert.match(await driver.findElement(By.id("message")).getText(), /appointment confirmed/i);
    console.log("TC04 PASS - available appointment slot booked");

    await driver.findElement(By.css("[data-book='D01']")).click();
    await answerPrompt(driver, appointmentDate);
    await answerPrompt(driver, appointmentTime);
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("message"))), 5000);
    assert.match(await driver.findElement(By.id("message")).getText(), /already booked/i);
    console.log("TC05 PASS - occupied appointment slot rejected");

    await driver.findElement(By.css("[data-tab='appointments']")).click();
    await driver.wait(until.elementLocated(By.css("[data-cancel]")), 5000);
    await driver.findElement(By.css("[data-cancel]")).click();
    assert.ok((await driver.findElement(By.id("myAppointments")).getText()).includes("Cancelled"));
    console.log("TC06 PASS - appointment cancellation");

    assert.ok((await driver.findElement(By.id("myAppointments")).getText()).includes("Dr. Asha Reddy"));
    console.log("TC07 PASS - patient views appointment details");

    await driver.findElement(By.id("logoutBtn")).click();
    await driver.findElement(By.id("loginEmail")).clear();
    await driver.findElement(By.id("loginPassword")).clear();
    await driver.findElement(By.id("loginEmail")).sendKeys("admin@hospital.test");
    await driver.findElement(By.id("loginPassword")).sendKeys("admin123");
    await driver.findElement(By.css("#loginForm button[type='submit']")).click();
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("adminApp"))), 5000);
    assert.ok((await driver.findElement(By.id("adminAppointments")).getText()).includes(email));
    console.log("TC08 PASS - admin views appointment details");
  } catch (err) {
    console.error("HOSPITAL TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
})();
