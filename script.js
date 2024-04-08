let currentsong = new Audio;
let songs = [];
let currfolder;

//seconds to minute:second format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//fetching songs from songs folder and returning as songs.
async function getsongs(folder) {
    currfolder = folder
    let info = await fetch(`/${folder}`)
    console.log(folder)
    let response = await info.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let links = div.getElementsByTagName("a")
    console.log(links)
    let songs = []
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        if (element.href.endsWith("mp3")) {
            console.log(element.href.split('/')[5])
            songs.push(element.href.split(`/`)[5])
        }
    }

    //displaying songs in your library html
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        console.log(song)
        songul.innerHTML = songul.innerHTML + `<li>
                            <img class="invert musicimg" src="music.svg" alt="">
                            <div class="info">
                                <div class="songname">${song.replaceAll("%20", " ").replaceAll(".mp3", "").split("$")[0]}</div>
                                <div class="artist">${song.replaceAll("%20", " ").replaceAll(".mp3", "").split("$")[1]}</div>
                            </div>
                            <img class="invert playimg" src="play.svg" alt="">
         </li>`
    }

    //adding an eventlistner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            let music = (e.querySelector(".info").firstElementChild.innerHTML + "$" + e.querySelector(".info").querySelector(".artist").innerHTML)
            console.log(e.querySelector(".info").firstElementChild.innerHTML + e.querySelector(".info").querySelector(".artist").innerHTML)
            playmusic(music.trim())
        })
    })
    return songs
}

//playing music

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track + ".mp3"
    if (!pause) {
        currentsong.play()
        current.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split("$")[0]
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

//display the albums in card
async function display_album() {
    let info = await fetch(`/songs/`)
    let response = await info.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let links = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(links)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(e)
        if (e.href.includes("songs/")) {
            if (e.href.includes(".txt")) {

            } else {
                let folder = e.href.split("/")[4]
                let info = await fetch(`/songs/${folder}/info.json`)
                console.log(folder)
                let response = await info.json()
                cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder=${response.data} class="card">
                <img class="poster" src="/songs/${folder}/cover.jpeg" alt="cover image">
                <h3>${response.tittle}</h3>
                <div class="content">${response.description}</div>
                <div class="play_button"><img class="play" src="play-button-arrowhead.png" alt="play"></div>
                </div>`
            }
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            console.log(`songs/${item.currentTarget}`)
            playmusic(songs[0].split(".mp3")[0])
            console.log(songs[0].split(".mp3")[0])
        })
    })


    //adding eventlistner to playback
    current.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            current.src = "pause.svg"
        } else {
            currentsong.pause()
            current.src = "play.svg"
        }
    })
    //adding eventlistner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })
    //adding eventlistner for previous and next song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/")[5])
        console.log(currentsong, index, currentsong.src.split("/")[5], songs[index - 1])
        if (index - 1 >= 0) {
            playmusic(songs[index - 1].split(".mp3")[0])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/")[5])
        console.log(currentsong, index, currentsong.src.split("/")[5], songs[index + 1])
        if (index + 1 <= songs.length) {
            playmusic(songs[index + 1].split(".mp3")[0])
        }

    })

    //adding eventlistner to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //add eventlistner to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = "volume.svg"
            currentsong.volume = 0.1
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })
}


async function main() {

    //showing default song
    songs = await getsongs("songs/Hinrs")
    let track0 = songs[0].split(".mp3")[0]
    playmusic(track0, true)
    console.log(songs)

    display_album()


    //dispalying music duration
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })


    //adding eventlistner to hamburger and close
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })




    // //sliding of left class for mobile
    // const slideElements = document.querySelector('.screen-slide');
    // let currentSlideIndex = 0;

    // // Function to handle slide change
    // function changeSlide(index) {
    //     // Hide all slides
    //     slideElements.forEach(slide => {
    //         slide.style.display = 'none';
    //     });
    //     // Show the slide at the specified index
    //     slideElements[index].style.display = 'block';
    // }

    // // Initial setup: Show the first slide
    // changeSlide(currentSlideIndex);

    // // Function to handle next slide
    // function nextSlide() {
    //     if (currentSlideIndex < slideElements.length - 1) {
    //         currentSlideIndex++;
    //     } else {
    //         currentSlideIndex = 0; // Loop back to the first slide
    //     }
    //     changeSlide(currentSlideIndex);
    // }

    // // Function to handle previous slide
    // function previousSlide() {
    //     if (currentSlideIndex > 0) {
    //         currentSlideIndex--;
    //     } else {
    //         currentSlideIndex = slideElements.length - 1; // Go to the last slide
    //     }
    //     changeSlide(currentSlideIndex);
    // }

}

main()