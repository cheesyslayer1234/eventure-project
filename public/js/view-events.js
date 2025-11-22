// Holds loaded events in memory
let eventsData = [];

// Stores the ID of the event selected for deletion
let pendingDeleteId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadEvents();

  // Create Event button → opens modal
  const createBtn = document.getElementById("create-event-btn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      $("#addEventModal").modal("show");
    });
  }

  setupDeleteModal();
});


// Fetch events from backend and render them
async function loadEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = "Loading events...";

  try {
    const response = await fetch("/view-events");
    if (!response.ok) throw new Error("Failed to fetch events.");

    const data = await response.json();
    eventsData = Array.isArray(data) ? data : [];
    renderEvents(eventsData);

  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="empty-state">Unable to load events at the moment.</p>`;
  }
}


// Render all events as cards
function renderEvents(events) {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  if (!events || events.length === 0) {
    container.innerHTML = `<p class="empty-state">No events found. Please create one!</p>`;
    return;
  }

  events.forEach(event => {
    const card = createEventCard(event);
    container.appendChild(card);
  });
}


// Create a single event card element
function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";

  // Image
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "event-card__image";

  if (event.image) {
    const img = document.createElement("img");
    img.src = event.image;
    img.alt = event.name || "Event image";
    imageWrapper.appendChild(img);
  }

  // Event content
  const body = document.createElement("div");
  body.className = "event-card__body";

  const titleEl = document.createElement("h2");
  titleEl.className = "event-title";
  titleEl.textContent = event.name || "Untitled Event";

  body.appendChild(titleEl);

  appendMeta(body, "Description", event.description);
  appendMeta(body, "Date", event.date);
  appendMeta(body, "Time", event.time);
  appendMeta(body, "Location", event.location);

  // Actions
  const actions = document.createElement("div");
  actions.className = "event-card__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => {
    editEvent(event);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    openDeleteModal(event.id);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(imageWrapper);
  card.appendChild(body);
  card.appendChild(actions);

  return card;
}


// Helper to add label + value pairs
function appendMeta(parent, label, value) {
  const labelEl = document.createElement("div");
  labelEl.className = "event-meta-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "event-meta-value";
  valueEl.textContent = value || "-";

  parent.appendChild(labelEl);
  parent.appendChild(valueEl);
}


// Setup delete confirmation modal
function setupDeleteModal() {
  const overlay = document.getElementById("delete-modal-overlay");
  const confirmBtn = document.getElementById("confirm-delete-btn");
  const cancelBtn = document.getElementById("cancel-delete-btn");

  if (!overlay || !confirmBtn || !cancelBtn) return;

  cancelBtn.addEventListener("click", closeDeleteModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDeleteModal();
  });

  confirmBtn.addEventListener("click", async () => {
    if (!pendingDeleteId) return;
    await handleDelete(pendingDeleteId);
    closeDeleteModal();
  });
}


// Opens delete modal
function openDeleteModal(eventId) {
  pendingDeleteId = eventId;
  const overlay = document.getElementById("delete-modal-overlay");
  if (overlay) overlay.classList.remove("hidden");
}


// Closes delete modal
function closeDeleteModal() {
  pendingDeleteId = null;
  const overlay = document.getElementById("delete-modal-overlay");
  if (overlay) overlay.classList.add("hidden");
}


// Delete event from backend
async function handleDelete(id) {
  try {
    const response = await fetch(`/delete-event/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errData = await safeJson(response);
      const msg = (errData && errData.message) || "Failed to delete event.";
      alert(msg);
      return;
    }

    const data = await response.json();
    alert(data.message || "Event deleted.");
    await loadEvents();

  } catch (error) {
    console.error(error);
    alert("Something went wrong while deleting the event.");
  }
}


// Safe JSON parsing helper
async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
