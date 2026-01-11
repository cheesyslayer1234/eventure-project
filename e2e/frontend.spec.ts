import "./playwright-coverage";
import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import path from "path";
import config from "../playwright.config";

test.setTimeout(100000);

const BASE_URL = "http://localhost:5050";
const EVENTS_FILE = path.join(__dirname, "../utils/events.json");

test.beforeAll(async () => {
  const projects: { name: string }[] = (config as any).projects ?? [];
  const browsers: string[] = projects.map((p) => p.name);
});

test.describe("Frontend Event Tests", () => {
  // Positive Cases
  test("Add Event Form with all valid inputs should submit successfully with success dialog and message.", async ({
    page,
  }) => {
    const eventName = `Test Event ${Date.now()}`;

    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", eventName);
    await page.fill("#eventDescription", "Room 101 for testing");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "15:00");
    await page.fill("#eventLocation", "TP IIT Blk 3");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    await page.click('button:has-text("Add Event")');
    await page.waitForSelector("#addEventModal", { state: "hidden" });

    page.once("dialog", (d) => {
      expect(d.message()).toContain("Event created successfully!");
      d.accept();
    });
  });

  // Negative Cases
  test("Event form with missing inputs should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    // Leave all fields empty
    page.once("dialog", (d) => {
      expect(d.message()).toContain("Event name is required");
      expect(d.message()).toContain("Description is required");
      expect(d.message()).toContain("Date is required");
      expect(d.message()).toContain("Time is required");
      expect(d.message()).toContain("Location is required");
      expect(d.message()).toContain("Please upload an image");
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  test("Event form with invalid date should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Past Event");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2020-01-01");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    page.once("dialog", (d) => {
      expect(d.message()).toContain("Please select a future date.");
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  test("Event form with invalid event name should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "123456");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    page.once("dialog", (d) => {
      expect(d.message()).toContain("alphabetical");
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  test("Event form with event name exceeding max character limit should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Eventname".repeat(50));
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    page.once("dialog", (d) => {
      expect(d.message()).toContain(
        "Max character limit reached for Event Name (100)"
      );
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  test("Event form with description exceeding max character limit should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Valid Name");
    await page.fill("#eventDescription", "Description".repeat(51));
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    page.once("dialog", (d) => {
      expect(d.message()).toContain(
        "Max character limit reached for Description (500)"
      );
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  test("Event form with location exceeding max character limit should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Valid Name");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "Location".repeat(20));

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    page.once("dialog", (d) => {
      expect(d.message()).toContain(
        "Max character limit reached for Location (150)"
      );
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  test("Event form with image exceeding max size should not submit and return an error dialog and message.", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Valid Name");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles("#eventImage", {
      name: "big.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(60 * 1024),
    });

    page.once("dialog", (d) => {
      expect(d.message()).toContain("Image size must be less than 50KB");
      d.accept();
    });

    await page.click('button:has-text("Add Event")');
  });

  // Edge Cases
  test("Frontend should show error dialog when backend returns 400", async ({
    page,
  }) => {
    await page.route("**/add-event", (route) =>
      route.fulfill({
        status: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Bad request" }),
      })
    );

    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Valid");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    const dialogPromise = page.waitForEvent("dialog");
    await page.click('button:has-text("Add Event")');
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("Error:");
    await dialog.accept();
  }); //idk bro

  // Error Handling & Exception Validations
  test("Frontend should show server error dialog when backend returns 500", async ({
    page,
  }) => {
    await page.route("**/add-event", (route) =>
      route.fulfill({ status: 500, body: "Server error" })
    );

    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Valid");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    const dialogPromise = page.waitForEvent("dialog");
    await page.click('button:has-text("Add Event")');
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("Server error");
    await dialog.accept();
  });

  test("Frontend should show server error dialog when network failure while submitting", async ({
    page,
  }) => {
    await page.route("**/add-event", (route) => route.abort("failed"));

    await page.goto(BASE_URL);
    await page.click('button:has-text("Create Event")');

    await page.fill("#eventName", "Valid");
    await page.fill("#eventDescription", "Desc");
    await page.fill("#eventDate", "2026-01-20");
    await page.fill("#eventTime", "10:00");
    await page.fill("#eventLocation", "TP");

    await page.setInputFiles(
      "#eventImage",
      path.join(__dirname, "assets/test-image.jpg")
    );

    const dialogPromise = page.waitForEvent("dialog");
    await page.click('button:has-text("Add Event")');
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("Server error");
    await dialog.accept();
  });
});

test.describe("Visual Layouts of Event Management Homepage", () => {
  test("compare with my own image", async ({ page }) => {
    await page.goto("http://localhost:5050");

    await expect(page).toHaveScreenshot("add-event-modal.png", {});
  });
});
