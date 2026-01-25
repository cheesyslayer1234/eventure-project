/// <reference types="cypress" />

const maxCharacterDummy =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).";

describe("Frontend Event Tests", () => {
  const BASE_URL = "http://localhost:5050";

  beforeEach(() => {
    cy.visit(BASE_URL);
    cy.contains("button", "Create Event").click();
  });

  // Positive

  it("Add Event Form with valid inputs should submit successfully", () => {
    const eventName = `Test Event ${Date.now()}`;

    cy.get("#eventName").type(eventName);
    cy.get("#eventDescription").type("Room 101 for testing");
    cy.get("#eventDate").type("2026-01-20");
    cy.get("#eventTime").type("15:00");
    cy.get("#eventLocation").type("TP IIT Blk 3");
    cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Event created successfully!");
    });

    cy.contains("button", "Add Event").click();
    cy.get("#addEventModal").should("not.be.visible");
  });

  // ---------------- NEGATIVE ----------------

  it("Missing inputs should show validation errors", () => {
    // Do not type anything
    cy.on("window:alert", (msg: string) => {
      expect(msg).to.include("Event name is required");
      expect(msg).to.include("Description is required");
      expect(msg).to.include("Date is required");
      expect(msg).to.include("Time is required");
      expect(msg).to.include("Location is required");
      expect(msg).to.include("Please upload an image");
    });

    cy.contains("button", "Add Event").click();
  });

  it("Invalid date should show error", () => {
    cy.get("#eventName").type("Past Event");
    cy.get("#eventDescription").type("Desc");
    cy.get("#eventDate").type("2020-01-01");
    cy.get("#eventTime").type("10:00");
    cy.get("#eventLocation").type("TP");
    cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Please select a future date.");
    });

    cy.contains("button", "Add Event").click();
  });

  it("Invalid event name should show error", () => {
    cy.get("#eventName").type("123456");
    cy.get("#eventDescription").type("Desc");
    cy.get("#eventDate").type("2026-01-20");
    cy.get("#eventTime").type("10:00");
    cy.get("#eventLocation").type("TP");
    cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("alphabetical");
    });

    cy.contains("button", "Add Event").click();
  });

  it("Event name exceeding max length", () => {
    cy.get("#eventName").type(maxCharacterDummy);
    cy.get("#eventDescription").type("Desc");
    cy.get("#eventDate").type("2026-01-20");
    cy.get("#eventTime").type("10:00");
    cy.get("#eventLocation").type("TP");
    cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain(
        "Max character limit reached for Event Name (100)"
      );
    });

    cy.contains("button", "Add Event").click();
  });

  it("Description exceeding max length", () => {
    cy.get("#eventName").type("Valid Name");
    cy.get("#eventDescription").type(maxCharacterDummy);
    cy.get("#eventDate").type("2026-01-20");
    cy.get("#eventTime").type("10:00");
    cy.get("#eventLocation").type("TP");
    cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain(
        "Max character limit reached for Description (500)"
      );
    });

    cy.contains("button", "Add Event").click();
  });

  it("Location exceeding max length", () => {
    cy.get("#eventName").type("Valid Name");
    cy.get("#eventDescription").type("Desc");
    cy.get("#eventDate").type("2026-01-20");
    cy.get("#eventTime").type("10:00");
    cy.get("#eventLocation").type(maxCharacterDummy);
    cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Max character limit reached for Location (150)");
    });

    cy.contains("button", "Add Event").click();
  });

  it("Image exceeding max size", () => {
    cy.get("#eventName").type("Valid Name");
    cy.get("#eventDescription").type("Desc");
    cy.get("#eventDate").type("2026-01-20");
    cy.get("#eventTime").type("10:00");
    cy.get("#eventLocation").type("TP");

    cy.get("#eventImage").selectFile({
      contents: Cypress.Buffer.alloc(60 * 1024),
      fileName: "big.jpg",
      mimeType: "image/jpeg",
    });

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Image size must be less than 50KB");
    });

    cy.contains("button", "Add Event").click();
  });

  // ---------------- EDGE CASES ----------------

  it("Backend 400 should show error dialog", () => {
    fillValidForm();

    cy.intercept("POST", "**/add-event", {
      statusCode: 400,
      body: { message: "Bad request" },
    });

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Error");
    });

    cy.contains("button", "Add Event").click();
  });

  it("Backend 500 should show server error", () => {
    fillValidForm();

    cy.intercept("POST", "**/add-event", {
      statusCode: 500,
      body: "Server error",
    });

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Server error");
    });

    cy.contains("button", "Add Event").click();
  });

  it("Network failure should show server error", () => {
    fillValidForm();

    cy.intercept("POST", "**/add-event", { forceNetworkError: true });

    cy.on("window:alert", (msg: string) => {
      expect(msg).to.contain("Server error");
    });

    cy.contains("button", "Add Event").click();
  });
});

// ---------- HELPER FUNCTION ----------

function fillValidForm(): void {
  cy.get("#eventName").type("Valid Form");
  cy.get("#eventDescription")
    .should("exist")  
    .should("be.visible")  
    .clear({ force: true })
    .type("Desc", { force: true });
  cy.get("#eventDate").type("2026-01-20");
  cy.get("#eventTime").type("10:00");
  cy.get("#eventLocation").type("TP");
  cy.get("#eventImage").selectFile("cypress/fixtures/test-image.jpg");
}
