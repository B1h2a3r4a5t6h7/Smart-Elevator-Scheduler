let requests = [];


/* --------------------------------------------------
   Add Request
-------------------------------------------------- */

function addRequest() {

    const id = document.getElementById("requestId").value.trim();
    const currentFloor =
        document.getElementById("currentFloor").value;

    const destinationFloor =
        document.getElementById("destinationFloor").value;

    const arrivalTime =
        document.getElementById("arrivalTime").value;

    const priority =
        document.getElementById("priority").value;


    if (
        id === "" ||
        currentFloor === "" ||
        destinationFloor === "" ||
        arrivalTime === ""
    ) {
        alert("Please fill all request fields.");
        return;
    }


    if (
        Number(currentFloor) < 0 ||
        Number(destinationFloor) < 0
    ) {
        alert("Floor numbers cannot be negative.");
        return;
    }


    if (requests.some(r => r.id === id)) {
        alert("Request ID already exists.");
        return;
    }


    const newRequest = {

        id: id,

        current_floor: Number(currentFloor),

        destination_floor:
            Number(destinationFloor),

        arrival_time:
            Number(arrivalTime),

        priority:
            Number(priority)
    };


    requests.push(newRequest);

    displayRequests();

    clearRequestForm();
}


/* --------------------------------------------------
   Display Requests
-------------------------------------------------- */

function displayRequests() {

    const table =
        document.getElementById("requestTable");

    table.innerHTML = "";
    document.getElementById("requestCount").textContent=requests.length + (requests.length ===1?"Request":"Requests");


    requests.forEach((r, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${r.id}</td>

            <td>${r.current_floor}</td>

            <td>${r.destination_floor}</td>

            <td>${r.arrival_time}</td>

            <td>${r.priority}</td>

            <td>
                <button
                    class="delete-btn"
                    onclick="deleteRequest(${index})">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}


/* --------------------------------------------------
   Delete Request
-------------------------------------------------- */

function deleteRequest(index) {

    requests.splice(index, 1);

    displayRequests();
}


/* --------------------------------------------------
   Clear Request Form
-------------------------------------------------- */

function clearRequestForm() {

    document.getElementById("requestId").value = "";

    document.getElementById("currentFloor").value = "";

    document.getElementById("destinationFloor").value = "";

    document.getElementById("arrivalTime").value = "";

    document.getElementById("priority").value = "2";
}


/* --------------------------------------------------
   Load Example
-------------------------------------------------- */

function loadExample() {

    requests = [

        {
            id: "R1",
            current_floor: 3,
            destination_floor: 8,
            arrival_time: 0,
            priority: 2
        },

        {
            id: "R2",
            current_floor: 7,
            destination_floor: 2,
            arrival_time: 1,
            priority: 1
        },

        {
            id: "R3",
            current_floor: 2,
            destination_floor: 10,
            arrival_time: 2,
            priority: 4
        },

        {
            id: "R4",
            current_floor: 5,
            destination_floor: 1,
            arrival_time: 3,
            priority: 2
        },

        {
            id: "R5",
            current_floor: 9,
            destination_floor: 4,
            arrival_time: 4,
            priority: 3
        }
    ];


    document.getElementById("startFloor").value = 1;

    displayRequests();
}


/* --------------------------------------------------
   Run Scheduler
-------------------------------------------------- */

async function runScheduler() {

    if (requests.length === 0) {

        alert(
            "Please add at least one elevator request."
        );

        return;
    }


    const startFloor =
        Number(
            document.getElementById("startFloor").value
        );


    try {

        const response = await fetch(
            "/schedule",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    start_floor: startFloor,

                    requests: requests
                })
            }
        );


        if (!response.ok) {

            throw new Error(
                "Server returned an error."
            );
        }


        const data = await response.json();


        displayResults(data);

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not connect to the Flask server."
        );
    }
}


/* --------------------------------------------------
   Display Results
-------------------------------------------------- */

function displayResults(data) {

    document
        .getElementById("results")
        .classList.remove("hidden");


    /* Priority Queue */

    document.getElementById(
        "priorityTotal"
    ).textContent =
        data.priority.total_waiting;


    document.getElementById(
        "priorityAverage"
    ).textContent =
        data.priority.average_waiting;


    document.getElementById(
        "priorityMovement"
    ).textContent =
        data.priority.total_movement;


    displaySchedule(
        "prioritySchedule",
        data.priority.schedule
    );


    /* Greedy */

    document.getElementById(
        "greedyTotal"
    ).textContent =
        data.greedy.total_waiting;


    document.getElementById(
        "greedyAverage"
    ).textContent =
        data.greedy.average_waiting;


    document.getElementById(
        "greedyMovement"
    ).textContent =
        data.greedy.total_movement;


    displaySchedule(
        "greedySchedule",
        data.greedy.schedule
    );
}


/* --------------------------------------------------
   Display Schedule
-------------------------------------------------- */

function displaySchedule(elementId, schedule) {

    const container =
        document.getElementById(elementId);

    container.innerHTML = "";


    schedule.forEach((item, index) => {

        const div =
            document.createElement("div");

        div.className =
            "schedule-item";


        div.innerHTML = `

            <strong>
                ${index + 1}. ${item.request_id}
            </strong>

            <br>

            Floor ${item.from}
            →
            Floor ${item.to}

            <small>
                Waiting Time:
                <strong>${item.waiting_time}</strong>
                units
            </small>

            <small>
                Elevator Movement:
                ${item.movement} units
            </small>

            <small>
                💡 ${item.reason}
            </small>
        `;


        container.appendChild(div);
    });
}


/* --------------------------------------------------
   Clear Everything
-------------------------------------------------- */

function clearAll() {

    requests = [];

    displayRequests();


    document
        .getElementById("results")
        .classList.add("hidden");


    clearRequestForm();
}