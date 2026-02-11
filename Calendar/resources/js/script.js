let events = [];
let editingEventId = null;

function updateLocationOptions(modalityValue) {
  const inPersonFields = document.getElementById("in_person_fields");
  const remoteFields = document.getElementById("remote_fields");

  const locationInput = document.getElementById("event_location");
  const remoteInput = document.getElementById("event_remote_url");

  inPersonFields.classList.add("d-none");
  remoteFields.classList.add("d-none");

  locationInput.required = false;
  remoteInput.required = false;

  if (modalityValue === "in_person") {
    inPersonFields.classList.remove("d-none");
    locationInput.required = true;
    remoteInput.value = "";
  } else if (modalityValue === "remote") {
    remoteFields.classList.remove("d-none");
    remoteInput.required = true;
    locationInput.value = "";
  }
}

function createEventCard(eventDetails) {
  const categoryColors = {
    academic: "#dbeafe",
    work: "#dcfce7",
    social: "#fce7f3",
    fitness: "#ffedd5",
    other: "#e5e7eb",
  };

  const card = document.createElement("div");
  card.className = "event row border rounded m-1 py-1";
  card.style.backgroundColor = categoryColors[eventDetails.category] || "";
  card.dataset.id = eventDetails.id;
  card.style.cursor = "pointer";

  const info = document.createElement("div");

  const whereLine =
    eventDetails.modality === "in_person"
      ? `Location: ${eventDetails.location}`
      : `Remote: ${eventDetails.remote_url}`;

  info.innerHTML = `
    <strong>${eventDetails.name}</strong><br>
    Time: ${eventDetails.time}<br>
    ${whereLine}<br>
    Attendees: ${eventDetails.attendees}<br>
    Category: ${eventDetails.category}
  `;

  card.appendChild(info);

  // click to edit
  card.addEventListener("click", () => openEditModal(eventDetails.id));

  return card;
}

function addEventToCalendarUI(eventInfo) {
  const weekdayColumn = document.getElementById(eventInfo.weekday);
  if (!weekdayColumn) {
    console.error("Weekday column not found:", eventInfo.weekday);
    return;
  }
  weekdayColumn.appendChild(createEventCard(eventInfo));
}

function saveEvent() {
  const form = document.getElementById("event_form");
  if (!form) {
    console.error("Missing form with id='event_form'");
    return;
  }

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    form.reportValidity();
    return;
  }

  const name = document.getElementById("event_name").value.trim();
  const weekday = document.getElementById("event_weekday").value;
  const time = document.getElementById("event_time").value;
  const modality = document.getElementById("event_modality").value;
  const location = document.getElementById("event_location").value.trim();
  const remote_url = document.getElementById("event_remote_url").value.trim();
  const attendees = document.getElementById("event_attendees").value.trim();
  const category = document.getElementById("event_category").value;

  if (editingEventId) {
    // UPDATE existing
    const eventToUpdate = events.find(e => e.id === editingEventId);
    if (!eventToUpdate) {
      console.error("Could not find event to update:", editingEventId);
      editingEventId = null;
      return;
    }

    eventToUpdate.name = name;
    eventToUpdate.weekday = weekday;
    eventToUpdate.time = time;
    eventToUpdate.modality = modality;
    eventToUpdate.location = modality === "in_person" ? location : null;
    eventToUpdate.remote_url = modality === "remote" ? remote_url : null;
    eventToUpdate.attendees = attendees;
    eventToUpdate.category = category;

    // Update UI card in place (note: if weekday changes, card won't move days in this simple version)
    const existingCard = document.querySelector(`[data-id="${editingEventId}"]`);
    if (existingCard) {
      const updatedCard = createEventCard(eventToUpdate);
      existingCard.replaceWith(updatedCard);
    }

    editingEventId = null;
  } else {
    // CREATE new
    const newId = crypto.randomUUID();
    const eventDetails = {
      id: newId,
      name,
      weekday,
      time,
      modality,
      location: modality === "in_person" ? location : null,
      remote_url: modality === "remote" ? remote_url : null,
      attendees,
      category,
    };

    events.push(eventDetails);
    addEventToCalendarUI(eventDetails);
  }

  console.log("events:", events);

  // reset + hide fields
  form.reset();
  document.getElementById("in_person_fields").classList.add("d-none");
  document.getElementById("remote_fields").classList.add("d-none");
  form.classList.remove("was-validated");

  // close modal
  document.activeElement?.blur();
  const modalEl = document.getElementById("eventModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();
}

function openEditModal(id) {
  const eventToEdit = events.find(e => e.id === id);
  if (!eventToEdit) return;

  editingEventId = id;

  document.getElementById("event_name").value = eventToEdit.name;
  document.getElementById("event_weekday").value = eventToEdit.weekday;
  document.getElementById("event_time").value = eventToEdit.time;
  document.getElementById("event_modality").value = eventToEdit.modality;
  document.getElementById("event_attendees").value = eventToEdit.attendees;
  document.getElementById("event_category").value = eventToEdit.category;

  updateLocationOptions(eventToEdit.modality);

  if (eventToEdit.modality === "in_person") {
    document.getElementById("event_location").value = eventToEdit.location || "";
    document.getElementById("event_remote_url").value = "";
  } else {
    document.getElementById("event_remote_url").value = eventToEdit.remote_url || "";
    document.getElementById("event_location").value = "";
  }

  const modalEl = document.getElementById("eventModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

