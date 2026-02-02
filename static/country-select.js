document.addEventListener('DOMContentLoaded', () => {
    const countryInput = document.getElementById('userCountry');
    const countryList = document.getElementById('country-list');
    const wrapper = document.querySelector('.custom-select-container');

    if (!countryInput || !countryList) return;

    // Expanded list of countries for better "modern" feel
    const countries = [
        "Argentina", "Australia", "Brazil", "Canada", "China", "Egypt",
        "France", "Germany", "Ghana", "India", "Indonesia", "Italy",
        "Japan", "Kenya", "Mexico", "Netherlands", "Nigeria", "Philippines",
        "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea",
        "Spain", "Sweden", "Switzerland", "Turkey", "United Arab Emirates",
        "United Kingdom", "USA", "Vietnam"
    ];

    function showList(filter = "") {
        countryList.innerHTML = '';
        const filtered = countries.filter(c => c.toLowerCase().includes(filter.toLowerCase()));

        if (filtered.length === 0) {
            countryList.classList.add('hidden');
            return;
        }

        filtered.forEach(country => {
            const div = document.createElement('div');
            div.textContent = country;
            div.className = 'country-option';
            div.addEventListener('click', () => {
                countryInput.value = country;
                countryList.classList.add('hidden');
                // Trigger input event to simulate typing for validation if needed
                countryInput.dispatchEvent(new Event('input'));
            });
            countryList.appendChild(div);
        });
        countryList.classList.remove('hidden');
    }

    countryInput.addEventListener('input', (e) => {
        showList(e.target.value);
    });

    countryInput.addEventListener('focus', () => {
        showList(countryInput.value);
    });

    // Toggle list on chevron click
    const chevron = wrapper.querySelector('.country-chevron');
    if (chevron) {
        chevron.addEventListener('click', () => {
            if (countryList.classList.contains('hidden')) {
                showList(countryInput.value);
                countryInput.focus();
            } else {
                countryList.classList.add('hidden');
            }
        });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (wrapper && !wrapper.contains(e.target)) {
            countryList.classList.add('hidden');
        }
    });
});
