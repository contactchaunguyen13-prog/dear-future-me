/* ==========================================
   DEAR FUTURE ME
   SCRIPT

   1. DOM Elements
   2. Global State
   3. Time Helpers
   4. File System
   5. Future Delivery
   6. Image System
   7. Budget System
   8. Shopping List
   9. Drag and Drop
   10. Event Listeners
   11. App Startup
========================================== */


/* ========== 1. DOM ELEMENTS ========== */

const photoSlots = document.querySelectorAll(".photo-slot");

const planningTitle = document.getElementById("planningTitle");
const futureNote = document.getElementById("futureNote");

const saveFileName = document.getElementById("saveFileName");
const leftWindowTitle = document.getElementById("leftWindowTitle");
const liveClock = document.getElementById("liveClock");
const createdTime = document.getElementById("createdTime");
const noteTime = document.getElementById("noteTime");

const currencySelect = document.getElementById("currencySelect");
const budgetInput = document.getElementById("budgetInput");

const totalPlanned = document.getElementById("totalPlanned");
const leftBudget = document.getElementById("leftBudget");
const budgetDisplay = document.getElementById("budgetDisplay");

const itemName = document.getElementById("itemName");
const itemPrice = document.getElementById("itemPrice");
const addItemBtn = document.getElementById("addItemBtn");
const itemList = document.getElementById("itemList");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const reflectionText = document.getElementById("reflectionText");
const saveStatus = document.getElementById("saveStatus");

const brandMenuBtn = document.getElementById("brandMenuBtn");
const brandMenu = document.getElementById("brandMenu");
const fileMenuList = document.getElementById("fileMenuList");
const newFileBtn = document.getElementById("newFileBtn");

const fileOptionsBtn = document.getElementById("fileOptionsBtn");
const fileOptionsMenu = document.getElementById("fileOptionsMenu");
const sendFutureBtn = document.getElementById("sendFutureBtn");

const dateModal = document.getElementById("dateModal");
const futureDateInput = document.getElementById("futureDateInput");
const confirmFutureBtn = document.getElementById("confirmFutureBtn");
const cancelFutureBtn = document.getElementById("cancelFutureBtn");

const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");


/* ========== 2. GLOBAL STATE ========== */

let files = [];
let currentFileId = "";
let fileToDeleteId = "";

let items = [];
let savedImages = ["", "", ""];
let createdAt = "";

let saveTimer;
let hideStatusTimer;


/* ========== 3. TIME HELPERS ========== */

function formatClock(date) {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year} ${formatClock(date)}`;
}

function getLocalDateString() {
    const now = new Date();

    return (
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0")
    );
}

function updateClock() {
    liveClock.textContent = formatClock(new Date());
}

function showSaveStatus(text) {
    saveStatus.textContent = text;
    saveStatus.classList.add("visible");

    clearTimeout(hideStatusTimer);

    let duration = 2500;

    if (text === "saved") {
        duration = 1000;
    }

    if (text.includes("message from your past self")) {
        duration = 6000;
    }

    hideStatusTimer = setTimeout(function () {
        saveStatus.classList.remove("visible");
    }, duration);
}


/* ========== 4. FILE SYSTEM ========== */

function makeSaveFileName(title) {
    const cleaned = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, "")
        .replace(/\s+/g, "_");

    return cleaned ? `${cleaned}.save` : "untitled.save";
}

function createNewFile(title = "") {
    const now = new Date();

    return {
        id: "file_" + Date.now(),
        planningTitle: title,
        futureNote: "",
        budget: "",
        currency: "$",
        items: [],
        images: ["", "", ""],
        createdAt: formatDateTime(now),
        noteEditedAt: formatClock(now),
        deliveryDate: "",
        isFuture: false,
        isNew: false
    };
}

function getCurrentFile() {
    return files.find(function (file) {
        return file.id === currentFileId;
    });
}

function saveAllFiles() {
    localStorage.setItem("futureMeFiles", JSON.stringify(files));
    localStorage.setItem("currentFutureMeFileId", currentFileId);
}

function saveCurrentFile() {
    const file = getCurrentFile();
    if (!file) return;

    file.planningTitle = planningTitle.value;
    file.futureNote = futureNote.value;
    file.budget = budgetInput.value;
    file.currency = currencySelect.value;
    file.items = items;
    file.images = savedImages;
    file.createdAt = createdAt;
}

function clearWorkspace() {
    currentFileId = "";

    planningTitle.value = "";
    futureNote.value = "";
    budgetInput.value = "";
    currencySelect.value = "$";

    items = [];
    savedImages = ["", "", ""];
    createdAt = "";

    createdTime.textContent = "--/--/-- --:--";
    noteTime.textContent = "--:--";

    resetImageSlots();
    renderItems();
    updateSummary();

    saveFileName.textContent = "untitled.save";
    leftWindowTitle.textContent = "untitled.save";
}

function loadCurrentFile() {
    const file = getCurrentFile();
    if (!file) return;

    planningTitle.value = file.planningTitle || "";
    futureNote.value = file.futureNote || "";
    budgetInput.value = file.budget || "";
    currencySelect.value = file.currency || "$";

    items = file.items || [];
    savedImages = file.images || ["", "", ""];
    createdAt = file.createdAt || formatDateTime(new Date());

    createdTime.textContent = createdAt;
    noteTime.textContent = file.noteEditedAt || "--:--";

    resetImageSlots();

    savedImages.forEach(function (imageSrc, index) {
        if (imageSrc && photoSlots[index]) {
            showImage(photoSlots[index], imageSrc);
        }
    });

    updateFileName();
    renderItems();
    updateSummary();
}

function loadFiles() {
    const savedFiles = localStorage.getItem("futureMeFiles");
    const savedCurrentId = localStorage.getItem("currentFutureMeFileId");

    if (savedFiles) {
        files = JSON.parse(savedFiles);
        currentFileId = savedCurrentId || "";

        const currentFile = files.find(function (file) {
            return file.id === currentFileId;
        });

        if (!currentFile || currentFile.isFuture) {
            currentFileId = "";
            localStorage.setItem("currentFutureMeFileId", "");
        }
    } else {
        const oldData = localStorage.getItem("futureMeData");

        if (oldData) {
            const data = JSON.parse(oldData);

            const migratedFile = {
                id: "file_" + Date.now(),
                planningTitle: data.planningTitle || "",
                futureNote: data.futureNote || "",
                budget: data.budget || "",
                currency: data.currency || "$",
                items: data.items || [],
                images: data.images || ["", "", ""],
                createdAt: data.createdAt || formatDateTime(new Date()),
                noteEditedAt: formatClock(new Date()),
                deliveryDate: "",
                isFuture: false,
                isNew: false
            };

            files = [migratedFile];
            currentFileId = migratedFile.id;
        } else {
            const firstFile = createNewFile("");
            files = [firstFile];
            currentFileId = firstFile.id;
        }

        saveAllFiles();
    }

    if (currentFileId) {
        loadCurrentFile();
    } else {
        clearWorkspace();
    }

    renderFileMenu();
}

function renderFileMenu() {
    fileMenuList.innerHTML = "";

    const savedFiles = files.filter(function (file) {
        return !file.isFuture;
    });

    const futureFiles = files.filter(function (file) {
        return file.isFuture;
    });

    if (savedFiles.length > 0) {
        const savedLabel = document.createElement("p");
        savedLabel.className = "menu-label";
        savedLabel.textContent = "saved files";
        fileMenuList.appendChild(savedLabel);

        savedFiles.forEach(function (file) {
            fileMenuList.appendChild(createFileButton(file));
        });
    }

    if (futureFiles.length > 0) {
        const futureLabel = document.createElement("p");
        futureLabel.className = "menu-label";
        futureLabel.textContent = "future files";
        fileMenuList.appendChild(futureLabel);

        futureFiles.forEach(function (file) {
            fileMenuList.appendChild(createFileButton(file));
        });
    }

    if (files.length === 0) {
        fileMenuList.innerHTML = `
            <div class="empty-files">
                no saves yet.
            </div>
        `;
    }
}

function createFileButton(file) {
    const button = document.createElement("button");
    button.className = "menu-file";

    if (file.id === currentFileId) {
        button.classList.add("active");
    }

    let icon = "✉";

    if (file.isFuture) {
        icon = "⧖";
    }

    const fileLabel = file.isNew
        ? "[new] " + makeSaveFileName(file.planningTitle)
        : icon + " " + makeSaveFileName(file.planningTitle);

    const labelSpan = document.createElement("span");
    labelSpan.textContent = fileLabel;

    const deleteSpan = document.createElement("span");
    deleteSpan.className = "delete-file-btn";
    deleteSpan.textContent = "×";

    button.append(labelSpan, deleteSpan);

    button.addEventListener("click", function () {
        if (file.isFuture) {
            showSaveStatus("future you isn't here yet.");
            brandMenu.classList.remove("open");
            return;
        }

        if (file.isNew) {
            file.isNew = false;
        }

        saveCurrentFile();
        currentFileId = file.id;

        loadCurrentFile();
        saveAllFiles();
        renderFileMenu();

        brandMenu.classList.remove("open");
    });

    deleteSpan.addEventListener("click", function (event) {
        event.stopPropagation();

        fileToDeleteId = file.id;
        deleteMessage.textContent = `delete ${makeSaveFileName(file.planningTitle)}?`;
        deleteModal.classList.add("open");
    });

    return button;
}

function saveData() {
    showSaveStatus("saving...");

    saveCurrentFile();
    saveAllFiles();
    renderFileMenu();

    clearTimeout(saveTimer);

    saveTimer = setTimeout(function () {
        showSaveStatus("saved");
    }, 300);
}

function updateFileName() {
    const fileName = makeSaveFileName(planningTitle.value);

    saveFileName.textContent = fileName;
    leftWindowTitle.textContent = fileName;
}

function ensureCurrentFile() {
    if (currentFileId) return;

    const newFile = createNewFile(planningTitle.value);
    files.push(newFile);
    currentFileId = newFile.id;
    createdAt = newFile.createdAt;

    createdTime.textContent = createdAt;

    saveAllFiles();
    renderFileMenu();
}


/* ========== 5. FUTURE DELIVERY ========== */

function checkFutureDeliveries() {
    const today = getLocalDateString();
    let deliveredCount = 0;

    files.forEach(function (file) {
        if (file.isFuture && file.deliveryDate && file.deliveryDate <= today) {
            file.isFuture = false;
            file.isNew = true;
            deliveredCount++;
        }
    });

    if (deliveredCount > 0) {
        saveAllFiles();
        renderFileMenu();

        showSaveStatus(
            deliveredCount === 1
                ? "1 message from your past self."
                : `${deliveredCount} messages from your past self.`
        );

        return true;
    }

    return false;
}


/* ========== 6. IMAGE SYSTEM ========== */

function resetImageSlots() {
    photoSlots.forEach(function (slot) {
        const img = slot.querySelector(".preview-image");
        const plus = slot.querySelector(".plus-sign");
        const text = slot.querySelector(".upload-text");
        const input = slot.querySelector("input");

        if (img) img.remove();
        if (plus) plus.style.display = "";
        if (text) text.style.display = "";
        if (input) input.value = "";
    });
}

function showImage(slot, imageSrc) {
    let img = slot.querySelector(".preview-image");

    if (!img) {
        img = document.createElement("img");
        img.classList.add("preview-image");
        slot.appendChild(img);
    }

    img.src = imageSrc;

    const plus = slot.querySelector(".plus-sign");
    const text = slot.querySelector(".upload-text");

    if (plus) plus.style.display = "none";
    if (text) text.style.display = "none";
}

function compressImage(file, maxWidth, callback) {
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();

        img.onload = function () {
            const canvas = document.createElement("canvas");

            const scale = Math.min(maxWidth / img.width, 1);

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedImage = canvas.toDataURL("image/jpeg", 0.75);

            callback(compressedImage);
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}


/* ========== 7. BUDGET SYSTEM ========== */

function getCurrencySymbol() {
    return currencySelect.value || "$";
}

function formatMoney(amount) {
    return getCurrencySymbol() + Number(amount).toLocaleString();
}

function updateSummary() {
    const budget = Number(budgetInput.value) || 0;

    const planned = items.reduce(function (sum, item) {
        return sum + Number(item.price);
    }, 0);

    const left = budget - planned;

    totalPlanned.textContent = formatMoney(planned);
    leftBudget.textContent = formatMoney(left);
    budgetDisplay.textContent = formatMoney(budget);

    const percentUsed = budget > 0 ? (planned / budget) * 100 : 0;
    const cappedPercent = Math.min(percentUsed, 100);

    progressFill.style.width = cappedPercent + "%";

    progressFill.classList.remove(
        "budget-safe",
        "budget-close",
        "budget-over"
    );

    if (budget === 0 || percentUsed < 80) {
        progressFill.classList.add("budget-safe");
    } else if (percentUsed <= 100) {
        progressFill.classList.add("budget-close");
    } else {
        progressFill.classList.add("budget-over");
    }

    if (budget === 0) {
        progressText.textContent =
            getCurrencySymbol() + "0 / " +
            getCurrencySymbol() + "0 used";
    } else {
        progressText.textContent =
            formatMoney(planned) +
            " / " +
            formatMoney(budget) +
            " used";
    }

    updateReflection(budget, planned);
}

function updateReflection(budget, planned) {
    let message = "";

    if (budget === 0) {
        message = "set a budget goal to start planning.";
    } else if (planned === 0) {
        message = "save file ready. add first item.";
    } else if (planned === budget) {
        message = "iconic. no notes.";
    } else if (planned < budget * 0.8) {
        message = "cute. plenty of breathing room.";
    } else if (planned < budget) {
        message = "getting closer. choose wisely.";
    } else {
        message = "future you is raising an eyebrow.";
    }

    reflectionText.textContent = message;
}


/* ========== 8. SHOPPING LIST ========== */

function renderItems() {
    itemList.innerHTML = "";

    if (items.length === 0) {
        itemList.innerHTML = `
            <div class="empty-state">
                <p>no items yet</p>
                <span>add items below ↓</span>
            </div>
        `;
        return;
    }

    items.forEach(function (item, index) {
        const row = document.createElement("div");

        row.classList.add("priority-item");
        row.draggable = true;
        row.dataset.index = index;

        row.innerHTML = `
            <div class="priority-info">
                <span class="drag-handle">⋮⋮</span>
                <span>${item.name}</span>
            </div>

            <div class="priority-actions">
                <span>${formatMoney(item.price)}</span>
                <button class="delete-btn">×</button>
            </div>
        `;

        row.querySelector(".delete-btn").addEventListener("click", function () {
            items.splice(index, 1);
            renderItems();
            updateSummary();
            saveData();
        });

        row.addEventListener("dragstart", function () {
            row.classList.add("dragging");
        });

        row.addEventListener("dragend", function () {
            row.classList.remove("dragging");
        });

        itemList.appendChild(row);
    });
}

function addItem() {
    ensureCurrentFile();

    const name = itemName.value.trim().toLowerCase();
    const price = Number(itemPrice.value);

    if (!name || price <= 0) return;

    items.push({
        name: name,
        price: price
    });

    itemName.value = "";
    itemPrice.value = "";

    renderItems();
    updateSummary();
    saveData();
}


/* ========== 9. DRAG AND DROP ========== */

itemList.addEventListener("dragover", function (event) {
    event.preventDefault();

    const draggingItem = document.querySelector(".dragging");
    if (!draggingItem) return;

    const afterElement = getDragAfterElement(itemList, event.clientY);

    if (afterElement == null) {
        itemList.appendChild(draggingItem);
    } else {
        itemList.insertBefore(draggingItem, afterElement);
    }
});

itemList.addEventListener("drop", function () {
    const newItems = [];

    document.querySelectorAll(".priority-item").forEach(function (row) {
        const index = Number(row.dataset.index);
        newItems.push(items[index]);
    });

    items = newItems;

    renderItems();
    updateSummary();
    saveData();
});

function getDragAfterElement(container, y) {
    const draggableElements = [
        ...container.querySelectorAll(".priority-item:not(.dragging)")
    ];

    return draggableElements.reduce(function (closest, child) {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return {
                offset: offset,
                element: child
            };
        }

        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


/* ========== 10. EVENT LISTENERS ========== */

photoSlots.forEach(function (slot, index) {
    const input = slot.querySelector("input");

    input.addEventListener("change", function () {
        ensureCurrentFile();

        const file = input.files[0];
        if (!file) return;

        compressImage(file, 900, function (compressedImage) {
            savedImages[index] = compressedImage;
            showImage(slot, compressedImage);
            saveData();
        });
    });
});

addItemBtn.addEventListener("click", addItem);

itemName.addEventListener("keydown", function (event) {
    if (event.key === "Enter") addItem();
});

itemPrice.addEventListener("keydown", function (event) {
    if (event.key === "Enter") addItem();
});

budgetInput.addEventListener("input", function () {
    ensureCurrentFile();
    updateSummary();
    saveData();
});

currencySelect.addEventListener("change", function () {
    ensureCurrentFile();
    renderItems();
    updateSummary();
    saveData();
});

planningTitle.addEventListener("input", function () {
    ensureCurrentFile();
    updateFileName();
    saveData();
});

futureNote.addEventListener("input", function () {
    ensureCurrentFile();

    const file = getCurrentFile();
    const currentTime = formatClock(new Date());

    noteTime.textContent = currentTime;

    if (file) {
        file.noteEditedAt = currentTime;
    }

    saveData();
});

brandMenuBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    brandMenu.classList.toggle("open");
});

fileOptionsBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    fileOptionsMenu.classList.toggle("open");
    brandMenu.classList.remove("open");
});

fileOptionsMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

brandMenu.addEventListener("click", function (event) {
    event.stopPropagation();
});

document.addEventListener("click", function () {
    brandMenu.classList.remove("open");
    fileOptionsMenu.classList.remove("open");
});

newFileBtn.addEventListener("click", function () {
    saveCurrentFile();

    const newFile = createNewFile("");
    files.push(newFile);
    currentFileId = newFile.id;

    loadCurrentFile();
    saveAllFiles();
    renderFileMenu();

    brandMenu.classList.remove("open");
});

sendFutureBtn.addEventListener("click", function () {
    ensureCurrentFile();
    saveCurrentFile();

    dateModal.classList.add("open");
    fileOptionsMenu.classList.remove("open");
});

cancelFutureBtn.addEventListener("click", function () {
    dateModal.classList.remove("open");
    futureDateInput.value = "";
});

confirmFutureBtn.addEventListener("click", function () {
    const date = futureDateInput.value;

    if (!date) return;

    const file = getCurrentFile();
    if (!file) return;

    file.deliveryDate = date;
    file.isFuture = true;
    file.isNew = false;

    currentFileId = "";
    clearWorkspace();
    localStorage.setItem("currentFutureMeFileId", "");

    saveAllFiles();

    futureDateInput.value = "";
    dateModal.classList.remove("open");

    const deliveredNow = checkFutureDeliveries();

    if (!deliveredNow) {
        renderFileMenu();
        showSaveStatus("sent to future me.");
    }
});

cancelDeleteBtn.addEventListener("click", function () {
    deleteModal.classList.remove("open");
    fileToDeleteId = "";
});

confirmDeleteBtn.addEventListener("click", function () {
    if (!fileToDeleteId) return;

    files = files.filter(function (file) {
        return file.id !== fileToDeleteId;
    });

    if (currentFileId === fileToDeleteId) {
        const firstSavedFile = files.find(function (file) {
            return !file.isFuture;
        });

        currentFileId = firstSavedFile
            ? firstSavedFile.id
            : "";

        if (currentFileId) {
            loadCurrentFile();
        } else {
            clearWorkspace();
        }
    }

    fileToDeleteId = "";
    deleteModal.classList.remove("open");

    saveAllFiles();
    renderFileMenu();
});


/* ========== 11. APP STARTUP ========== */

updateClock();
setInterval(updateClock, 1000);

loadFiles();
checkFutureDeliveries();
renderFileMenu();