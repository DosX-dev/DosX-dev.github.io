// Управление предупреждающим попапом
const initWarningPopup = () => {
    const warningPopup = document.getElementById('warning-popup');
    const closeButton = document.getElementById('close-warning');
    const userLang = navigator.language || navigator.userLanguage;

    // Показываем предупреждение только для русскоязычных пользователей и если оно не было закрыто ранее
    const isPopupDismissed = localStorage.getItem('warning-dismissed') === 'true';

    if ((userLang === "ru" || userLang.startsWith("ru-")) && !isPopupDismissed) {
        if (warningPopup) warningPopup.classList.remove('hidden');
    }

    // Обработчик для кнопки закрытия
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            warningPopup.classList.add('hidden');
            localStorage.setItem('warning-dismissed', 'true');
        });
    }
};

// Вызываем функцию при загрузке страницы
initWarningPopup();

console.log("Hello from DosX Portfolio!");

// Theme Management
function loadTheme() {
    // Make sure body doesn't have any theme modes first to avoid conflicts
    document.body.classList.remove('light-mode', 'dark-mode');

    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';

    // Add appropriate class
    document.body.classList.add(savedTheme + '-mode');

    // Add loaded class for smooth page appearance
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Update DOM elements with class-based theme visibility
    const lightOnlyElements = document.querySelectorAll('.light-only');
    const darkOnlyElements = document.querySelectorAll('.dark-only');

    if (savedTheme === 'light') {
        lightOnlyElements.forEach(el => el.style.display = '');
        darkOnlyElements.forEach(el => el.style.display = 'none');
    } else {
        lightOnlyElements.forEach(el => el.style.display = 'none');
        darkOnlyElements.forEach(el => el.style.display = '');
    }

    // Force browser repaint to ensure all theme-specific elements are correctly shown
    document.body.style.display = 'none';
    setTimeout(() => {
        document.body.style.display = '';
    }, 5);
}

function toggleTheme() {
    const isLightMode = document.body.classList.contains('light-mode');

    // Remove current theme
    document.body.classList.remove('light-mode', 'dark-mode');

    // Add new theme
    const newTheme = isLightMode ? 'dark' : 'light';
    document.body.classList.add(newTheme + '-mode');

    // Save the preference
    localStorage.setItem('theme', newTheme);

    // Update DOM elements with class-based theme visibility
    const lightOnlyElements = document.querySelectorAll('.light-only');
    const darkOnlyElements = document.querySelectorAll('.dark-only');

    if (newTheme === 'light') {
        lightOnlyElements.forEach(el => el.style.display = '');
        darkOnlyElements.forEach(el => el.style.display = 'none');
    } else {
        lightOnlyElements.forEach(el => el.style.display = 'none');
        darkOnlyElements.forEach(el => el.style.display = '');
    }
}

// Random Slogan with Typing Effect
function setRandomSlogan() {
    const sloganElement = document.getElementById('random-slogan');
    if (!sloganElement) return;

    const slogans = [
        "Hard work will help pass the time.",
        "I'm #404 and distant like Jupiter.",
        "Syntax errors build character.",
        "Attack, Defend, Anticipate!",
        "There is no spoon.",
        "The cake is a lie.",
    ];

    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];

    // Typing effect
    let index = 0;
    sloganElement.textContent = "";

    function typeCharacter() {
        if (index < randomSlogan.length) {
            sloganElement.textContent += randomSlogan.charAt(index);
            index++;
            setTimeout(typeCharacter, 50);
        }
    }

    typeCharacter();
}

function setEmailAddress() {
    const mailElement = document.getElementById('mail');
    if (!mailElement) return;

    const emailParts = [
        ["collab"].join(''),
        String.fromCharCode(64),
        ['\u006b\u0061\u0079', '-', '\u0073\u006f\u0066\u0074\u0077\u0061\u0072\u0065', '.', '\u0072\u0075'].join('')
    ];

    mailElement.textContent = emailParts.join('');

    mailElement.addEventListener('click', function (e) {
        e.preventDefault();
        const emailAddress = emailParts.join('');

        // Use modern Clipboard API
        navigator.clipboard.writeText(emailAddress).then(() => {
            // Show confirmation that email was copied
            const originalText = mailElement.textContent;
            mailElement.textContent = 'Email copied!';
            mailElement.style.color = '#4CAF50';

            setTimeout(() => {
                mailElement.textContent = originalText;
                mailElement.style.color = '';

                // Open email client after a short delay
                window.location.href = 'mailto:' + emailAddress;
            }, 1500);
        }).catch(error => {
            console.error('Failed to copy email:', error);

            // Fallback to direct mail client open if clipboard fails
            window.location.href = 'mailto:' + emailAddress;
        });
    });

    // Add pointer cursor style to indicate clickability
    mailElement.style.cursor = 'pointer';
}

// Set current year
function setYear() {
    const yearElement = document.getElementById('year');
    if (!yearElement) return;

    yearElement.textContent = new Date().getFullYear();
}

// GitHub API Configuration
const GITHUB_API_URL = "https://api.github.com/users/DosX-dev/repos";
const STORAGE_KEY = "dosx_repos";
const LAST_FETCH_KEY = "dosx_last_fetch";
const PER_PAGE = 100;
const CACHE_VALIDITY_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Fetch repositories from GitHub API
async function fetchRepositories() {
    const loadingElement = document.getElementById("loading");

    try {
        let allRepos = [];
        let page = 1;

        while (true) {
            const response = await fetch(`${GITHUB_API_URL}?per_page=${PER_PAGE}&page=${page}`, {
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "DosX-Portfolio-Website"
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const repos = await response.json();

            if (repos.length === 0) {
                break;
            }

            allRepos = allRepos.concat(repos);
            page++;
        }

        // Save to localStorage cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRepos));
        localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());

        return allRepos;
    } catch (error) {
        console.error("Error fetching repositories:", error);

        if (loadingElement) {
            loadingElement.innerHTML = `
                <p class="error-message">Failed to load repositories. ${error.message}</p>
            `;
        }

        return null;
    }
}

// Check if repository meets display criteria
function shouldDisplayRepository(repo) {
    return !repo.fork && repo.topics?.length > 0 && repo.description?.length > 0;
}

// Generate category icons based on repository
function getCategoryIcon(condition, iconName, titleName) {
    const title = titleName || iconName;
    // Преобразуем названия в понятные категории
    const displayNames = {
        'game': 'Games',
        'virus': 'Malware',
        'learn': 'Learning',
        'web': 'Web',
        'leaf': 'Optimizers',
        'database': 'Data Tools',
        'shield': 'Protections',
        'sdk': 'Libraries'
    };

    const displayTitle = displayNames[iconName] || title;
    return condition ? `<img src="res/${iconName}-new.svg" alt="${displayTitle}" title="${displayTitle}" class="category-icon">` : '';
}

function getCategoryIcons(repo) {
    const repoDescLower = repo.description ? repo.description.toLowerCase() : "";
    const repoNameLower = repo.name.toLowerCase();

    return getCategoryIcon(repo.topics.includes("game") || repoNameLower.includes("game"), "game", "Games") +
        getCategoryIcon(repo.topics.includes("malware") ||
            repo.topics.includes("stub") ||
            repoDescLower.includes("malware") ||
            repoDescLower.includes("bypass") ||
            repoDescLower.includes("virus") ||
            repoDescLower.includes("spyware") ||
            repoDescLower.includes("ransomware") ||
            repoDescLower.includes("rootkit") ||
            repoDescLower.includes("keylogger") ||
            repoDescLower.includes("clipper") ||
            repoDescLower.includes("crack") ||
            repoDescLower.includes("backdoor") ||
            repoDescLower.includes("trojan"), "virus", "Security") +
        getCategoryIcon(repo.topics.includes("example") ||
            repo.topics.includes("learning") ||
            repoDescLower.includes("example of") ||
            repoDescLower.includes("learn") ||
            repoDescLower.includes("study") ||
            repoDescLower.includes("tutorial"), "learn", "Learning") +
        getCategoryIcon(repo.topics.includes("web") ||
            repoDescLower.includes("web-") ||
            repoDescLower.includes("html") ||
            repoDescLower.includes("css"), "web", "Web") +
        getCategoryIcon(repo.topics.includes("optimizer") ||
            repoDescLower.includes("cleanup") ||
            repoDescLower.includes("clean up") ||
            repoDescLower.includes("optimization") ||
            repoDescLower.includes("optimize "), "leaf", "Optimizers") +
        getCategoryIcon(repo.topics.includes("sorter") ||
            repo.topics.includes("detector") ||
            repo.topics.includes("scanner") ||
            repoDescLower.includes("sort") ||
            repoDescLower.includes(" collection") ||
            repoDescLower.includes("database") ||
            repoNameLower.includes("identifier"), "database", "Data Tools") +
        getCategoryIcon(repo.topics.includes("protection") ||
            repoDescLower.includes("protect") ||
            repoDescLower.includes("obfuscat"), "shield", "Protections") +
        getCategoryIcon(repo.topics.includes("library") ||
            repoDescLower.includes("library") ||
            repoDescLower.includes("sdk") ||
            repoNameLower.includes(".js"), "sdk", "Libraries");
}

// Global variable to store repository data
let globalRepositories = [];
let currentFilter = "all";
let currentSort = "stars";
let searchQuery = "";

// Display repositories in the UI
function displayRepositories(repositories) {
    const reposContainer = document.getElementById("repositories");
    const loadingElement = document.getElementById("loading");

    if (!reposContainer) return;

    // Hide loading indicator
    if (loadingElement) {
        loadingElement.style.display = "none";
    }

    // Filter out repositories that don't meet criteria
    globalRepositories = repositories.filter(shouldDisplayRepository);

    if (globalRepositories.length === 0) {
        reposContainer.innerHTML = `<div class="no-repos">No public repositories found.</div>`;
        return;
    }

    // Mark top 3 repositories based on stars
    // This adds a rank property that will be used for displaying badges
    const topRepos = [...globalRepositories].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);
    globalRepositories.forEach(repo => {
        const topIndex = topRepos.findIndex(topRepo => topRepo.id === repo.id);
        if (topIndex !== -1) {
            repo.rank = topIndex + 1; // Rank 1, 2, or 3
        }
    });

    // Apply initial sort (stars high to low by default)
    applyFiltersAndSort();
}

// Filter and sort repositories based on current criteria
function applyFiltersAndSort() {
    const reposContainer = document.getElementById("repositories");
    if (!reposContainer) return;

    // Clear existing content
    reposContainer.innerHTML = "";

    // Apply category filter
    let filteredRepos = [...globalRepositories];

    if (currentFilter !== "all") {
        filteredRepos = filteredRepos.filter(repo => {
            const repoDescLower = repo.description ? repo.description.toLowerCase() : "";
            const repoNameLower = repo.name.toLowerCase();

            switch (currentFilter) {
                case "game":
                    return repo.topics.includes("game") ||
                        repoNameLower.includes("game");
                case "malware":
                    return repo.topics.includes("malware") ||
                        repo.topics.includes("stub") ||
                        repoDescLower.includes("malware") ||
                        repoDescLower.includes("bypass") ||
                        repoDescLower.includes("virus") ||
                        repoDescLower.includes("spyware") ||
                        repoDescLower.includes("ransomware") ||
                        repoDescLower.includes("rootkit") ||
                        repoDescLower.includes("keylogger") ||
                        repoDescLower.includes("clipper") ||
                        repoDescLower.includes("crack") ||
                        repoDescLower.includes("backdoor") ||
                        repoDescLower.includes("trojan");
                case "web":
                    return repo.topics.includes("web") ||
                        repoDescLower.includes("web-") ||
                        repoDescLower.includes("html") ||
                        repoDescLower.includes("css");
                case "learning":
                    return repo.topics.includes("example") ||
                        repo.topics.includes("learning") ||
                        repoDescLower.includes("example of") ||
                        repoDescLower.includes("learn") ||
                        repoDescLower.includes("study") ||
                        repoDescLower.includes("tutorial");
                case "optimizer":
                    return repo.topics.includes("optimizer") ||
                        repoDescLower.includes("cleanup") ||
                        repoDescLower.includes("clean up") ||
                        repoDescLower.includes("optimization") ||
                        repoDescLower.includes("optimize ");
                case "database":
                    return repo.topics.includes("sorter") ||
                        repo.topics.includes("detector") ||
                        repo.topics.includes("scanner") ||
                        repoDescLower.includes("sort") ||
                        repoDescLower.includes(" collection") ||
                        repoDescLower.includes("database") ||
                        repoNameLower.includes("identifier");
                case "protection":
                    return repo.topics.includes("protection") ||
                        repoDescLower.includes("protect") ||
                        repoDescLower.includes("obfuscat");
                case "library":
                    return repo.topics.includes("library") ||
                        repoDescLower.includes("library") ||
                        repoDescLower.includes("sdk") ||
                        repoNameLower.includes(".js");
                default:
                    return true;
            }
        });
    }

    // Apply search filter if there's a query
    if (searchQuery.trim() !== "") {
        const query = searchQuery.trim().toLowerCase();
        filteredRepos = filteredRepos.filter(repo => {
            return repo.name.toLowerCase().includes(query) ||
                repo.description.toLowerCase().includes(query) ||
                (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(query)));
        });
    }

    // Apply sort
    switch (currentSort) {
        case "stars":
            filteredRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case "stars-asc":
            filteredRepos.sort((a, b) => a.stargazers_count - b.stargazers_count);
            break;
        case "forks":
            filteredRepos.sort((a, b) => b.forks_count - a.forks_count);
            break;
        case "forks-asc":
            filteredRepos.sort((a, b) => a.forks_count - b.forks_count);
            break;
        case "name":
            filteredRepos.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            filteredRepos.sort((a, b) => b.name.localeCompare(a.name));
            break;

    }

    // Show "no results" message if needed
    if (filteredRepos.length === 0) {
        reposContainer.innerHTML = `<div class="no-repos">No repositories found matching your criteria.</div>`;
        return;
    }

    // Функция для определения класса описания на основе длины текста
    function getDescriptionClass(description) {
        if (!description) return 'medium-text';

        const length = description.length;
        if (length < 80) {
            return 'short-text';
        } else if (length > 250) {
            return 'long-text';
        } else {
            return 'medium-text';
        }
    }

    // Generate HTML for each repository
    filteredRepos.forEach((repo, index) => {
        const repoElement = document.createElement("div");
        repoElement.className = "project-card";
        repoElement.style.animationDelay = `${index * 50}ms`;
        repoElement.onclick = () => window.open(repo.html_url, "_blank");

        const categoryIcons = getCategoryIcons(repo);
        const isCrownRepo = index === 0 && currentSort === "stars" && currentFilter === "all" && searchQuery === "";
        const crownIcon = isCrownRepo ? `<img src="res/crown-new.svg" alt="Featured" title="Featured Repository">` : '';

        const isPodiumRepo = index < 3 && currentSort === "stars" && currentFilter === "all" && searchQuery === "";

        // Определяем класс для размера текста описания
        const descriptionClass = getDescriptionClass(repo.description);

        repoElement.innerHTML = `
            ${repo.rank ? `<div class="rank-badge rank-${repo.rank}" title="${repo.rank === 1 ? 'Top Repository' : (repo.rank === 2 ? 'Second Best Repository' : 'Third Best Repository')}">${repo.rank}</div>` : ''}
            <div class="project-header">
                <h3 class="project-title">
                    ${repo.name}
                    ${categoryIcons}
                    ${isPodiumRepo ? (index === 0 ? crownIcon : '') : ''}
                </h3>
            </div>
            <div class="project-body">
                <p class="project-description ${descriptionClass}">${repo.description}</p>
                <div class="project-stats">
                    <div class="stat">
                        <img src="res/star-new.svg" alt="Stars">
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="stat">
                        <img src="res/fork-new2.svg" alt="Forks">
                        <span>${repo.forks_count}</span>
                    </div>
                </div>
            </div>
        `;

        reposContainer.appendChild(repoElement);
    });
}

// Load repositories from cache or fetch from API
async function loadRepositories() {
    const loadingElement = document.getElementById("loading");
    const reposContainer = document.getElementById("repositories");

    if (!reposContainer) return;

    // Try to get repos from cache
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    const cachedRepos = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    // If we have valid cache, use it
    if (lastFetch && cachedRepos) {
        const cacheAge = now - parseInt(lastFetch);

        if (cacheAge < CACHE_VALIDITY_DURATION) {
            console.log("Using cached repositories");
            displayRepositories(JSON.parse(cachedRepos));
            return;
        }
    }

    // Otherwise fetch from API
    console.log("Fetching repositories from GitHub");

    // Show loading indicator
    if (loadingElement) {
        loadingElement.style.display = "flex";
    }

    const repos = await fetchRepositories();

    if (repos) {
        displayRepositories(repos);
    }
}

// Setup event listeners for filtering and sorting
function setupEventListeners() {
    // Category filters
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            categoryFilters.forEach(f => f.classList.remove('active'));

            // Add active class to clicked filter
            filter.classList.add('active');

            // Update current filter
            currentFilter = filter.getAttribute('data-category');

            // Apply filters
            applyFiltersAndSort();
        });
    });

    // Sort functionality is now handled by the custom select dropdown
    // through setupCustomSelect() function

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Debounce function to prevent too many filter operations while typing
        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                searchQuery = searchInput.value;
                applyFiltersAndSort();
            }, 300); // 300ms debounce delay
        });
    }
}

// Initialize the page
// Function to handle custom select dropdown
function setupCustomSelect() {
    const customSelect = document.querySelector('.custom-select');
    const selectSelected = document.querySelector('.select-selected');
    const selectItems = document.querySelector('.select-items');
    const selectOptions = document.querySelectorAll('.select-option');

    // Toggle dropdown when clicking on the selected item
    if (selectSelected) {
        selectSelected.addEventListener('click', function (e) {
            e.stopPropagation();
            customSelect.classList.toggle('select-arrow-active');
            selectItems.classList.toggle('select-hide');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        if (customSelect) {
            customSelect.classList.remove('select-arrow-active');
            selectItems.classList.add('select-hide');
        }
    });

    // Handle option selection
    selectOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Update the selected text
            if (selectSelected) {
                selectSelected.textContent = this.textContent;
            }

            // Update active class
            selectOptions.forEach(opt => opt.classList.remove('select-active'));
            this.classList.add('select-active');

            // Set the current sort value and update display
            currentSort = this.getAttribute('data-value');
            applyFiltersAndSort();

            // Close the dropdown
            if (selectItems) {
                selectItems.classList.add('select-hide');
                customSelect.classList.remove('select-arrow-active');
            }
        });
    });
}

// Terminal functionality is now in app.terminal.js

// The globalRepositories variable is declared earlier in the code

document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    setRandomSlogan();
    setEmailAddress();
    setYear();
    loadRepositories();
    setupEventListeners();
    setupCustomSelect();

    // Terminal initialization is now in app.terminal.js
});
