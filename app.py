from flask import Flask, render_template, request, jsonify
import heapq

app = Flask(__name__)


# ---------------------------------------------------------
# Priority Queue Algorithm
# ---------------------------------------------------------
def priority_scheduler(requests, start_floor=1):
    """
    Higher priority is served first.
    If priority is equal, earlier arrival time is served first.
    """

    queue = []

    for r in requests:
        heapq.heappush(
            queue,
            (-r["priority"], r["arrival_time"], r["id"], r)
        )

    current_floor = start_floor
    current_time = 0
    schedule = []

    while queue:
        _, _, _, r = heapq.heappop(queue)

        # Move from current elevator position to passenger floor
        movement_to_passenger = abs(current_floor - r["current_floor"])
        arrival_at_passenger = current_time + movement_to_passenger

        waiting_time = max(
            0,
            arrival_at_passenger - r["arrival_time"]
        )

        # Move passenger to destination
        passenger_movement = abs(
            r["current_floor"] - r["destination_floor"]
        )

        current_time = arrival_at_passenger + passenger_movement
        current_floor = r["destination_floor"]

        schedule.append({
            "request_id": r["id"],
            "from": r["current_floor"],
            "to": r["destination_floor"],
            "priority": r["priority"],
            "arrival_time": r["arrival_time"],
            "waiting_time": waiting_time,
            "movement": movement_to_passenger + passenger_movement,
            "reason": (
                "Selected because it has the highest priority "
                "among pending requests."
            )
        })

    return calculate_results(schedule)


# ---------------------------------------------------------
# Greedy Algorithm
# ---------------------------------------------------------
def greedy_scheduler(requests, start_floor=1):
    """
    Selects the pending request closest to the elevator's
    current floor.
    """

    pending = requests.copy()
    current_floor = start_floor
    current_time = 0
    schedule = []

    while pending:

        # Select request with minimum distance
        selected = min(
            pending,
            key=lambda r: (
                abs(current_floor - r["current_floor"]),
                r["arrival_time"],
                r["id"]
            )
        )

        pending.remove(selected)

        movement_to_passenger = abs(
            current_floor - selected["current_floor"]
        )

        arrival_at_passenger = current_time + movement_to_passenger

        waiting_time = max(
            0,
            arrival_at_passenger - selected["arrival_time"]
        )

        passenger_movement = abs(
            selected["current_floor"] -
            selected["destination_floor"]
        )

        current_time = arrival_at_passenger + passenger_movement
        current_floor = selected["destination_floor"]

        schedule.append({
            "request_id": selected["id"],
            "from": selected["current_floor"],
            "to": selected["destination_floor"],
            "priority": selected["priority"],
            "arrival_time": selected["arrival_time"],
            "waiting_time": waiting_time,
            "movement": movement_to_passenger + passenger_movement,
            "reason": (
                "Selected because it is the closest pending "
                "request to the elevator."
            )
        })

    return calculate_results(schedule)


# ---------------------------------------------------------
# Performance Calculation
# ---------------------------------------------------------
def calculate_results(schedule):

    total_waiting = sum(
        item["waiting_time"] for item in schedule
    )

    total_movement = sum(
        item["movement"] for item in schedule
    )

    number_of_requests = len(schedule)

    average_waiting = (
        total_waiting / number_of_requests
        if number_of_requests > 0
        else 0
    )

    return {
        "schedule": schedule,
        "total_waiting": total_waiting,
        "average_waiting": round(average_waiting, 2),
        "total_movement": total_movement
    }


# ---------------------------------------------------------
# Web Routes
# ---------------------------------------------------------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/schedule", methods=["POST"])
def schedule():

    data = request.get_json()

    requests = data.get("requests", [])
    start_floor = int(data.get("start_floor", 1))

    # Convert input values to correct types
    for r in requests:
        r["priority"] = int(r["priority"])
        r["arrival_time"] = int(r["arrival_time"])
        r["current_floor"] = int(r["current_floor"])
        r["destination_floor"] = int(r["destination_floor"])

    priority_result = priority_scheduler(
        requests,
        start_floor
    )

    greedy_result = greedy_scheduler(
        requests,
        start_floor
    )

    return jsonify({
        "priority": priority_result,
        "greedy": greedy_result
    })


if __name__ == "__main__":
    app.run(debug=True)