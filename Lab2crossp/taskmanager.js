let boardTasks = [];
let nextIdValue = 1;

let selectedLane = "todo";
let activeEditId = null;

const overallCount = document.getElementById("overallCount");
const priorityView = document.getElementById("priorityView");

const todoCards = document.getElementById("todoCards");
const progressCards = document.getElementById("progressCards");
const doneCards = document.getElementById("doneCards");

const todoCount = document.getElementById("todoCount");
const progressCount = document.getElementById("progressCount");
const doneCount = document.getElementById("doneCount");

const createButtons = document.querySelectorAll(".open-create");
const removeDoneBtn = document.getElementById("removeDoneBtn");

const dialogBackdrop = document.getElementById("dialogBackdrop");
const dialogHeading = document.getElementById("dialogHeading");
const entryTitle = document.getElementById("entryTitle");
const entryDesc = document.getElementById("entryDesc");
const entryPriority = document.getElementById("entryPriority");
const entryDate = document.getElementById("entryDate");
const confirmBtn = document.getElementById("confirmBtn");
const closeBtn = document.getElementById("closeBtn");

function getLaneList(laneName) {
  if (laneName === "todo") return todoCards;
  if (laneName === "inprogress") return progressCards;
  return doneCards;
}

function getTaskStyle(priority) {
  if (priority === "high") return "task--high";
  if (priority === "medium") return "task--medium";
  return "task--low";
}

function getBadgeStyle(priority) {
  if (priority === "high") return "badge--high";
  if (priority === "medium") return "badge--medium";
  return "badge--low";
}

function wipeList(listElement) {
  while (listElement.firstChild) {
    listElement.removeChild(listElement.firstChild);
  }
}

function showEmptyState(listElement) {
  if (!listElement.firstChild) {
    const msg = document.createElement("li");
    msg.classList.add("empty-note");
    msg.textContent = "No tasks in this lane.";
    listElement.appendChild(msg);
  }
}

function refreshCounts() {
  const total = boardTasks.length;
  overallCount.textContent = total === 1 ? "1 task" : total + " tasks";

  const todoTotal = boardTasks.filter(function (task) {
    return task.lane === "todo";
  }).length;

  const progressTotal = boardTasks.filter(function (task) {
    return task.lane === "inprogress";
  }).length;

  const doneTotal = boardTasks.filter(function (task) {
    return task.lane === "done";
  }).length;

  todoCount.textContent = String(todoTotal);
  progressCount.textContent = String(progressTotal);
  doneCount.textContent = String(doneTotal);
}

function createCard(taskData) {
  const item = document.createElement("li");
  item.classList.add("task");
  item.classList.add(getTaskStyle(taskData.priority));
  item.setAttribute("data-id", String(taskData.id));
  item.setAttribute("data-priority", taskData.priority);

  const title = document.createElement("span");
  title.classList.add("task__title");
  title.setAttribute("data-role", "rename");
  title.textContent = taskData.title;

  const text = document.createElement("p");
  text.classList.add("task__text");
  text.textContent = taskData.description ? taskData.description : "No description";

  const meta = document.createElement("div");
  meta.classList.add("task__meta");

  const badge = document.createElement("span");
  badge.classList.add("badge");
  badge.classList.add(getBadgeStyle(taskData.priority));
  badge.textContent = taskData.priority;

  const due = document.createElement("span");
  due.classList.add("due");
  due.textContent = taskData.date ? "Due: " + taskData.date : "Due: none";

  meta.appendChild(badge);
  meta.appendChild(due);

  const actions = document.createElement("div");
  actions.classList.add("task__actions");

  const edit = document.createElement("button");
  edit.classList.add("action-btn");
  edit.classList.add("task-edit");
  edit.setAttribute("data-action", "edit");
  edit.setAttribute("data-id", String(taskData.id));
  edit.textContent = "Edit";

  const remove = document.createElement("button");
  remove.classList.add("action-btn");
  remove.classList.add("task-remove");
  remove.setAttribute("data-action", "delete");
  remove.setAttribute("data-id", String(taskData.id));
  remove.textContent = "Delete";

  actions.appendChild(edit);
  actions.appendChild(remove);

  item.appendChild(title);
  item.appendChild(text);
  item.appendChild(meta);
  item.appendChild(actions);

  return item;
}

function drawBoard() {
  wipeList(todoCards);
  wipeList(progressCards);
  wipeList(doneCards);

  boardTasks.forEach(function (task) {
    const list = getLaneList(task.lane);
    const card = createCard(task);
    list.appendChild(card);
  });

  showEmptyState(todoCards);
  showEmptyState(progressCards);
  showEmptyState(doneCards);

  refreshCounts();
  filterCards();
}

function openDialog() {
  dialogBackdrop.classList.remove("hidden");
}

function closeDialog() {
  dialogBackdrop.classList.add("hidden");
  resetDialog();
}

function resetDialog() {
  activeEditId = null;
  dialogHeading.textContent = "Add Task";
  entryTitle.value = "";
  entryDesc.value = "";
  entryPriority.value = "high";
  entryDate.value = "";
}

function saveEntry() {
  const titleValue = entryTitle.value.trim();
  const descValue = entryDesc.value.trim();
  const priorityValue = entryPriority.value;
  const dateValue = entryDate.value;

  if (titleValue === "") {
    alert("Please enter a task title.");
    entryTitle.focus();
    return;
  }

  if (activeEditId === null) {
    const taskObject = {
      id: nextIdValue,
      title: titleValue,
      description: descValue,
      priority: priorityValue,
      date: dateValue,
      lane: selectedLane
    };

    nextIdValue += 1;
    boardTasks.push(taskObject);
  } else {
    const found = boardTasks.find(function (task) {
      return task.id === activeEditId;
    });

    if (found) {
      found.title = titleValue;
      found.description = descValue;
      found.priority = priorityValue;
      found.date = dateValue;
      found.lane = selectedLane;
    }
  }

  drawBoard();
  closeDialog();
}

function removeTask(taskId) {
  const card = document.querySelector('.task[data-id="' + taskId + '"]');
  if (!card) return;

  card.classList.add("fade-away");

  setTimeout(function () {
    boardTasks = boardTasks.filter(function (task) {
      return task.id !== taskId;
    });

    drawBoard();
  }, 280);
}

function openEdit(taskId) {
  const found = boardTasks.find(function (task) {
    return task.id === taskId;
  });

  if (!found) return;

  activeEditId = taskId;
  selectedLane = found.lane;

  dialogHeading.textContent = "Edit Task";
  entryTitle.value = found.title;
  entryDesc.value = found.description;
  entryPriority.value = found.priority;
  entryDate.value = found.date;

  openDialog();
}

function filterCards() {
  const wanted = priorityView.value;
  const allCards = document.querySelectorAll(".task");

  allCards.forEach(function (card) {
    const level = card.getAttribute("data-priority");
    const hide = wanted !== "all" && level !== wanted;
    card.classList.toggle("is-hidden", hide);
  });
}

function handleListClick(event) {
  const action = event.target.getAttribute("data-action");
  const idText = event.target.getAttribute("data-id");

  if (!action || !idText) return;

  const taskId = parseInt(idText, 10);

  if (action === "edit") {
    openEdit(taskId);
  }

  if (action === "delete") {
    removeTask(taskId);
  }
}

function beginRename(titleNode, taskId) {
  const found = boardTasks.find(function (task) {
    return task.id === taskId;
  });

  if (!found) return;

  const input = document.createElement("input");
  input.type = "text";
  input.value = found.title;
  input.classList.add("rename-input");

  function applyRename() {
    const newValue = input.value.trim();
    if (newValue !== "") {
      found.title = newValue;
    }
    drawBoard();
  }

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      applyRename();
    }
  });

  input.addEventListener("blur", function () {
    applyRename();
  });

  if (titleNode.parentNode) {
    titleNode.parentNode.replaceChild(input, titleNode);
    input.focus();
    input.select();
  }
}

function handleRename(event) {
  const titleNode = event.target.closest('[data-role="rename"]');
  if (!titleNode) return;

  const card = titleNode.closest(".task");
  if (!card) return;

  const taskId = parseInt(card.getAttribute("data-id"), 10);
  beginRename(titleNode, taskId);
}

function clearDoneLane() {
  const doneOnly = boardTasks.filter(function (task) {
    return task.lane === "done";
  });

  if (doneOnly.length === 0) {
    alert("Done column is already empty.");
    return;
  }

  doneOnly.forEach(function (task, index) {
    setTimeout(function () {
      const card = doneCards.querySelector('.task[data-id="' + task.id + '"]');
      if (card) {
        card.classList.add("fade-away");
      }
    }, index * 100);
  });

  setTimeout(function () {
    boardTasks = boardTasks.filter(function (task) {
      return task.lane !== "done";
    });

    drawBoard();
  }, doneOnly.length * 100 + 320);
}

function attachCreateButtons() {
  createButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedLane = button.getAttribute("data-lane");
      activeEditId = null;
      dialogHeading.textContent = "Add Task";
      openDialog();
    });
  });
}

function loadStarterTasks() {
  boardTasks.push({
    id: nextIdValue++,
    title: "Plan lab recording",
    description: "Prepare a short demo showing all required features",
    priority: "high",
    date: "2026-04-18",
    lane: "todo"
  });

  boardTasks.push({
    id: nextIdValue++,
    title: "Code DOM actions",
    description: "Finish event delegation and inline editing",
    priority: "medium",
    date: "2026-04-19",
    lane: "inprogress"
  });

  boardTasks.push({
    id: nextIdValue++,
    title: "Review CSS layout",
    description: "Check responsiveness and card spacing",
    priority: "low",
    date: "2026-04-20",
    lane: "done"
  });
}

function startApp() {
  attachCreateButtons();

  confirmBtn.addEventListener("click", saveEntry);
  closeBtn.addEventListener("click", closeDialog);
  removeDoneBtn.addEventListener("click", clearDoneLane);
  priorityView.addEventListener("change", filterCards);

  todoCards.addEventListener("click", handleListClick);
  progressCards.addEventListener("click", handleListClick);
  doneCards.addEventListener("click", handleListClick);

  todoCards.addEventListener("dblclick", handleRename);
  progressCards.addEventListener("dblclick", handleRename);
  doneCards.addEventListener("dblclick", handleRename);

  dialogBackdrop.addEventListener("click", function (event) {
    if (event.target === dialogBackdrop) {
      closeDialog();
    }
  });

  loadStarterTasks();
  drawBoard();
}

startApp();