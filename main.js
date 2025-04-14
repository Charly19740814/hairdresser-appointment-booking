console.log("TextBox");

//BASE URL
const BASE_URL = "https://salonsapi.prooktatas.hu/api";

// fodraszok lekerdezese
async function fetchHairdressers() {
    try {
        const response = await fetch(`${BASE_URL}/hairdressers`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const hairdressers = await response.json();
        const container = document.querySelector("#content");

        hairdressers.forEach(hairdresser => {
            
            const startTime = hairdresser.work_start_time || "N/A";
            const endTime = hairdresser.work_end_time || "N/A";

            new TextBox({
                renderTo: '#content',
                title: hairdresser.name,
                subtitle: `Telefonszám: ${hairdresser.phone_number}`,
                text: `Munkaidő: ${startTime} - ${endTime}`,
                id: hairdresser.id,
                workingHours: {
                    start_time: startTime,
                    end_time: endTime
                } 
            });
        });

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


// Időpontok lekérdezése
async function fetchAppointments() {
    const hairdresserData = JSON.parse(sessionStorage.getItem('selectedHairdresser'));
    
    try {
        // Lekérjük az összes időpontot
        const appointmentsResponse = await fetch(`${BASE_URL}/appointments`);
        let existingAppointments = await appointmentsResponse.json();  

        // Ellenőrizzük, hogy a válasz nem hibaüzenet-e
        if (existingAppointments.message) {
            console.error("Hiba történt:", existingAppointments.message);
            return;  
        }

        if (!Array.isArray(existingAppointments)) {
            console.warn("Az időpontok nem tömbként érkeztek, próbáljuk átalakítani.");
            existingAppointments = [existingAppointments]; 
        }

        // Szűrjük az időpontokat a fodrász alapján
        const filteredAppointments = existingAppointments.filter(app => app.hairdresser_id === hairdresserData.id);

        // Generáljuk az elérhető időpontokat
        const availableSlots = generateTimeSlots(
            hairdresserData.workingHours,
            filteredAppointments
        );

        displayAppointments(availableSlots);

    } catch (error) {
        console.error("Hiba:", error);
    }
}


// Idő generálása munkaidő alapján
function generateTimeSlots(workingHours, existingAppointments) {
    const slots = [];
    const interval = 30; // 30 perces időpontok
    const start = new Date(`1970-01-01T${workingHours.start_time}`);
    const end = new Date(`1970-01-01T${workingHours.end_time}`);

    let current = new Date(start);
    
    while (current < end) {
        const timeString = current.toLocaleTimeString('hu-HU', { 
            hour: '2-digit', 
            minute: '2-digit'
        });

        // Ellenőrizzük, hogy szabad-e az időpont
        const isBooked = existingAppointments.some(app => 
            app.appointment_date.includes(timeString)
        );

        slots.push({
            time: timeString,
            available: !isBooked
        });

        current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
}

// Dátum formázása 
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("hu-HU", { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeString) {
    return timeString.substring(0, 5); // Csak az óra:perc
}

// Időpontok megjelenítése a HTML-ben
function displayAppointments(slots) {
    const container = document.getElementById("appointments-container");
    container.innerHTML = "";

    slots.forEach(slot => {
        const div = document.createElement("div");
        div.className = `time-slot ${slot.available ? 'available' : 'booked'}`;
        div.innerHTML = `
            <span>${slot.time}</span>
            ${slot.available ? 
                `<button class="book-btn">Foglalás</button>` : 
                '<em>Foglalt</em>'}
        `;

        if (slot.available) {
            div.querySelector('.book-btn').addEventListener('click', () => {
                const hairdresserData = JSON.parse(sessionStorage.getItem('selectedHairdresser'));
                window.location.href = `booking.html?time=${slot.time}&id=${hairdresserData.id}`;
            });
        }

        container.appendChild(div);
    });
}


// Foglalási logika
async function handleBooking(time) {
    const hairdresserData = JSON.parse(sessionStorage.getItem('selectedHairdresser'));
    
    try {
        const response = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hairdresser_id: hairdresserData.id,
                appointment_time: time,
                
            })
        });

        if (response.ok) {
            alert("Sikeres foglalás!");
            fetchAppointments(); 
        }
    } catch (error) {
        console.error("Foglalási hiba:", error);
    }
}

// Kiválasztott fodrász mentése sessionStorage-be
function selectHairdresser(hairdresser) {
    sessionStorage.setItem('selectedHairdresser', JSON.stringify(hairdresser));
    window.location.href = "index.html"; 
}

document.addEventListener("DOMContentLoaded", () => {
    // Ha főoldal, akkor lekérjük a fodrászokat
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        fetchHairdressers();
    } 
    
    else {
        fetchAppointments();
    }

    // Kiválasztás funkció: ha a felhasználó egy fodrászt választ
    const hairdresserBtns = document.querySelectorAll(".appointment-btn");
    hairdresserBtns.forEach(button => {
        button.addEventListener("click", () => {
            const hairdresserId = button.dataset.id;
            const selectedHairdresser = data.find(d => d.id === hairdresserId);
            selectHairdresser(selectedHairdresser);
        });
    });
});

// fodrasz nevenek lekerdezese
document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const hairdresserId = urlParams.get("id");
    const hairdresserNameSpan = document.getElementById("hairdresser-name");

    if (!hairdresserId) {
        hairdresserNameSpan.textContent = "Ismeretlen fodrász";
        return;
    }

    try {
        // Lekérjük az összes fodrászt
        const response = await fetch("https://salonsapi.prooktatas.hu/api/hairdressers");
        const allHairdressers = await response.json();

        console.log("API válasz (összes fodrász):", allHairdressers);

        // Keresünk egy fodrászt az ID alapján
        const foundHairdresser = allHairdressers.find(h => h.id == hairdresserId);

        if (foundHairdresser) {
            hairdresserNameSpan.textContent = foundHairdresser.name;
        } else {
            hairdresserNameSpan.textContent = "Nincs információ";
        }
    } catch (error) {
        console.error("Hiba a fodrász betöltésekor:", error);
        hairdresserNameSpan.textContent = "Nem sikerült betölteni";
    }
});




