let DB = []
let pDB = []
let taskDB = []
let pg = document.querySelectorAll(".page")
let sbr = document.querySelectorAll(".sidebar-link")
let otask = document.getElementById("openNewTaskModal")
let ntask = document.getElementById("newTaskModal")
let ctask = document.getElementById("closeTaskModal")
let canctask = document.getElementById("cancelTaskModal")
let frm = document.getElementById("newTaskForm")
let frmTitle = document.getElementById("taskTitle")
let frmDesc = document.getElementById("taskDescription")
let frmProj = document.getElementById("taskProject")
let frmStat = document.getElementById("taskStatus")
let frmPrior = document.getElementById("taskPriority")
let frmDue = document.getElementById("taskDue")
let frmAssign = document.getElementById("taskAssignee")
let frmLab = document.getElementById("taskLabel")
let addTab = document.getElementById("taskTableBody")
let srch = document.getElementById("globalSearch")
let fltr = document.querySelector(".filter-bar")
let fltr2 = fltr.querySelectorAll("button")
let len = fltr2.length
let statuses = document.getElementsByClassName("status-badge")
let bdg = document.querySelector(".badge")
let newtask2 = document.getElementById("openNewTaskModal2")
let d1 = document.querySelector("#totalTasks")
let d2 = document.querySelector("#completedTasks")
let d3 = document.querySelector("#taskProgress")
let n1Project = document.getElementById("openNewProjectModal")
let n2Project = document.getElementById("openNewProjectModal2")
let n3Project = document.getElementById("addProjectCard")
let pModal = document.getElementById("newProjectModal")
let cProject = document.getElementById("closeProjectModal")
let cancProject = document.getElementById("cancelProjectModal")
let btnSubmit = document.getElementById("projectSubmit")
let pName = document.getElementById("projectName")
let pDesc = document.getElementById("projectDescription")
let pClr = document.getElementById("projectColor")
let pDL = document.getElementById("projectDeadline")
let pIcon = document.getElementById("projectIcon")
let pForm = document.getElementById("newProjectForm")
let grid = document.querySelector(".projects-grid")
let act = document.getElementById("actv")
let cmp = document.getElementById("cmpltd")
let allFltr = document.getElementById("alll")
let dashAdd = document.getElementById("dAdd")
let dashAdd2 = document.getElementById("dAdd2")
let ct1 = document.getElementById("c1")
let ct2 = document.getElementById("c2")
let ct3 = document.getElementById("c3")
let tp = document.getElementById("taskProject")
let classCount = document.querySelectorAll(".count")
let sprojects = document.getElementById("sp")
let msg = document.getElementById("noProject")
let b1 = document.getElementById("bc1")
let b2 = document.getElementById("bc2")
let b3 = document.getElementById("bc3")

// FIX (Bug 5 support): map real Status/Priority values to their correct CSS classes.
// Previously every row in getTask() was hardcoded to "status-todo" / "priority-medium"
// regardless of the task's actual data, so styling never matched the text shown.
let statusClassMap = {
    "To Do": "status-todo",
    "In Progress": "status-progress",
    "In Review": "status-review",
    "Done": "status-done"
};
let priorityClassMap = {
    "Low": "priority-low",
    "Medium": "priority-medium",
    "High": "priority-high"
};

sbr.forEach(element => {
    element.addEventListener("click", sbrFun)
});
function sbrFun(e) {
    e.preventDefault();
    sbr.forEach(el1 => {
        el1.classList.remove("active")
    });
    e.target.classList.add("active")
    pg.forEach(el2 => {
        el2.style.display = "none";
    });
    let c = e.currentTarget.dataset.page
    let extract = document.getElementById(`page-${c}`);
    console.log(extract)
    extract.style.display = "";
}
otask.addEventListener("click", openF)
ctask.addEventListener("click", closeF)
canctask.addEventListener("click", closeF)
function openF() {
    if (tp.length != 0) {
        ntask.classList.add("open")
    }
    else {
        alert("No projects have been created. Create a project first!")
    }
}
function closeF() {
    ntask.classList.remove("open")
}
frm.addEventListener("submit", fsubmit)
async function fsubmit(e) {
    let url = "http://127.0.0.1:8000"
    e.preventDefault();
    let obj = {
        Title: frmTitle.value,
        Description: frmDesc.value,
        Project: frmProj.value,
        Status: frmStat.value,
        Priority: frmPrior.value,
        Due_Date: frmDue.value,
        Assignn: frmAssign.value,
        Label: frmLab.value
    };
    let response = await fetch(`${url}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
    });
    let data = await response.json()

    closeF();
    frm.reset();   // FIX (Bug 4): was pForm.reset() — that cleared the PROJECT
    // form instead of the task form that was just submitted,
    // so the task modal kept showing your last entered values.

    await getTask();   // Fetch latest tasks from MySQL and update taskDB
    getData();         // Refresh project cards using updated taskDB

    updateCount();
    updateCountD();
    updateComp();
    updateDashboardProgress();
    dCount();
}
addTab.addEventListener("click", async function (e) {

    let btn = e.target.closest(".delete-btn");

    if (!btn) return;

    let row = btn.closest("tr");

    let id = row.dataset.id;

    let ans = confirm("Are you sure you want to delete this task?");

    if (!ans) return;

    let url = "http://127.0.0.1:8000";

    let response = await fetch(`${url}/delTask/${id}`, {
        method: "DELETE"
    });

    let data = await response.json();

    console.log(data.msg);

    await getTask();
    getData();

    updateCount();
    updateCountD();
    updateComp();
    updateDashboardProgress();
    dCount();
});
addTab.addEventListener("click", editTask);

function editTask(e) {

    console.log("clicked");

    console.log(e.target);

    let btn = e.target.closest(".edit-btn");

    console.log(btn);

    if (!btn) return;

    let row = btn.closest("tr");

    console.log(row);
    // NOTE: left as-is per your request — edit-task functionality was
    // explicitly excluded from the fix scope.
}
srch.addEventListener("input", sch)
function sch(e) {

    let typed = e.target.value.toLowerCase();

    let rows = addTab.querySelectorAll("tr");

    rows.forEach(row => {

        let txt = row.textContent.toLowerCase();

        if (txt.includes(typed)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

}
for (let i = 0; i < len; i++) {
    fltr2[i].addEventListener("click", filtering)
}
function filtering(e) {
    let rows = addTab.querySelectorAll("tr")
    fltr2.forEach(element => {
        element.classList.remove("active")
    });
    e.target.classList.add("active")
    let trgt = e.target.textContent.trim();
    rows.forEach(x => {
        let status = x.querySelector(".status-badge").textContent.trim();
        let status2 = x.querySelector(".task-priority").textContent.trim();
        if (trgt == "All") {
            x.style.display = "";
        }
        else if (trgt == "High Priority") {
            if (status2 == "High") {
                x.style.display = "";
            }
            else {
                x.style.display = "none";
            }
        }
        else if (trgt == status) {
            x.style.display = ""
        }
        else {
            x.style.display = "none"
        }
    });
}
function updateCount() {
    let rows = addTab.querySelectorAll("tr")
    let count = rows.length
    bdg.textContent = count;
}
newtask2.addEventListener("click", openF)
function updateCountD() {
    let rows = addTab.querySelectorAll("tr")
    let count = rows.length
    d1.textContent = count;
}
function updateComp() {
    let count2 = 0
    let rows = addTab.querySelectorAll("tr")
    rows.forEach(element => {
        let y = element.querySelector(".status-badge").textContent.trim()
        if (y == "Done") {
            count2++;
        }
    });
    d2.textContent = count2
}
function updateDashboardProgress() {
    let count3 = 0
    let rows = addTab.querySelectorAll("tr")
    rows.forEach(element => {
        let y = element.querySelector(".status-badge").textContent.trim()
        if (y == "In Progress") {
            count3++;
        }
    });
    d3.textContent = count3
}
addTab.addEventListener("change", statChange)
function statChange(e) {

    if (e.target.type != "checkbox") return;

    let row = e.target.closest("tr");
    let st = row.querySelector(".status-badge");

    let id = Number(row.dataset.id);

    let task = taskDB.find(element => element.id == id);

    if (e.target.checked) {

        e.target.dataset.prev = st.textContent;

        // FIX: also swap the status badge's CSS class to status-done,
        // not just its text, so the pill actually turns green.
        st.className = "status-badge status-done";
        st.textContent = "Done";

        task.Status = "Done";

    } else {

        let prevStatus = e.target.dataset.prev;
        st.className = "status-badge " + (statusClassMap[prevStatus] || "status-todo");
        st.textContent = prevStatus;

        task.Status = prevStatus;

    }

    updateProjectProgress(task.Project);

    updateComp();
    updateDashboardProgress();
    dCount();
}
n2Project.addEventListener("click", openP)
function openP() {
    pModal.classList.add("open")
}
cProject.addEventListener("click", closeProj)
function closeProj() {
    pModal.classList.remove("open")
}
cancProject.addEventListener("click", cancelProj)
function cancelProj() {
    pModal.classList.remove("open")
}
pForm.addEventListener("submit", pSubmit)
async function pSubmit(e) {
    e.preventDefault();
    let url = "http://127.0.0.1:8000";

    let obj2 = {
        project_name: pName.value,
        project_description: pDesc.value,
        project_colour: pClr.value,
        project_deadline: pDL.value,
        project_icon: pIcon.value
    };
    console.log(obj2)
    let response = await fetch(`${url}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj2)

    });
    let data = await response.json();
    console.log(data.msg)

    getData()

    closeProj();
    pForm.reset();
}
n3Project.addEventListener("click", openP)
n1Project.addEventListener("click", openP)
function calProg(name) {
    let total = 0;
    let completed = 0;
    taskDB.forEach(element => {
        if (element.Project == name) {
            total++;
            if (element.Status == "Done") {
                completed++;
            }
        }
    });

    if (total == 0) {
        return 0;
    }

    return (completed / total) * 100;
}
function updateProjectProgress(name) {
    let per = calProg(name)
    let pcard = document.querySelector(`.project-card[data-project_name="${name}"]`)
    console.log(name);
    console.log(pcard);
    if (!pcard) return; // FIX: guard against null so this can't throw and
    // silently break the rest of statChange()
    let ptg = pcard.querySelector(".percentages")
    let ptbar = pcard.querySelector(".progress-bar-fill")
    ptg.textContent = `${Math.round(per)}%`
    ptbar.style.width = `${per}%`
}

act.addEventListener("click", showActive)
function showActive(e) {
    act.classList.add("active")
    cmp.classList.remove("active")
    let pfilter = grid.querySelectorAll(".project-card")
    pfilter.forEach(element => {
        let nm = element.dataset.project_name
        let p3 = calProg(nm)
        if (p3 >= 0 && p3 < 100) {
            element.style.display = ""
        }
        else {
            element.style.display = "none"
        }
    });
}
cmp.addEventListener("click", showCompleted)
function showCompleted(e) {
    cmp.classList.add("active")
    act.classList.remove("active")
    let pfilter = grid.querySelectorAll(".project-card")
    pfilter.forEach(element => {
        let nme = element.dataset.project_name
        let p4 = calProg(nme)
        if (p4 == 100) {
            element.style.display = ""
        }
        else {
            element.style.display = "none"
        }
    });
}
allFltr.addEventListener("click", showAll)
function showAll(e) {
    allFltr.classList.add("active")
    allFltr.classList.remove("active")
    let pfilter = grid.querySelectorAll(".project-card")
    pfilter.forEach(element => {
        element.style.display = ""
    });
}
dashAdd.addEventListener("click", specDo)
dashAdd2.addEventListener("click", specProg)
function specDo() {
    frmStat.value = "To Do"
    ntask.classList.add("open")
}
function specProg() {
    frmStat.value = "In Progress"
    ntask.classList.add("open")
}
function dCount() {
    let dDo = 0
    let dProg = 0
    let dDone = 0
    taskDB.forEach(element => {
        if (element.Status == "To Do") {
            dDo++
        }
        if (element.Status == "In Progress") {
            dProg++
        }
        if (element.Status == "Done") {
            dDone++
        }
    });
    if (taskDB.length == 0) {
        ct1.style.display = "none";
        ct2.style.display = "none";
        ct3.style.display = "none";
    }
    else {
        ct1.style.display = "";
        ct2.style.display = "";
        ct3.style.display = "";

        ct1.textContent = dDo;
        ct2.textContent = dProg;
        ct3.textContent = dDone;
    }
}
function dispDashProj(d) {
    b1.innerHTML = "";
    b2.innerHTML = "";
    b3.innerHTML = "";
    d.forEach(element => {
        // FIX (Bug 2): was element.Project_Name / element.Project_Description,
        // which don't exist on the object returned by the API (the API returns
        // snake_case: project_name, project_description). That made pName
        // undefined for every project and the cards showed "undefined".
        let pName = element.project_name
        let pPerc = calProg(pName)
        let sts = "To Do"
        taskDB.forEach(e => {
            if (e.Project == pName) {
                if (e.Status == "In Progress") {
                    sts = "In Progress"
                }
            }
        });
        if (pPerc == 100) {
            sts = "Done"
        }
        if (sts == "To Do") {
            b1.innerHTML += `
    <div class="task-card">
        <span class="task-card-label label-dev">To Do</span>
        <span class="task-priority priority-high"><i class="fa-solid fa-flag"></i> High</span>
        <h4>${pName}</h4>
        <p>${element.project_description}</p>
    </div>
    `;

        }
        else if (sts == "In Progress") {
            b2.innerHTML += `
            <div class="task-card">
            <span class="task-card-label label-dev">In Progress</span>
            <span class="task-priority priority-high"><i class="fa-solid fa-flag"></i> High</span>
            <h4>${pName}</h4>
            <p>${element.project_description}</p>
            </div>
            `;

        }
        else if (sts == "Done") {
            b3.innerHTML += `
            <div class="task-card">
            <span class="task-card-label label-dev">Done</span>
            <span class="task-priority priority-high"><i class="fa-solid fa-flag"></i> High</span>
            <h4>${pName}</h4>
            <p>${element.project_description}</p>
            </div>
            `;

        }

    });
}
async function getData() {
    let url = "http://127.0.0.1:8000";
    let response = await fetch(`${url}/disp`, {
        method: "GET"
    });
    let data = await response.json()
    let pc = document.querySelectorAll(".project-card")
    pc.forEach(e => {
        if (e.id != "addProjectCard") {
            e.remove()
        }
    });
    let sb = document.querySelectorAll(".sidebar-project")
    sb.forEach(element => {
        element.remove()
    });
    let t = tp.querySelectorAll("option")
    t.forEach(element => {
        element.remove()
    });
    data.forEach(element => {
        let a = document.createElement("a")
        let slct = document.createElement("option")
        let span = document.createElement("span")
        a.classList.add("sidebar-project")
        span.classList.add("project-dot")
        span.style.background = "#6366f1"

        let percentage = calProg(element.project_name)
        let div = document.createElement("div");
        div.dataset.project_name = element.project_name
        div.classList.add("project-card");

        div.innerHTML = `
        <div class="project-card-header">
        <div class="project-icon" style="background:#e0e7ff;color:#4f46e5;">
        <i class="fa-solid fa-globe"></i>
        </div>
        
        <div>
            <h3>${element.project_name}</h3>
            <p>${element.project_description}</p>
                </div>
                </div>
                
                <div class="progress-bar-wrapper">
                <div class="progress-bar-top">
                <span>Progress</span>
            <span class="percentages">${Math.round(percentage)}%</span>
            </div>

            <div class="progress-bar">
            <div class="progress-bar-fill"
            style="width:${percentage}%;background:linear-gradient(90deg,#6366f1,#4f46e5);">
            </div>
            </div>
            </div>
        
        <div class="project-card-footer">
        <div class="team">
        <div class="mini-avatar" style="background:#6366f1;">JD</div>
                <div class="mini-avatar" style="background:#f59e0b;">SK</div>
                <div class="mini-avatar" style="background:#22c55e;">ML</div>
                </div>
                
                <div class="due">
                <i class="fa-regular fa-calendar"></i>
                ${element.project_deadline}
                </div>
                </div>
                `;

        grid.insertBefore(div, n3Project);
        slct.textContent = element.project_name
        tp.append(slct)
        a.append(span)
        a.append(" " + element.project_name);
        if (msg) {
            msg.remove()
        }
        sprojects.append(a)
    });

    // FIX (Bug 1): dispDashProj existed but was never called anywhere,
    // so the Dashboard Kanban board (bc1/bc2/bc3) never got populated.
    dispDashProj(data);
}
async function getTask() {
    let url = "http://127.0.0.1:8000"
    let response = await fetch(`${url}/dispTask`, {
        method: "GET"
    })
    let data = await response.json()
    taskDB = data
    let remRows = addTab.querySelectorAll("tr")
    remRows.forEach(element => {
        element.remove()
    });
    data.forEach(element => {
        let tr = document.createElement("tr");
        tr.dataset.id = element.id;

        // FIX (Bug 5): look up the real class for this task's Status/Priority
        // instead of hardcoding status-todo / priority-medium for every row.
        let statusClass = statusClassMap[element.Status] || "status-todo";
        let priorityClass = priorityClassMap[element.Priority] || "priority-medium";

        tr.innerHTML = `
    <td>
    <div class="task-title-cell">
    <input type="checkbox" ${element.Status === "Done" ? "checked" : ""}>
    <span class="task-name">${element.Title}</span>
    </div>
    </td>
    
    <td>
    <span class="status-badge ${statusClass}">${element.Status}</span>
    </td>
    
    <td>
    <span class="task-priority ${priorityClass}">
    <i class="fa-solid fa-flag"></i>
    ${element.Priority}
        </span>
        </td>
        
        <td>
        <div class="assignee-cell">
        <div class="assignee-avatar" style="background:#6366f1;">JD</div>
        <span>${element.Assignn}</span>
        </div>
        </td>
        
        <td class="due-date">
    ${element.Due_Date}
    </td>

    <td>
        <span style="font-size:.75rem;color:var(--clr-text-muted);">
        ${element.Project}
        </span>
        </td>
        
        <td>
        <div class="actions-cell">
        <button class="edit-btn" data-tooltip="Edit">
        <i class="fa-solid fa-pen"></i>
        </button>
    
        <button class="delete-btn" data-tooltip="Delete">
        <i class="fa-solid fa-trash"></i>
        </button>
        </div>
    </td>
    `;

        addTab.append(tr);
    });

}
(async function () {

    await getTask();
    await getData();   // FIX: await added so dispDashProj (called inside
    // getData) always runs after taskDB is populated by
    // getTask — otherwise calProg()/status lookups inside
    // dispDashProj could run against a stale/empty taskDB
    // on first load.

    updateCount();
    updateCountD();
    updateComp();
    updateDashboardProgress();
    dCount();

})();