const startScreen = document.getElementById('start-screen');
const characterForm = document.getElementById('character-form');
const characterNameInput = document.getElementById('character-name');
const character = document.getElementById('character');
const clue = document.getElementById('clue');
const popup = document.getElementById('popup');
const answerInput = document.getElementById('answer');
const gameBoard = document.getElementById('game-board');
const templeMap = document.getElementById('temple-map');
const treasure = document.getElementById('treasure');
const guard = document.getElementById('guard');
const resultPopup = document.getElementById('result-popup');
const resultMessage = document.getElementById('result-message');
const backgroundMusic = document.getElementById('background-music');
const dataDisplay = document.getElementById('data-display');

let characterPosition = { x: 0, y: 0 };
let cluePosition = getRandomPosition();
let treasurePosition = getRandomPosition();
let guardPosition = getRandomPosition();

// 定义各个区域的边界
const libraryBoundary = { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } };
const templeBoundary = { x: { min: 100, max: 200 }, y: { min: 100, max: 200 } };
const guardBoundary = { x: { min: 200, max: 300 }, y: { min: 200, max: 300 } };

// 检查玩家是否在特定区域内
function isInBoundary(position, boundary) {
    return position.x >= boundary.x.min && position.x <= boundary.x.max &&
           position.y >= boundary.y.min && position.y <= boundary.y.max;
}

// 根据玩家位置加载对应的数据
async function loadDataBasedOnPosition(position) {
    if (isInBoundary(position, libraryBoundary)) {
        await loadLibraryData();
    } else if (isInBoundary(position, templeBoundary)) {
        await loadTempleData();
    } else if (isInBoundary(position, guardBoundary)) {
        await loadGuardData();
    } else {
        // 如果玩家不在任何特定区域，可以选择清空数据展示区域或显示默认信息
        dataDisplay.innerText = '您现在不在任何特定区域。';
    }
}

// 加载图书馆数据的函数
async function loadLibraryData() {
    try {
        const response = await fetch('library.txt');
        const data = await response.text();
        dataDisplay.innerText = `图书馆资料：\n${data}`;
    } catch (error) {
        console.error('Error loading library data:', error);
    }
}

// 加载神庙数据的函数
async function loadTempleData() {
    try {
        const response = await fetch('temple.txt');
        const data = await response.text();
        dataDisplay.innerText = `神庙资料：\n${data}`;
    } catch (error) {
        console.error('Error loading temple data:', error);
    }
}

// 加载守卫数据的函数
async function loadGuardData() {
    try {
        const response = await fetch('guard.txt');
        const data = await response.text();
        dataDisplay.innerText = `守卫资料：\n${data}`;
    } catch (error) {
        console.error('Error loading guard data:', error);
    }
}

function getRandomPosition() {
    const x = Math.floor(Math.random() * 450);
    const y = Math.floor(Math.random() * 450);
    return { x, y };
}

function updatePosition(element, position) {
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
}

function moveCharacter(direction) {
    switch (direction) {
        case 'ArrowUp':
            characterPosition.y -= 10;
            break;
        case 'ArrowDown':
            characterPosition.y += 10;
            break;
        case 'ArrowLeft':
            characterPosition.x -= 10;
            break;
        case 'ArrowRight':
            characterPosition.x += 10;
            break;
    }
    updatePosition(character, characterPosition);
    if (!templeMap.classList.contains('hidden')) {
        moveGuard();
    }
    loadDataBasedOnPosition(characterPosition);
}

function checkCollision() {
    if (Math.abs(characterPosition.x - cluePosition.x) < 50 && Math.abs(characterPosition.y - cluePosition.y) < 50) {
        popup.classList.remove('hidden');
    }
}

function checkAnswer() {
    if (answerInput.value === '2') {
        if (confirm('恭喜你，答对了！是否前往古老的神庙？')) {
            initTempleMap();
        }
    } else {
        alert('答案错误，请再试一次。');
    }
}

function initTempleMap() {
    gameBoard.classList.add('hidden');
    popup.classList.add('hidden');
    templeMap.classList.remove('hidden');
    templeMap.appendChild(character);
    characterPosition = { x: 50, y: 50 };
    updatePosition(character, characterPosition);
    updatePosition(treasure, treasurePosition);
    updatePosition(guard, guardPosition);
}

function moveGuard() {
    var direction = {
        x: characterPosition.x - guardPosition.x,
        y: characterPosition.y - guardPosition.y
    };
    var distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (distance > 0) {
        direction.x /= distance;
        direction.y /= distance;
        guardPosition.x += direction.x * 2;
        guardPosition.y += direction.y * 10;
        updatePosition(guard, guardPosition);
        checkGuardCollision();
    }
}

function checkGuardCollision() {
    if (Math.abs(characterPosition.x - guardPosition.x) < 50 && Math.abs(characterPosition.y - guardPosition.y) < 50) {
        resultMessage.textContent = '寻宝失败！';
        resultPopup.classList.remove('hidden');
    }
}

function checkTreasureCollision() {
    if (Math.abs(characterPosition.x - treasurePosition.x) < 50 && Math.abs(characterPosition.y - treasurePosition.y) < 50) {
        resultMessage.textContent = '寻宝成功！';
        resultPopup.classList.remove('hidden');
    }
}

function restartGame() {
    location.reload();
}

function savePlayerInfo(playerInfo) {
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
}

function getPlayerInfo() {
    const playerInfo = localStorage.getItem('playerInfo');
    return playerInfo ? JSON.parse(playerInfo) : null;
}

function toggleMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function playMusic() {
    backgroundMusic.play().catch(error => {
        console.error('Error playing music:', error);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const playerInfo = getPlayerInfo();
    if (playerInfo) {
        characterNameInput.value = playerInfo.name;
    }
    playMusic();
    // 初始加载数据
    await loadDataBasedOnPosition(characterPosition);
});

characterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const characterName = characterNameInput.value;
    if (characterName) {
        const playerId = 'player123'; // 示例玩家ID
        const playerInfo = {
            id: playerId,
            name: characterName,
            gameHistory: ['第一次游戏', '第二次游戏'] // 示例游戏历史
        };
        savePlayerInfo(playerInfo);

        startScreen.classList.add('hidden');
        gameBoard.classList.remove('hidden');
        character.style.backgroundImage = `url('images/character.jpg')`;
    }
});

document.getElementById('toggle-music-btn').addEventListener('click', toggleMusic);

document.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return;
    }
    moveCharacter(event.key);
    if (!templeMap.classList.contains('hidden')) {
        checkTreasureCollision();
    } else {
        checkCollision();
    }
});

clue.style.left = `${cluePosition.x}px`;
clue.style.top = `${cluePosition.y}px`;
