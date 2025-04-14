
document.addEventListener("DOMContentLoaded", function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentTime = urlParams.get("time");
    const hairdresserId = urlParams.get("id");

    const form = document.getElementById('booking-form');
    const timeField = document.getElementById('appointment-time');

    if (appointmentTime && hairdresserId) {
        timeField.value = appointmentTime;
    } else {
        alert("Hiányzó paraméterek! Kérjük, vissza a főoldalra.");
        window.location.href = "index.html";
    }

    // Űrlap beküldés kezelése
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            hairdresser_id: hairdresserId,
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            service: document.getElementById('service').value,
            appointment_time: timeField.value
        };

        if (!validateForm(formData)) return;

        try {
            // API hívás
            const response = await fetch('https://api.allorigins.win/get?url=https://salonsapi.prooktatas.hu/api/book-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            const responseText = await response.text();  // Válasz szövegként
            //console.log('API válasz szövege:', responseText); 

            let data;
            try {
                data = JSON.parse(responseText); 
            } catch (error) {
                throw new Error('A válasz nem érvényes JSON formátumú.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Ismeretlen hiba');
            }

            // Sikeres foglalás
            showConfirmation(formData);
            setTimeout(() => window.location.href = "index.html", 3000);

        } catch (error) {
            handleError(error);
        }
    });

    // Segédfüggvények
    function validateForm(data) {
        const phoneRegex = /^\+?[0-9]{10,12}$/;
        
        if (!data.name || data.name.length < 3) {
            alert("A név nem lehet üres és minimum 3 karakter!");
            return false;
        }

        if (!phoneRegex.test(data.phone)) {
            alert("Érvénytelen telefonszám formátum!");
            return false;
        }

        if (!data.email.includes('@')) {
            alert("Érvénytelen email cím!");
            return false;
        }

        return true;
    }

    function showConfirmation(data) {
        const message = [
            `Sikeres foglalás!`,
            `Név: ${data.name}`,
            `Időpont: ${data.appointment_time}`,
            `Szolgáltatás: ${data.service}`,
            `3 másodperc múlva visszairányítunk a főoldalra...`
        ].join('\n');
        
        alert(message);
    }

    function handleError(error) {
        console.error('Hiba:', error);
        alert(`Hiba történt: ${error.message}\nKérjük próbálja újra!`);
    }
});

