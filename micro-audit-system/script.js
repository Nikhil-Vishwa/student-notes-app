let audits = JSON.parse(localStorage.getItem("audits")) || [];

/* Elements */

const auditInput = document.getElementById("auditInput");

const addAuditBtn = document.getElementById("addAuditBtn");

const prioritySelect =
    document.getElementById("prioritySelect");

const dueDateInput =
    document.getElementById("dueDateInput");

const auditList = document.getElementById("auditList");

const totalAudits = document.getElementById("totalAudits");

const passedAudits = document.getElementById("passedAudits");

const failedAudits = document.getElementById("failedAudits");

const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");

let currentFilter = "all";

/* Add Audit */

addAuditBtn.addEventListener("click", addAudit);

searchInput.addEventListener("input", renderAudits);

filterButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

        filterButtons.forEach((b) => b.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        renderAudits();
    });
});

function addAudit(){

    const task = auditInput.value.trim();

    if(task === ""){

        alert("Please enter an audit checkpoint");

        return;
    }

const audit = {

    id:Date.now(),

    task:task,

    status:"pending",

    priority: prioritySelect.value,

    dueDate: dueDateInput.value,

    createdAt:new Date().toLocaleString()
};

    audits.push(audit);

    saveAudits();

    auditInput.value = "";

    renderAudits();
}

/* Due Date Helpers */

function parseLocalDate(dateValue){

    if(!dateValue){

        return null;
    }

    const dateParts = dateValue.split("-");

    return new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
    );
}

function getTodayDate(){

    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}

function getDueDateInfo(audit){

    if(!audit.dueDate){

        return {
            badge: "",
            badgeClass: "",
            message: ""
        };
    }

    const dueDate = parseLocalDate(audit.dueDate);

    const today = getTodayDate();

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const daysDifference = Math.round(
        (dueDate - today) / millisecondsPerDay
    );

    if(daysDifference === 0){

        return {
            badge: "DUE TODAY",
            badgeClass: "today-badge",
            message: "Due today"
        };
    }

    if(audit.status !== "pending"){

        return {
            badge: "",
            badgeClass: "",
            message: ""
        };
    }

    if(daysDifference < 0){

        const overdueDays = Math.abs(daysDifference);

        return {
            badge: "OVERDUE",
            badgeClass: "overdue-badge",
            message:
                overdueDays === 1
                    ? "1 day overdue"
                    : `${overdueDays} days overdue`
        };
    }

    if(daysDifference <= 3){

        return {
            badge: "DUE SOON",
            badgeClass: "soon-badge",
            message:
                daysDifference === 1
                    ? "Due in 1 day"
                    : `Due in ${daysDifference} days`
        };
    }

    return {
        badge: "",
        badgeClass: "",
        message: `Due in ${daysDifference} days`
    };
}

/* Render Audits */

function renderAudits(){

    auditList.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();

const filteredAudits = audits.filter((audit)=>{

    const matchesSearch =
        audit.task.toLowerCase().includes(searchValue);

    const matchesFilter =
        currentFilter === "all" ||
        audit.status === currentFilter;

    return matchesSearch && matchesFilter;
});

filteredAudits.forEach((audit)=>{

        const dueDateInfo = getDueDateInfo(audit);

        const card = document.createElement("div");

        card.className = dueDateInfo.badge === "OVERDUE"
            ? "audit-card overdue-card"
            : "audit-card";

        card.innerHTML = `

        <div class="audit-info">

            <h3>${audit.task}</h3>

            <div class="audit-meta">

            <span class="
            priority-badge
            ${(audit.priority || "Low").toLowerCase()}
            ">
            ${audit.priority || "Low"}
             </span>

             <span class="due-date">

            ${
                audit.dueDate
                ? audit.dueDate
                : "No Due Date"
            }

            </span>

            ${
                dueDateInfo.badge
                ? `<span class="status-badge ${dueDateInfo.badgeClass}">
                    ${dueDateInfo.badge}
                   </span>`
                : ""
            }

            </div>

            ${
                dueDateInfo.message
                ? `<p class="due-message ${dueDateInfo.badgeClass}">
                    ${dueDateInfo.message}
                   </p>`
                : ""
            }

            <p>
            Status:
             ${audit.status.toUpperCase()}
            </p>

             <p>
            ${audit.createdAt}
             </p>

            </div>

            <div class="audit-actions">

                <button 
                    class="pass-btn"
                    onclick="markPass(${audit.id})"
                >
                    Pass
                </button>

                <button 
                    class="fail-btn"
                    onclick="markFail(${audit.id})"
                >
                    Fail
                </button>

                <button 
                    class="delete-btn"
                    onclick="deleteAudit(${audit.id})"
                >
                    Delete
                </button>

            </div>
        `;

        auditList.appendChild(card);
    });

    updateStats();
}

/* Mark Pass */

function markPass(id){

    audits = audits.map((audit)=>{

        if(audit.id === id){

            audit.status = "pass";
        }

        return audit;
    });

    saveAudits();

    renderAudits();
}

/* Mark Fail */

function markFail(id){

    audits = audits.map((audit)=>{

        if(audit.id === id){

            audit.status = "fail";
        }

        return audit;
    });

    saveAudits();

    renderAudits();
}

/* Delete Audit */

function deleteAudit(id){

    audits = audits.filter((audit)=> audit.id !== id);

    saveAudits();

    renderAudits();
}

/* Update Stats */

function updateStats(){

    totalAudits.textContent = audits.length;

    const passed = audits.filter(
        audit => audit.status === "pass"
    ).length;

    const failed = audits.filter(
        audit => audit.status === "fail"
    ).length;

    passedAudits.textContent = passed;

    failedAudits.textContent = failed;
}

/* Save Local Storage */

function saveAudits(){

    localStorage.setItem(
        "audits",
        JSON.stringify(audits)
    );
}

/* Theme Toggle */

themeToggle.addEventListener("click", ()=>{

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){

        localStorage.setItem("theme","dark");

        themeToggle.textContent = "☀️";

    } else {

        localStorage.setItem("theme","light");

        themeToggle.textContent = "🌙";
    }
});

/* Load Theme */

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){

    document.body.classList.add("dark-mode");

    themeToggle.textContent = "☀️";
}

/* Initial Render */

renderAudits();
