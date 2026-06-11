window.onerror = function(msg, url, line, col, error) {
    console.error("JS ERROR:", msg);
    console.error(error);
};

const playlists = {
    topHits: [
        { title: "Dashboard Gold", artist: "The Synthetics", src: "./audio1/Dashboard Gold.mp3" },
        { title: "Ghost in the Light",  artist: "Luna & The Bots", src: "./audio1/Ghost in the Light.mp3" },
        { title: "Glass of Blue Light",  artist: "Glitter Wave", src: "./audio1/Glass of Blue Light.mp3" },
        { title: "Pale Blue Light",  artist: "The Digital Ghost Club", src: "./audio1/Pale Blue Light.mp3" }
    ]
};

const audio = new Audio();

let currentIndex = null;
let currentSongs = [];
let isShuffle = false;
let isLoop = false;
let audioSourceCreated = false;

let audioCtx = null;
let audioSource = null;
let analyser = null;
let animationId = null;

const list = document.getElementById("songList");
const searchInput = document.getElementById("searchInput");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerFavBtn = document.getElementById("playerFavBtn");
const masterPlayBtn = document.getElementById("masterPlayBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const loopBtn = document.getElementById("loopBtn");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const elCurrentTime = document.getElementById("currentTime");
const elTotalTime = document.getElementById("totalTime");

function openPlaylist(index){
    window.location.href = `playlist${index}.html`;
}

function home(){
    window.location.href = "index.html";
}

function searchSong(){
    window.location.href = "search.html";
}

function openFavourites() {
    window.location.href = "favourites.html";
}

const params = new URLSearchParams(window.location.search);
let songs = [];

if (window.location.pathname.includes("favourites.html")) {
    songs = getFavs();
} else {
    const currentPlaylistName = params.get("list") || "topHits";
    // songs = playlists[currentPlaylistName];
    songs = playlists[currentPlaylistName] || [];
}

function renderSongs(songArray){
    list.innerHTML = "";
    currentSongs = songArray;

    songArray.forEach((song, index) => {
        const div = document.createElement("div");
        div.classList.add("song");
        const isSongFav = isFav(song.src);
        const favClass = isSongFav ? "fav-btn fav-active" : "fav-btn";

        div.innerHTML = `
            <div class="song-info">
                <span class="song-title">${song.title}</span>
            </div>
            <div class="song-actions">
                <!-- Przycisk serduszka (wywołuje funkcję toggleFav) -->
                <button class="${favClass}" id="fav-${index}">♥</button>
                <!-- Przycisk play -->
                <button id="btn-${index}" onclick="togglePlay(${index})">▶</button>
            </div>
        `;

        list.appendChild(div);

        const favBtn = div.querySelector(`#fav-${index}`);
        favBtn.addEventListener("click", () => {
            toggleFav(song, favBtn);
        });
    });
}

// audio.addEventListener("ended", () => {
//     if (!isLoop) {
//         playNext(); 
//     }
// });

// function togglePlay(index){
//     const button = document.getElementById("btn-" + index);
//     const song = currentSongs[index];
//     if(!song) return;
//     if(currentIndex === index){
//         if(audio.paused){
//             audio.play();
//             button.textContent = "⏸";
//         } else {
//             audio.pause();
//             button.textContent = "▶";
//         }
//     } else {
//         if(currentIndex !== null){
//             const prevBtn = document.getElementById("btn-" + currentIndex);
//             if(prevBtn) prevBtn.textContent = "▶";
//         }
//         currentIndex = index;
//         updatePlayerInfo(song);
//         audio.src = song.src;
//         audio.play().catch(err => {
//             console.log("PLAY ERROR:", err);
//         });
//         button.textContent = "⏸";
//     }
// }
function togglePlay(index) {
    console.log("togglePlay", index);
    const song = currentSongs[index];
    console.log(song);
    console.log("SRC =", audio.src);
    if (!song) return;
    const button = document.getElementById(`btn-${index}`);
    // Kliknięto aktualnie grający utwór
    if (currentIndex === index) {
        if (audio.paused) {
            audio.play()
                .then(() => {
                    syncUIState();
                })
                .catch(err => console.error("PLAY ERROR:", err));
        } else {
            audio.pause();
            syncUIState();
        }
        return;
    }
    // Reset poprzedniego przycisku
    if (currentIndex !== null) {
        const prevBtn = document.getElementById(`btn-${currentIndex}`);
        if (prevBtn) {
            prevBtn.textContent = "▶";
        }
    }
    currentIndex = index;
    updatePlayerInfo(song);
    // audio.src = song.src;
    audio.pause();
    audio.src = song.src;
    audio.load();
    
    audio.play()
        .then(() => {
            syncUIState();
        })
        .catch(err => {
            console.error("PLAY ERROR:", err);
        });
    if (button) {
        button.textContent = "⏸";
    }
}

function updatePlayerInfo(song) {
    if (!song) return;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist || "Nieznany wykonawca";
    
    if (isFav(song.src)) {
        playerFavBtn.classList.add("fav-active");
    } else {
        playerFavBtn.classList.remove("fav-active");
    }
}

// function toggleMasterPlay() {
//     if (currentIndex === null && currentSongs.length > 0) {
//         togglePlay(0);
//     } else if (currentIndex !== null) {
//         if (audio.paused) {
//             audio.play();
//             button.textContent = "▶";
//         } else {
//             audio.pause();
//             button.textContent = "⏸";
//         }
//     }
// }

audio.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    console.log(audio.src);
});
                
// function toggleMasterPlay() {
//     console.log("MASTER PLAY CLICK");
//     if (!currentSongs || currentSongs.length === 0) return;

//     if (currentIndex === null) {
//         togglePlay(0);
//         return;
//     }
//     if (audio.paused) {
//         audio.play().catch(console.log);
//     } else {
//         audio.pause();
//     }
// }
function toggleMasterPlay() {
    console.log("MASTER CLICK");
    if (!currentSongs || currentSongs.length === 0) {
        console.warn("Brak utworów do odtworzenia");
        return;
    }
    // Nic jeszcze nie grało
    if (currentIndex === null) {
        togglePlay(0);
        return;
    }
    if (audio.paused) {
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        audio.play()
            .then(() => {
                syncUIState();
            })
            .catch(err => {
                console.error("MASTER PLAY ERROR:", err);
            });
    } else {
        audio.pause();
        syncUIState();
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("control-active", isShuffle);
}

audio.onended = () => {
    if(currentIndex !== null){
        const btn = document.getElementById("btn-" + currentIndex);
        if(btn) btn.textContent = "▶";
    }
};

searchInput?.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(value)
    );

    renderSongs(filtered);
});

audio.addEventListener("timeupdate", () => {
    if (!progressFill || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + "%";
    if (elCurrentTime) elCurrentTime.textContent = fmt(audio.currentTime);
});
 
audio.addEventListener("loadedmetadata", () => {
    if (elTotalTime) elTotalTime.textContent = fmt(audio.duration);
});
 
// audio.addEventListener("ended", () => {
//     if (currentIndex !== null) {
//         const btn = document.getElementById("btn-" + currentIndex);
//         if (btn) btn.textContent = "▶";
//     }
//     if (progressFill) progressFill.style.width = "0%";
//     if (elCurrentTime) elCurrentTime.textContent = "0:00";
//     currentIndex = null;
// });
audio.addEventListener("ended", () => {
    if (progressFill) progressFill.style.width = "0%";
    if (elCurrentTime) elCurrentTime.textContent = "0:00";

    if (!isLoop) {
        playNext();
    }
});
 
if (progressBar) {
    audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill)  progressFill.style.width       = pct + "%";
    if (elCurrentTime) elCurrentTime.textContent = fmt(audio.currentTime);
});
}

function getFavs() {
    return JSON.parse(localStorage.getItem("favourites") || "[]");
}
function saveFavs(arr) {
    localStorage.setItem("favourites", JSON.stringify(arr));
}
function isFav(src) {
    return getFavs().some(f => f.src === src);
}
function toggleFav(song, btnEl) {
    let favs = getFavs();
    if (isFav(song.src)) {
        favs = favs.filter(f => f.src !== song.src);
        btnEl.classList.remove("fav-active");
    } else {
        favs.push(song);
        btnEl.classList.add("fav-active");
    }
    saveFavs(favs);
}


function fmt(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function syncUIState() {
    currentSongs.forEach((_, index) => {
        const btn = document.getElementById("btn-" + index);
        if (btn) btn.textContent = "▶";
    });

    if (currentIndex !== null) {
        const listBtn = document.getElementById("btn-" + currentIndex);
        if (audio.paused) {
            if (listBtn) listBtn.textContent = "▶";
            masterPlayBtn.textContent = "▶";
        } else {
            if (listBtn) listBtn.textContent = "⏸";
            masterPlayBtn.textContent = "⏸";
        }
    } else {
        masterPlayBtn.textContent = "▶";
    }
}

audio.addEventListener("play", syncUIState);
audio.addEventListener("pause", syncUIState);
// audio.addEventListener("ended", () => {
//     if (!isLoop) {
//         playNext(); 
//     }
// });

function playNext() {
    if (currentSongs.length === 0) return;
    
    if (isShuffle) {
        let randomIndex = Math.floor(Math.random() * currentSongs.length);
        togglePlay(randomIndex);
    } else {
        let nextIndex = (currentIndex !== null) ? currentIndex + 1 : 0;
        if (nextIndex >= currentSongs.length) nextIndex = 0;
        togglePlay(nextIndex);
    }
}

function playPrev() {
    if (currentSongs.length === 0) return;
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    let prevIndex = (currentIndex !== null) ? currentIndex - 1 : 0;
    if (prevIndex < 0) prevIndex = currentSongs.length - 1;
    togglePlay(prevIndex);
}

function playStaticSong(src, title, artist) {
    const button = document.getElementById("btn-" + index);
    const staticSong = { title: title, artist: artist, src: src };
    
    audio.src = src;
        if(audio.paused){
            audio.play();
            button.textContent = "⏸";
        } else {
            audio.pause();
            button.textContent = "▶";
        }

    currentIndex = null; 
    if (typeof updatePlayerInfo === "function") {
        updatePlayerInfo(staticSong);
    }
}
audio.addEventListener("play", () => {
    const barWave = document.getElementById("barWave");
    if (barWave) {
        barWave.classList.remove("wave-hidden");
        barWave.classList.remove("wave-paused");
    }
});

audio.addEventListener("pause", () => {
    const barWave = document.getElementById("barWave");
    if (barWave) {
        barWave.classList.add("wave-paused");
    }
});

function renderSongs(songArray){
    if (!list) return;
    list.innerHTML = "";
    currentSongs = songArray;

    songArray.forEach((song, index) => {
        const div = document.createElement("div");
        div.classList.add("song");
        const isSongFav = isFav(song.src);
        const favClass = isSongFav ? "fav-btn fav-active" : "fav-btn";

        div.innerHTML = `
            <div class="song-info">
                <span class="song-title">${song.title}</span>
            </div>
            <div class="song-actions">
                <button class="add-to-playlist-btn" id="add-${index}">+</button>
                <button class="${favClass}" id="fav-${index}">♥</button>
                <button id="btn-${index}" onclick="togglePlay(${index})">▶</button>
            </div>
        `;

        list.appendChild(div);

        const favBtn = div.querySelector(`#fav-${index}`);
        favBtn.addEventListener("click", () => {
            toggleFav(song, favBtn);
        });

        const addBtn = div.querySelector(`#add-${index}`);
        addBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            addTrackToCustomPlaylist(song);
        });
    });
}

let isViewingCustomPlaylist = false;

function createCustomPlaylist() {
    let playlists = JSON.parse(localStorage.getItem("customPlaylists") || "{}");

    if (playlists["Własna playlista"]) {
        alert("Playlista 'Własna playlista' już istnieje!");
        return;
    }

    playlists["Własna playlista"] = [];
    localStorage.setItem("customPlaylists", JSON.stringify(playlists));
    renderCustomPlaylistsMenu();
}

function renderCustomPlaylistsMenu() {
    const container = document.getElementById("customPlaylistsContainer");
    if (!container) return;

    const playlists = JSON.parse(localStorage.getItem("customPlaylists") || "{}");
    container.innerHTML = "";

    if (playlists["Własna playlista"]) {
        const div = document.createElement("div");
        div.classList.add("menu-item", "custom-playlist-link");
        div.textContent = "Własna playlista";
        
        div.onclick = () => {
            const savedTracks = playlists["Własna playlista"];
            
            const playlistTitleEl = document.querySelector(".details .title") || document.querySelector("h1");
            if (playlistTitleEl) {
                playlistTitleEl.textContent = "Własna playlista";
            }
            
            if (savedTracks.length === 0) {
                if (list) {
                    list.innerHTML = "<p style='color: #aaa; padding: 20px;'>Twoja playlista jest pusta. Dodaj utwory za pomocą ikony [+] na liście piosenek!</p>";
                }
                currentSongs = [];
                return;
            }
            
            renderSongs(savedTracks);
        };
        
        container.appendChild(div);
    }
}

function addTrackToCustomPlaylist(song) {
    let playlists = JSON.parse(localStorage.getItem("customPlaylists") || "{}");

    if (!playlists["Własna playlista"]) {
        alert("Najpierw stwórz playlistę klikając '+ Stwórz własną playlistę' w menu!");
        return;
    }

    const exists = playlists["Własna playlista"].some(t => t.src === song.src);
    if (exists) {
        alert("Ten utwór jest już w Twojej playliście!");
        return;
    }

    playlists["Własna playlista"].push(song);
    localStorage.setItem("customPlaylists", JSON.stringify(playlists));
}

function removeTrackFromCustomPlaylist(src) {
    let playlists = JSON.parse(localStorage.getItem("customPlaylists") || "{}");
    if (!playlists["Własna playlista"]) return;

    playlists["Własna playlista"] = playlists["Własna playlista"].filter(t => t.src !== src);
    localStorage.setItem("customPlaylists", JSON.stringify(playlists));
    

    viewCustomPlaylistDirectly();
}


searchInput?.addEventListener("input", (e) => {
    isViewingCustomPlaylist = false;
    const value = e.target.value.toLowerCase();
    const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(value)
    );
    renderSongs(filtered);
});

function viewCustomPlaylistDirectly() {
    isViewingCustomPlaylist = true;
    const playlists = JSON.parse(localStorage.getItem("customPlaylists") || "{}");
    const savedTracks = playlists["Własna playlista"] || [];
    
    const mainHeader = document.querySelector(".main h1") || document.querySelector("h1");
    if (mainHeader) {
        mainHeader.textContent = "Własna playlista";
    }
    
    if (savedTracks.length === 0) {
        if (list) {
            list.innerHTML = "<p style='color: #aaa; padding: 20px;'>Twoja playlista jest pusta. Dodaj utwory za pomocą ikony [+] na liście piosenek!</p>";
        }
        currentSongs = [];
        return;
    }
    
    renderSongs(savedTracks);
}

let currentLang = localStorage.getItem("appLanguage") || "pl";

async function translateText(text, targetLang) {
    if (!text.trim()) return text;
    
    try {
        const response = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=pl&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(text));
        const data = await response.json();
        if (data && data[0]) {
            return data[0].map(x => x[0]).join('');
        }
    } catch (error) {
        console.error("Błąd LibreTranslate:", error);
    }
    return text;
}

async function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("appLanguage", lang);
    
    const selectEl = document.getElementById("langSelect");
    if (selectEl) selectEl.value = lang;


    if (lang === "ar") {
        document.body.setAttribute("dir", "rtl");
    } else {
        document.body.removeAttribute("dir");
    }

    const elementsToTranslate = document.querySelectorAll(".translate-me");

    for (let element of elementsToTranslate) {
        if (!element.hasAttribute("data-orig-text")) {
            element.setAttribute("data-orig-text", element.textContent);
        }

        const originalText = element.getAttribute("data-orig-text");
        
        if (lang === "pl") {
            element.innerHTML = originalText;
        } else {
            const translated = await translateText(originalText, lang);
            element.innerHTML = translated;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    changeLanguage(currentLang);
});

// // --- KOŁOWY WIZUALIZATOR I PANEL BOCZNY VIA WEB AUDIO API ---
function toggleSidePanel(show) {
    const panel = document.getElementById("nowPlayingPanel");
    if (!panel) return;
    
    if (show) {
        panel.classList.add("panel-active");
    } else {
        panel.classList.remove("panel-active");
    }
}

// function setupAudioContext() {
//     if (audioCtx) return; 
//         try {
//         audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//         analyser = audioCtx.createAnalyser();
//         analyser.fftSize = 256;
//         audioSource = audioCtx.createMediaElementSource(audio);
//         audioSource.connect(analyser);
//         analyser.connect(audioCtx.destination);

//         console.log("AudioContext initialized");
//         // drawVisualizer();

//     } catch (err) {
//         console.error("AudioContext error:", err)
//     }
//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);
    
//     const canvas = document.getElementById("circularVisualizer");
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");

//     console.log("CANVAS =",document.getElementById("circularVisualizer"));
    
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;
//     const innerRadius = 115;

//     function drawVisualizer() {
//         animationId = requestAnimationFrame(drawVisualizer);
//         analyser.getByteFrequencyData(dataArray);
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         const barsCount = 60; // Ile słupków dookoła płyty
//         for (let i = 0; i < barsCount; i++) {
//             // Przeliczanie indeksów, by pominąć najwyższe, niesłyszalne częstotliwości
//             const dataIndex = Math.floor((i / barsCount) * (dataArray.length * 0.8));
//             const value = dataArray[dataIndex];
//             // Długość słupka zależna od głośności danego pasma
//             const barLength = (value / 255) * 45; 
//             // Matematyczne wyliczenie pozycji na okręgu (trygonometria)
//             const angle = (i * 2 * Math.PI) / barsCount;
//             const xStart = centerX + Math.cos(angle) * innerRadius;
//             const yStart = centerY + Math.sin(angle) * innerRadius;
//             const xEnd = centerX + Math.cos(angle) * (innerRadius + barLength);
//             const yEnd = centerY + Math.sin(angle) * (innerRadius + barLength);
//             // Wygląd neonowej linii
//             ctx.beginPath();
//             ctx.moveTo(xStart, yStart);
//             ctx.lineTo(xEnd, yEnd);
//             ctx.lineWidth = 3;
//             // Płynny gradient od błękitu do fioletu na końcach promieni
//             ctx.strokeStyle = `hsl(${190 + (value / 255) * 60}, 100%, 50%)`;
//             ctx.lineCap = "round";
//             ctx.stroke();
//         }
//     }
//     drawVisualizer();
// }

function setupAudioContext() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        audioSource = audioCtx.createMediaElementSource(audio);
        audioSource.connect(analyser);
        analyser.connect(audioCtx.destination);
        console.log("AudioContext initialized");
        startVisualizer();
    } catch (err) {
        console.error("AudioContext error:", err)
    }
}
// function setupAudioContext() {
//     if (audioCtx) return;
//     audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//     analyser = audioCtx.createAnalyser();
//     analyser.fftSize = 256;
//     // WAŻNE: musi być zawsze 1 raz i natychmiast
//     audioSource = audioCtx.createMediaElementSource(audio);
//     audioSource.connect(analyser);
//     analyser.connect(audioCtx.destination);
//     console.log("AudioContext initialized");
//     startVisualizer();
// }

function startVisualizer() {
    const canvas = document.getElementById("circularVisualizer");
    if (!canvas) {
        console.warn("No canvas found");
        return;
    }
    console.log("CANVAS =",document.getElementById("circularVisualizer"));
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const innerRadius = 115;
    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barsCount = 60;
        for (let i = 0; i < barsCount; i++) {
            const dataIndex = Math.floor((i / barsCount) * dataArray.length * 0.8);
            const value = dataArray[dataIndex];
            const barLength = (value / 255) * 45;
            const angle = (i * 2 * Math.PI) / barsCount;
            const xStart = centerX + Math.cos(angle) * innerRadius;
            const yStart = centerY + Math.sin(angle) * innerRadius;
            const xEnd = centerX + Math.cos(angle) * (innerRadius + barLength);
            const yEnd = centerY + Math.sin(angle) * (innerRadius + barLength);
            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.lineWidth = 3;
            ctx.strokeStyle = `hsl(${190 + (value / 255) * 60}, 100%, 50%)`;
            ctx.stroke();
        }
    }
    draw();
}

audio.addEventListener("play", () => {
    console.log("DISC FOUND", document.getElementById("spinningDisc"));
    setupAudioContext(); //!!!
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    // if (!audioCtx) {setupAudioContext();}
    // if (audioCtx.state === "suspended") {audioCtx.resume();}

    toggleSidePanel(true);
    const disc = document.getElementById("spinningDisc");
    if (disc) disc.style.animationPlayState = "running";

    const pTitle = document.getElementById("panelTitle");
    const pArtist = document.getElementById("panelArtist");
    if (pTitle && playerTitle) pTitle.textContent = playerTitle.textContent;
    if (pArtist && playerArtist) pArtist.textContent = playerArtist.textContent;
    
    // Przetłumacz nowo załadowaną treść panelu bocznego, jeśli używasz modułu tłumaczeń
    if (typeof changeLanguage === "function" && typeof currentLang !== "undefined") {
        // Opcjonalne: wymuszenie aktualizacji języka dla nowych dynamicznych stringów
    }
});

audio.addEventListener("pause", () => {
    const disc = document.getElementById("spinningDisc");
    if (disc) disc.style.animationPlayState = "paused";
});

// audio.addEventListener("ended", () => {
//     const disc = document.getElementById("spinningDisc");
//     if (disc) disc.style.animationPlayState = "paused";
// });

renderCustomPlaylistsMenu();
if (songs.length > 0) {
    renderSongs(songs);
}
// renderSongs(songs);

audio.addEventListener("loadeddata", () => {
    console.log("AUDIO LOADED");
});
audio.addEventListener("canplay", () => {
    console.log("CAN PLAY");
});
audio.addEventListener("playing", () => {
    console.log("PLAYING");
});
