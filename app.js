const api_key = "&api_key=79a57f7023a6d4a70b5f7cb4030e3861";
const apiRootUrl = "https://ws.audioscrobbler.com/2.0?"; // Cambia a HTTPS
const format = "&format=json";

function urlConstructor(method) {
    return `${apiRootUrl}${method}${api_key}${format}`;
}

function createListItem(name, urlLF, listeners, playCount, isArtist) {
    return `
        <li class="list-group-item d-flex justify-content-between align-items-start px-3 shadow-2-strong">
            <div class="ms-2 me-auto">
                <div class="fw-bold mb-3">${name}</div>
                ${isArtist ? playCount : ""}
                <a href="${urlLF}" class="list-group-item list-group-item-action text-primary px-3 border-0">Read more</a>
            </div>
            <span class="badge badge-primary rounded-pill">listeners: ${listeners}</span>
        </li>
    `;
}

function generateList(data, containerId, isArtist = true) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const itemsArray = isArtist ? data.artists.artist : data.tracks.track;

    itemsArray.forEach(item => {
        const name = item.name;
        const urlLF = item.url;
        const listeners = item.listeners || "N/A";
        const playCount = item.playcount || "N/A";
        const element = createListItem(name, urlLF, listeners, playCount, isArtist);
        container.innerHTML += element;
    });
}

const countries = [
    "Argentina", "Australia", "Brazil", "Canada", "France", "Germany", "India", "Italy", "Japan", "Mexico", "Spain", "United Kingdom", "United States"
];

const select = document.getElementById('select');
select.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');

select.addEventListener('change', function (event) {
    getTopsByCountries(event.target.value);
});

function generateResults(data) {
    const container = document.getElementById('results');
    container.innerHTML = '';

    let matchesArray = [];
    if (data.results.artistmatches && data.results.artistmatches.artist) {
        matchesArray = data.results.artistmatches.artist;
    } else if (data.results.trackmatches && data.results.trackmatches.track) {
        matchesArray = data.results.trackmatches.track;
    } else {
        console.error("No se encontraron resultados ni de artistas ni de canciones.");
        return;
    }

    matchesArray.forEach(item => {
        const name = item.name;
        const urlLF = item.url;
        const listeners = item.listeners || "N/A";
        const playCount = item.playcount || "N/A";
        const element = createListItem(name, urlLF, listeners, playCount, true);
        container.innerHTML += element;
    });
}

function fetchData(method, handler) {
    const url = urlConstructor(method);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            handler(data);
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud Fetch:', error);
        });
}

const getTopByCountry = "method=geo.gettoptracks&country=";
const getTopByArtistCountry = "method=geo.gettopartists&country=";
const chartTopTracks = "method=chart.gettoptracks";
const chartTopArtist = "method=chart.gettopartists";
const searchArtist = "method=artist.search&artist=";
const searchTrack = "method=track.search&track=";

function getTopsByCountries(country) {
    fetchData(`${getTopByCountry}${country}`, (data) => generateList(data, 'container', false));
}

function searchByArtist(artist) {
    fetchData(`${searchArtist}${artist}`, generateResults);
}

function searchByTracks(track) {
    fetchData(`${searchTrack}${track}`, generateResults);
}

document.getElementById('form1').addEventListener('input', function (event) {
    const searchQuery = event.target.value;
    if (searchQuery) {
        searchByArtist(searchQuery);
        searchByTracks(searchQuery);
    }
});

fetchData(chartTopArtist, (data) => generateList(data, 'artists'));
fetchData(chartTopTracks, (data) => generateList(data, 'tracks', false));

window.addEventListener('scroll', function () {
    const navbar = document.getElementById("navbar");
    if (window.pageYOffset > 0) {
        navbar.classList.add("navbar-after-scroll");
    } else {
        navbar.classList.remove("navbar-after-scroll");
    }
});

