const API_URL = "https://api.github.com/users/DosX-dev/repos";
const STORAGE_KEY = "dosx_repos";
const LAST_FETCH_KEY = "dosx_last_fetch";
const PER_PAGE = 100;
const CACHE_ACTUAL_TIME = 60 * 60 * 1000;

async function fetchRepositories() {

    let allRepos = [];
    let page = 1;
    let loadingLabel = document.getElementById("loading");
    try {
        while (true) {
            const response = await fetch(`${API_URL}?per_page=${PER_PAGE}&page=${page}`);
            const repos = await response.json();
            if (repos.length === 0) break;
            allRepos = allRepos.concat(repos);
            page += 1;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRepos));
        localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());

        if (loadingLabel) {
            loadingLabel.innerText = "Repositories loaded.";
        }

        return allRepos;
    } catch (error) {
        console.error("Error fetching repositories:", error);
        if (loadingLabel) {
            loadingLabel.innerText = "Error loading repositories.";
        }
        return null;
    }
}

function displayRepositories(repos) {
    const reposContainer = document.getElementById("repositories");
    const nonForkRepos = repos.filter(repo => !repo.fork && repo.topics && repo.topics.length > 0 && repo.description && repo.description.length > 0);
    nonForkRepos.sort((a, b) => b.stargazers_count - a.stargazers_count); // sort by stars
    let reposCounter = 0;
    nonForkRepos.forEach((repo, index) => {
        reposCounter++;
        console.log(`Repo #${reposCounter}: ${repo.name}`);

        const block = document.createElement("div");
        block.className = "block";

        const blockContainer = document.createElement("div");
        blockContainer.className = "block-container";
        blockContainer.onclick = () => handleClick(repo.html_url);

        const title = document.createElement('h2');
        const repoDescLower = repo.description.toLowerCase();
        title.innerHTML = repo.name + getCategoryIcon(repo.topics.includes("game") || repo.name.includes("game"), "game") + getCategoryIcon(repo.topics.includes("malware") || repo.topics.includes("stub") || repoDescLower.includes("malware") || repoDescLower.includes("bypass") || repoDescLower.includes("virus") || repoDescLower.includes("spyware") || repoDescLower.includes("ransomware") || repoDescLower.includes("rootkit") || repoDescLower.includes("keylogger") || repoDescLower.includes("clipper") || repoDescLower.includes("crack") || repoDescLower.includes("backdoor"), "virus") + getCategoryIcon(repo.topics.includes("example") || repo.topics.includes("learning") || repoDescLower.includes("example of") || repoDescLower.includes("learn") || repoDescLower.includes("study") || repoDescLower.includes("tutorial"), "learn") + getCategoryIcon(repo.topics.includes("web") || repoDescLower.includes("web-") || repoDescLower.includes("html") || repoDescLower.includes("css"), "web") + getCategoryIcon(repo.topics.includes("optimizer") || repoDescLower.includes("cleanup") || repoDescLower.includes("clean up") || repoDescLower.includes("optimization") || repoDescLower.includes("optimize "), "leaf") + getCategoryIcon(repo.topics.includes("sorter") || repo.topics.includes("detector") || repo.topics.includes("scanner") || repoDescLower.includes("sort") || repoDescLower.includes(" collection") || repoDescLower.includes("database"), "database") + getCategoryIcon(repo.topics.includes("protection") || repoDescLower.includes("protect") || repoDescLower.includes("obfuscat"), "shield") + getCategoryIcon(repo.topics.includes("library"), "sdk") + getCategoryIcon(reposCounter === 1, "crown");

        const caption = document.createElement("p");
        caption.className = "block-caption";
        caption.innerText = repo.description; // || 'No description available';

        const repoInfo = document.createElement("p");
        repoInfo.className = "repo-info";
        repoInfo.innerHTML = `<img src="res/star.svg" width="15" height="15"> <span class="star-count">${repo.stargazers_count}</span> <img src="res/fork.svg" width="15" height="15"> <span class="fork-count">${repo.forks_count}</span>`;

        blockContainer.appendChild(title);
        blockContainer.appendChild(caption);
        blockContainer.appendChild(repoInfo);
        block.appendChild(blockContainer);
        reposContainer.appendChild(block);

        setTimeout(() => {
            blockContainer.classList.add("visible");
        }, index * 70);

        var loadingLabel = document.getElementById("loading");
        if (loadingLabel) {
            loadingLabel.style.display = "none";
        }
    });
}

function getCategoryIcon(condition, iconName) {
    return condition ? `<img src="res/${iconName}.svg" width="30" height="20">` : "";
}

function handleClick(url) {
    window.open(url, "_blank");
}
async function loadRepositories() {
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    const now = Date.now();
    if (lastFetch && now - parseInt(lastFetch, 10) < CACHE_ACTUAL_TIME) {
        const cachedRepos = localStorage.getItem(STORAGE_KEY);
        if (cachedRepos) {
            displayRepositories(JSON.parse(cachedRepos));
            return;
        }
    }
    const repos = await fetchRepositories();
    if (repos) {
        displayRepositories(repos);
    }
}