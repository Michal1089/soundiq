const playlists = {
    topHits: [
        {title:"1-800-273-8255", src:"audio1/song1.mp3"},
        {title:"Back to You", src:"audio1/Back to You.mp3"},
        {title:"Bodak Yellow", src:"audio1/Bodak Yellow.mp3"},
        {title:"Wild Thoughts", src:"audio1/Wild Thoughts.mp3"}
    ],
    chillSongs: [
        {title:"Chill 1", src:"audio1/song1.mp3"},
        {title:"Chill 2", src:"audio1/song2.mp3"}
    ],
    disneyPiano: [
        {title:"Piano 1", src:"audio1/song1.mp3"},
        {title:"Piano 2", src:"audio1/song2.mp3"}
    ],
    hits: [
        {title:"Hit 1", src:"audio1/song1.mp3"},
        {title:"Hit 2", src:"audio1/song2.mp3"}
    ],
    polskiHipHop: [
        {title:"HH 1", src:"audio1/song1.mp3"},
        {title:"HH 2", src:"audio1/song2.mp3"}
    ],
    rock: [
        {title:"Rock 1", src:"audio1/song1.mp3"},
        {title:"Rock 2", src:"audio1/song2.mp3"}
    ]
};

let audio = new Audio();
let currentIndex = null;

const list = document.getElementById("songList");
const searchInput = document.getElementById("searchInput");

function openPlaylist(index){
    window.location.href = `playlist${index}.html`;
}

function home(){
    window.location.href = "index.html";
}

function searchSong(){
    window.location.href = "search.html";
}

const currentPlaylistName = params.get("list") || "topHits";
const songs = playlists[currentPlaylistName];

function renderSongs(songArray){
    list.innerHTML = "";

    songArray.forEach((song, index) => {
        const div = document.createElement("div");
        div.classList.add("song");

        div.innerHTML = `
            <div class="song-info">
                <span class="song-title">${song.title}</span>
            </div>
            <button id="btn-${index}" onclick="togglePlay(${index})">▶</button>
        `;

        list.appendChild(div);
    });
}

function togglePlay1(index){
    const button = document.getElementById("btn-" + index);

    if(currentIndex === index){
        if(audio.paused){
            audio.play();
            button.textContent = "⏸";
        } else {
            audio.pause();
            button.textContent = "▶";
        }
    } else {
        if(currentIndex !== null){
            document.getElementById("btn-" + currentIndex).textContent = "▶";
        }

        currentIndex = index;
        audio.src = topHits[index].src;
        audio.play();

        button.textContent = "⏸";
    }
}

function togglePlay2(index){
    const button = document.getElementById("btn-" + index);

    if(currentIndex === index){
        if(audio.paused){
            audio.play();
            button.textContent = "⏸";
        } else {
            audio.pause();
            button.textContent = "▶";
        }
    } else {
        if(currentIndex !== null){
            document.getElementById("btn-" + currentIndex).textContent = "▶";
        }

        currentIndex = index;
        audio.src = chillSongs[index].src;
        audio.play();

        button.textContent = "⏸";
    }
}

function togglePlay3(index){
    const button = document.getElementById("btn-" + index);

    if(currentIndex === index){
        if(audio.paused){
            audio.play();
            button.textContent = "⏸";
        } else {
            audio.pause();
            button.textContent = "▶";
        }
    } else {
        if(currentIndex !== null){
            document.getElementById("btn-" + currentIndex).textContent = "▶";
        }

        currentIndex = index;
        audio.src = disneyPiano[index].src;
        audio.play();

        button.textContent = "⏸";
    }
}

function togglePlay4(index){
    const button = document.getElementById("btn-" + index);

    if(currentIndex === index){
        if(audio.paused){
            audio.play();
            button.textContent = "⏸";
        } else {
            audio.pause();
            button.textContent = "▶";
        }
    } else {
        if(currentIndex !== null){
            document.getElementById("btn-" + currentIndex).textContent = "▶";
        }

        currentIndex = index;
        audio.src = hits[index].src;
        audio.play();

        button.textContent = "⏸";
    }
}

function togglePlay5(index){
    const button = document.getElementById("btn-" + index);

    if(currentIndex === index){
        if(audio.paused){
            audio.play();
            button.textContent = "⏸";
        } else {
            audio.pause();
            button.textContent = "▶";
        }
    } else {
        if(currentIndex !== null){
            document.getElementById("btn-" + currentIndex).textContent = "▶";
        }

        currentIndex = index;
        audio.src = rock[index].src;
        audio.play();

        button.textContent = "⏸";
    }
}

audio.onended = () => {
    if(currentIndex !== null){
        document.getElementById("btn-" + currentIndex).textContent = "▶";
    }
};

searchInput?.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(value)
    );

    renderSongs(filtered);
});

renderSongs(songs);