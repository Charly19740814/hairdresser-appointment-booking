const TextBox = (function(){
    
    const template = `
        <div class="text-box">
            <h2></h2>
            <h4></h4>
            <p class="working-hours"></p>
            <button class="appointment-btn">Időpontfoglalás</button>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = template;

    const textBoxElement = div.firstElementChild;

    function getElement(selectorOrElement){
        let element = null;

        if (typeof selectorOrElement == "string" )
            element = document.querySelector(selectorOrElement);
        else if (typeof selectorOrElement == "object" && selectorOrElement instanceof HTMLElement)
            element = selectorOrElement;

        return element;
    }

    return class Textbox {

        parentElement;
        element;

        titleElement;
        subtitleElement;
        textElement;
        buttonElement;

        constructor(options){
            this.parentElement = getElement(options.renderTo);
            this.element = textBoxElement.cloneNode(true);

            this.titleElement = this.element.querySelector("h2");
            this.subtitleElement = this.element.querySelector("h4");
            this.textElement = this.element.querySelector("p");
            this.buttonElement = this.element.querySelector(".appointment-btn");

            this.title = options.title;
            this.subtitle = options.subtitle;
            this.text = options.text;

            this.workingHours = options.workingHours;

            this.buttonElement.addEventListener("click", () => {
                sessionStorage.setItem('selectedHairdresser', JSON.stringify({
                    id: options.id,
                    workingHours: options.workingHours
                }));
                window.location.href = `appointments.html?id=${options.id}`;
            });

            this.parentElement.appendChild(this.element);
        }

        // Új metódus munkaidő megjelenítéséhez
        setWorkingHours(start, end) {
            this.element.querySelector(".working-hours").textContent = 
                `Munkaidő: ${start} - ${end}`;
        }
        
        set title(text){
            this.titleElement.textContent = text;
        }

        get title(){
            return this.titleElement.textContent;
        }

        set subtitle(text){
            this.subtitleElement.textContent = text;
        }

        get subtitle(){
            return this.subtitleElement.textContent;
        }

        set text(text){
            this.textElement.textContent = text;
        }

        get text(){
            return this.textElement.textContent;
        }

    }

})();


// menü kezelése
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    menuToggle.addEventListener("click", function () {
        dropdownMenu.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!menuToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove("active");
        }
    });
});


// Fodraszok listazasa
document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://salonsapi.prooktatas.hu/api/hairdressers';
    const hairdressersList = document.getElementById('hairdressers-list');

    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            
            data.forEach(hairdresser => {
                const card = document.createElement('div');
                card.className = 'hairdresser-card';

                const img = document.createElement('img');
                img.src = hairdresser.photoUrl || 'fodraszat1.jpg'; 
                img.alt = `${hairdresser.name}'s photo`;

                const name = document.createElement('h2');
                name.textContent = hairdresser.name;

                card.appendChild(img);
                card.appendChild(name);
                hairdressersList.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching hairdressers:', error);
            hairdressersList.innerHTML = '<p>Sorry, we could not load the team members at this time.</p>';
        });
});

// csapat tagok fotojanak lekerdezese
document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://salonsapi.prooktatas.hu/api/hairdressers';
    const hairdressersList = document.getElementById('hairdressers-list');

    // Manuálisan hozzárendelt képek a fodrászok nevéhez
    const hairdresserPhotos = {
        "Kiss Anna": "img/girl-6093779_640.jpg",
        "Nagy Lajos": "img/beard-1845166_640.jpg",
        "Szabó Tamás": "img/face-1869641_640.jpg",
        "Molnár Judit": "img/woman-1132617_640.jpg",
        "Tóth Éva": "img/woman-1996283_640.jpg",
        "Farkas Péter": "img/man-1867175_640.jpg",
        "Varga Zsófia": "img/woman-3289372_640.jpg",
        "Horváth Dániel": "img/man-6339003_640.jpg"
    };

    // API hívás
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            hairdressersList.innerHTML = '';
            data.forEach(hairdresser => {
                const card = document.createElement('div');
                card.className = 'hairdresser-card';

                const img = document.createElement('img');
                
                // A fodrász nevének megfelelő kép hozzárendelése
                img.src = hairdresserPhotos[hairdresser.name] || 'img/default.jpg';
                img.alt = `${hairdresser.name}'s photo`;

                const name = document.createElement('h2');
                name.textContent = hairdresser.name;

                card.appendChild(img);
                card.appendChild(name);
                hairdressersList.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching hairdressers:', error);
            hairdressersList.innerHTML = '<p>Sorry, we could not load the team members at this time.</p>';
        });
});

// admin oldal
document.addEventListener('DOMContentLoaded', () => {
    const hairdresserList = document.getElementById('hairdresser-list');
    const adminForm = document.getElementById('admin-form');

    const hairdressers = JSON.parse(localStorage.getItem('hairdressers')) || [];

    // Fodrászok megjelenítése a listán
    function renderHairdressers() {
        hairdresserList.innerHTML = '';
        hairdressers.forEach(hairdresser => {
            const li = document.createElement('li');
            li.textContent = `${hairdresser.name} - ${hairdresser.image}`;
            hairdresserList.appendChild(li);
        });
    }

    // Űrlap beküldése
    adminForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const image = document.getElementById('image').value;

        // Új fodrász hozzáadása
        const newHairdresser = { name, image };
        hairdressers.push(newHairdresser);

        // Mentés a helyi tárolóba
        localStorage.setItem('hairdressers', JSON.stringify(hairdressers));

        // Űrlap ürítése és lista frissítése
        adminForm.reset();
        renderHairdressers();
    });

    // Oldal betöltődésekor megjelenítjük az adatokat
    renderHairdressers();
});



