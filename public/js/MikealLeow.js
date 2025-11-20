// Keep track of which event is selected for deletion
let selectedDeleteId = null;

// Load events and set up modal buttons when the page starts
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();

  const confirmBtn = document.getElementById("confirm-delete-btn");
  const cancelBtn = document.getElementById("cancel-delete-btn");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!selectedDeleteId) return;

      await deleteEvent(selectedDeleteId);
      closeDeleteModal();
      selectedDeleteId = null;

      // Refresh events after deletion
      loadEvents();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      closeDeleteModal();
      selectedDeleteId = null;
    });
  }
});

/**
 * Fetch events from backend
 */
async function loadEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = "Loading events...";

  try {
    const response = await fetch("/view-events");
    const events = await response.json();
    renderEvents(events);
  } catch (error) {
    console.error("Error loading events:", error);
    container.innerHTML = "<p>Unable to load events right now.</p>";
  }
}

/**
 * Render event cards
 */
function renderEvents(events) {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  if (!events || events.length === 0) {
    container.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <div class="event-card__image"></div>

      <div class="event-card__body">
        <h2 class="event-title">${event.name}</h2>

        <div class="event-meta-label">Description</div>
        <p class="event-meta-value">${event.description}</p>

        <div class="event-meta-label">Date</div>
        <p class="event-meta-value">${event.date}</p>

        <div class="event-meta-label">Time</div>
        <p class="event-meta-value">${event.time}</p>

        <div class="event-meta-label">Location</div>
        <p class="event-meta-value">${event.location}</p>
      </div>

      <div class="event-card__actions">
        <button class="btn">Edit</button>
        <button 
          class="btn btn-danger delete-btn" 
          data-id="${event.id}">
          Delete
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach click handlers for delete buttons (event delegation is also possible,
  // but per-card binding is fine at this scale)
  const deleteButtons = container.querySelectorAll(".delete-btn");
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDeleteId = btn.dataset.id;
      openDeleteModal();
    });
  });
}

/**
 * Call backend to delete an event
 */
async function deleteEvent(id) {
  try {
    const response = await fetch(`/delete-event/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();
    alert(data.message);
  } catch (error) {
    console.error("Delete error:", error);
    alert("Something went wrong while deleting the event.");
  }
}

/**
 * Modal helpers
 */
function openDeleteModal() {
  const overlay = document.getElementById("delete-modal-overlay");
  if (overlay) {
    overlay.classList.remove("hidden");
  }
}

function closeDeleteModal() {
  const overlay = document.getElementById("delete-modal-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}
