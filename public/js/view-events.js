let eventsData = [];
let pendingDeleteId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadEvents();

  const createBtn = document.getElementById("create-event-btn");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      alert("Create Event feature will be handled by another teammate.");
    });
  }

  setupDeleteModal();
});

/**
 * Fetch events from backend and render them
 */
async function loadEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = "Loading events...";

  try {
    const response = await fetch("/view-events");
    if (!response.ok) {
      throw new Error("Failed to fetch events.");
    }

    const data = await response.json();
    eventsData = Array.isArray(data) ? data : [];

    renderEvents(eventsData);
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="empty-state">Unable to load events at the moment.</p>';
  }
}

/**
 * Render event cards based on data
 */
function renderEvents(events) {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  if (!events || events.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No events found. Please create one!</p>';
    return;
  }

  events.forEach((event) => {
    const card = createEventCard(event);
    container.appendChild(card);
  });
}

/**
 * Create one event card element
 */
function createEventCard(event) {
  const card = document.createElement("article");
  card.className = "event-card";

  // Image / placeholder
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "event-card__image";

  if (event.image) {
    const img = document.createElement("img");
    img.src = event.image;
    img.alt = event.name || "Event image";
    imageWrapper.appendChild(img);
  }

  // Body
  const body = document.createElement("div");
  body.className = "event-card__body";

  const titleEl = document.createElement("h2");
  titleEl.className = "event-title";
  titleEl.textContent = event.name || "Untitled Event";

  // Description
  const descLabel = document.createElement("div");
  descLabel.className = "event-meta-label";
  descLabel.textContent = "Description";

  const descValue = document.createElement("p");
  descValue.className = "event-meta-value";
  descValue.textContent = event.description || "-";

  // Date
  const dateLabel = document.createElement("div");
  dateLabel.className = "event-meta-label";
  dateLabel.textContent = "Date";

  const dateValue = document.createElement("p");
  dateValue.className = "event-meta-value";
  dateValue.textContent = event.date || "-";

  // Time
  const timeLabel = document.createElement("div");
  timeLabel.className = "event-meta-label";
  timeLabel.textContent = "Time";

  const timeValue = document.createElement("p");
  timeValue.className = "event-meta-value";
  timeValue.textContent = event.time || "-";

  // Location
  const locationLabel = document.createElement("div");
  locationLabel.className = "event-meta-label";
  locationLabel.textContent = "Location";

  const locationValue = document.createElement("p");
  locationValue.className = "event-meta-value";
  locationValue.textContent = event.location || "-";

  body.appendChild(titleEl);
  body.appendChild(descLabel);
  body.appendChild(descValue);
  body.appendChild(dateLabel);
  body.appendChild(dateValue);
  body.appendChild(timeLabel);
  body.appendChild(timeValue);
  body.appendChild(locationLabel);
  body.appendChild(locationValue);

  // Actions
  const actions = document.createElement("div");
  actions.className = "event-card__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => {
    alert("Edit Event feature will be implemented by your teammate.");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    openDeleteModal(event.id);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  // Assemble card
  card.appendChild(imageWrapper);
  card.appendChild(body);
  card.appendChild(actions);

  return card;
}

/* Delete Modal Logic */

function setupDeleteModal() {
  const overlay = document.getElementById("delete-modal-overlay");
  const confirmBtn = document.getElementById("confirm-delete-btn");
  const cancelBtn = document.getElementById("cancel-delete-btn");

  if (!overlay || !confirmBtn || !cancelBtn) return;

  cancelBtn.addEventListener("click", () => {
    closeDeleteModal();
  });

  overlay.addEventListener("click", (e) => {
    // close when clicking outside modal box
    if (e.target === overlay) {
      closeDeleteModal();
    }
  });

  confirmBtn.addEventListener("click", async () => {
    if (!pendingDeleteId) return;
    await handleDelete(pendingDeleteId);
    closeDeleteModal();
  });
}

function openDeleteModal(eventId) {
  pendingDeleteId = eventId;
  const overlay = document.getElementById("delete-modal-overlay");
  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const overlay = document.getElementById("delete-modal-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

/**
 * Call backend DELETE /delete-event/:id
 * (You will implement this route on the backend side) < need to rmb!
 */
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

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
