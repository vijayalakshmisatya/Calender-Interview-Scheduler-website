document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('event-modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const eventForm = document.getElementById('event-form');
    const deleteButton = document.getElementById('delete-event');
    const monthYearDisplay = document.getElementById('month-year');
    let selectedSlot;
    let currentWeekStart = new Date();

    function updateCalendar() {
        const days = document.querySelectorAll('.day-column');
        const timeColumn = document.querySelector('.time-column');
        days.forEach(day => {
            day.innerHTML = '';
            for (let i = 0; i < timeColumn.children.length; i++) {
                const timeSlot = document.createElement('div');
                timeSlot.classList.add('time-slot');
                timeSlot.dataset.time = timeColumn.children[i].textContent;
                timeSlot.dataset.day = day.dataset.day;
                timeSlot.addEventListener('click', () => {
                    selectedSlot = timeSlot;
                    document.getElementById('event-title').value = '';
                    document.getElementById('event-location').value = '';
                    modal.style.display = 'block';
                });
                day.appendChild(timeSlot);
            }
        });

        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const month = weekStart.toLocaleString('default', { month: 'long' });
        const year = weekStart.getFullYear();
        monthYearDisplay.textContent = `${month} ${year}`;

        for (let i = 0; i < days.length; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            document.querySelector(`.day-header[data-day="${i}"]`).textContent = `${date.toLocaleString('default', { weekday: 'long' })} ${date.getDate()}`;
            days[i].dataset.date = date.toISOString().split('T')[0];
        }

        loadEvents();
    }

    function saveEvent(event) {
        const title = document.getElementById('event-title').value;
        const location = document.getElementById('event-location').value;
        const date = selectedSlot.parentElement.dataset.date;
        const time = selectedSlot.dataset.time;

        const eventData = { title, location, date, time };

        selectedSlot.innerHTML = `<div><strong>${title}</strong><br>${location}</div>`;
        selectedSlot.classList.add('selected');

        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => !(event.date === date && event.time === time));
        events.push(eventData);
        localStorage.setItem('events', JSON.stringify(events));

        modal.style.display = 'none';
    }

    function deleteEvent() {
        const date = selectedSlot.parentElement.dataset.date;
        const time = selectedSlot.dataset.time;

        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => !(event.date === date && event.time === time));
        localStorage.setItem('events', JSON.stringify(events));

        selectedSlot.innerHTML = '';
        selectedSlot.classList.remove('selected');

        modal.style.display = 'none';
    }

    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => {
            const slot = document.querySelector(`.day-column[data-date="${event.date}"] .time-slot[data-time="${event.time}"]`);
            if (slot) {
                slot.innerHTML = `<div><strong>${event.title}</strong><br>${event.location}</div>`;
                slot.classList.add('selected');
            }
        });
    }

    function navigateWeek(offset) {
        currentWeekStart.setDate(currentWeekStart.getDate() + offset * 7);
        updateCalendar();
    }

    closeModal.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    eventForm.onsubmit = function(event) {
        event.preventDefault();
        saveEvent();
    };

    deleteButton.onclick = function() {
        deleteEvent();
    };

    document.getElementById('prev-week').addEventListener('click', () => navigateWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => navigateWeek(1));

    updateCalendar();
});

