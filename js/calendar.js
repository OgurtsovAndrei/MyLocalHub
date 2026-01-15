const Calendar = {
    render: function(container, events, viewDate, selectedDate, onDateClick) {
        const now = viewDate || selectedDate || new Date("2026-01-13"); // Default to current project date
        const month = now.getMonth();
        const year = now.getFullYear();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get dates that have events
        const eventDates = events.map(e => {
            const d = new Date(e.date);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        });

        let html = `
            <div class="calendar-container animate__animated animate__fadeIn">
                <div class="calendar-header">
                    <button onclick="Calendar.changeMonth(-1)" class="btn-cal-nav">
                        <i data-lucide="chevron-left"></i>
                        <span class="button-label">${t('prev')}</span>
                    </button>
                    <h5 class="fw-bold mb-0">${t('month_' + month)} ${year}</h5>
                    <button onclick="Calendar.changeMonth(1)" class="btn-cal-nav">
                        <i data-lucide="chevron-right"></i>
                        <span class="button-label">${t('next')}</span>
                    </button>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-day-label">${t('day_0')}</div>
                    <div class="calendar-day-label">${t('day_1')}</div>
                    <div class="calendar-day-label">${t('day_2')}</div>
                    <div class="calendar-day-label">${t('day_3')}</div>
                    <div class="calendar-day-label">${t('day_4')}</div>
                    <div class="calendar-day-label">${t('day_5')}</div>
                    <div class="calendar-day-label">${t('day_6')}</div>
        `;

        // Empty slots for first week
        for (let i = 0; i < firstDay; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month}-${day}`;
            const dayEvents = events.filter(e => {
                const d = new Date(e.date);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
            });
            const hasEvent = dayEvents.length > 0;
            const isSelected = selectedDate && 
                             selectedDate.getDate() === day && 
                             selectedDate.getMonth() === month && 
                             selectedDate.getFullYear() === year;
            
            html += `
                <div class="calendar-day ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected' : ''}" 
                     onclick="Calendar.handleDateClick(${year}, ${month}, ${day})"
                     onmouseenter="Calendar.showPreview(event, ${day}, ${month}, ${year})"
                     onmouseleave="Calendar.hidePreview()">
                    ${day}
                    ${hasEvent ? '<span class="event-dot"></span>' : ''}
                </div>
            `;
        }

        html += `
                </div>
                ${selectedDate ? `
                    <div class="text-center mt-3">
                        <button class="btn btn-sm btn-link text-accent p-0" onclick="Calendar.clearFilter()">${t('clear_filter')}</button>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
        lucide.createIcons();
        
        // Save callbacks for global access
        this.onDateClick = onDateClick;
        this.currentYear = year;
        this.currentMonth = month;
        this.selectedDate = selectedDate;
        this.allEvents = events; // Store events for preview
    },

    showPreview: function(event, day, month, year) {
        const dayEvents = this.allEvents.filter(e => {
            const d = new Date(e.date);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });

        if (dayEvents.length === 0) return;

        let popup = document.getElementById('calendar-preview-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'calendar-preview-popup';
            popup.className = 'event-preview-popup';
            document.body.appendChild(popup);
        }

        let content = '';
        dayEvents.forEach(e => {
            content += `
                <div class="event-preview-item">
                    <img src="${e.image}" class="event-preview-img">
                    <div class="event-preview-info">
                        <h6>${getLocalized(e, 'title')}</h6>
                        <p>${getLocalized(e, 'location')}</p>
                    </div>
                </div>
            `;
        });

        popup.innerHTML = content;
        
        // Temporarily show to get height
        popup.style.visibility = 'hidden';
        popup.style.display = 'block';
        const popupHeight = popup.offsetHeight;
        popup.style.display = '';
        popup.style.visibility = 'visible';

        const rect = event.currentTarget.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - 100;
        let top = rect.top - popupHeight - 10;

        // Keep popup within window bounds
        if (left < 10) left = 10;
        if (left + 200 > window.innerWidth - 10) left = window.innerWidth - 210;
        if (top < 10) top = rect.bottom + 10; // Show below if no space above

        popup.style.left = `${window.scrollX + left}px`;
        popup.style.top = `${window.scrollY + top}px`;
        popup.classList.add('show');
    },

    hidePreview: function() {
        const popup = document.getElementById('calendar-preview-popup');
        if (popup) {
            popup.classList.remove('show');
        }
    },

    handleDateClick: function(year, month, day) {
        const clickedDate = new Date(year, month, day);
        const isSameDate = this.selectedDate && 
                         this.selectedDate.getDate() === clickedDate.getDate() && 
                         this.selectedDate.getMonth() === clickedDate.getMonth() && 
                         this.selectedDate.getFullYear() === clickedDate.getFullYear();

        if (this.onDateClick) {
            this.onDateClick(isSameDate ? null : clickedDate);
        }
    },

    changeMonth: function(delta) {
        const newDate = new Date(this.currentYear, this.currentMonth + delta, 1);
        this.currentYear = newDate.getFullYear();
        this.currentMonth = newDate.getMonth();
        // Trigger re-render via app state
        window.updateCalendar(newDate);
    },

    clearFilter: function() {
        if (this.onDateClick) {
            this.onDateClick(null);
        }
    }
};

// Global hook for app.js
window.Calendar = Calendar;
