const cvs = document.getElementById("canvas")
cvs.width = 256
cvs.height = 512
const ctx = cvs.getContext('2d')

const scoreElem = document.getElementById("score")
const bestScoreElem = document.getElementById("bestScore")

let scoreVal = 0
let bestScoreVal = localStorage.getItem("bestScore") || 0

let bird = new Image()
bird.src = 'img/bird.png'

let back = new Image()
back.src = 'img/back.png'

let pipeBottom = new Image()
pipeBottom.src = 'img/pipeBottom.png'

let pipeUp = new Image()
pipeUp.src = 'img/pipeUp.png'

let road = new Image()
road.src = 'img/road.png'

let flyAudio = new Audio()
flyAudio.src = 'audio/fly.mp3'

let scoreAudio = new Audio()
scoreAudio.src = 'audio/score.mp3'

let velY = 0
let gravity = 0.2

let xPos = 20
let yPos = 150

let gap = 110
let pipe = [{
    x: cvs.width,
    y: 0,
    counted: false
}]

let gameInterval = null
let isPaused = false

function startGame() {
    if (!gameInterval) {
        gameInterval = setInterval(draw, 20)
    }
}

function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(draw, 20)
        isPaused = false
    } else {
        clearInterval(gameInterval)
        gameInterval = null
        isPaused = true
        drawPaused()
    }
}

function drawPaused() {
    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(0, 0, cvs.width, cvs.height)
    ctx.fillStyle = "#fff"
    ctx.font = "20px Arial"
    ctx.fillText("PAUSED", 80, 250)
}

function draw() {
    ctx.drawImage(back, 0, 0)
    ctx.drawImage(bird, xPos, yPos)

    velY += gravity
    yPos += velY

    for (let i = 0; i < pipe.length; i++) {
        if (pipe[i].x > -pipeUp.width) {
            ctx.drawImage(pipeUp, pipe[i].x, pipe[i].y)
            ctx.drawImage(
                pipeBottom,
                pipe[i].x,
                pipe[i].y + pipeUp.height + gap
            )
            pipe[i].x -= 2
        }

        if (
            xPos + bird.width >= pipe[i].x &&
            xPos <= pipe[i].x + pipeUp.width &&
            (
                yPos <= pipe[i].y + pipeUp.height ||
                yPos + bird.height >= pipe[i].y + pipeUp.height + gap
            )
        ) {
            reset()
        }

        if (pipe[i].x <= xPos && !pipe[i].counted) {
            scoreVal++
            pipe[i].counted = true
            scoreAudio.play()
        }
    }

    if (pipe.length && pipe[0].x < -pipeUp.width) {
        pipe.shift()
    }

    if (pipe.length && pipe[pipe.length - 1].x < 60) {
        pipe.push({
            x: cvs.width,
            y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height,
            counted: false
        })
    }

    if (yPos >= cvs.height - road.height) {
        reset()
    }

    ctx.drawImage(road, 0, cvs.height - road.height)

    scoreElem.innerText = "SCORE: " + scoreVal
    bestScoreElem.innerText = "BEST SCORE: " + bestScoreVal
}

function moveUp() {
    if (isPaused) return
    velY = -4
    flyAudio.play()
}

function reset() {
    if (scoreVal > bestScoreVal) {
        bestScoreVal = scoreVal
        localStorage.setItem("bestScore", bestScoreVal)
    }

    scoreVal = 0
    xPos = 20
    yPos = 150
    velY = 0

    pipe = [{
        x: cvs.width,
        y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height,
        counted: false
    }]
}

cvs.addEventListener('mousedown', moveUp)

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') moveUp()
    if (e.code === 'KeyP') togglePause()
})

startGame()