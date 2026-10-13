// Game logic Module
import Ship from "./Ship.js";

const SIZE = 40;
const BOARD_SIZE = {
    width: 400,
    height: 400
};

const board = document.getElementById("board");
const warrior = new Ship(0, BOARD_SIZE.height - SIZE, SIZE, "blue"); // ship is created

board.appendChild(warrior.id());
warrior.show();

window.addEventListener("keydown", (e) => {
    switch(e.key) {
        case "ArrowLeft": {
            if ((warrior.x() - SIZE) < 0) {
                return;
            }
            warrior.move(-SIZE, 0);
            break;
        }
        case "ArrowRight": {
            if ((warrior.x() + SIZE) >= BOARD_SIZE.width) {
                return;
            }
            warrior.move(SIZE, 0);
            break;
        }
        // case "ArrowUp": {
        //     if ((warrior.y() - SIZE) < 0) {
        //         return;
        //     }
        //     warrior.move(0, -SIZE);
        //     break;
        // }
        // case "ArrowDown": {
        //     if ((warrior.y() + SIZE) >= BOARD_SIZE.height) {
        //         return;
        //     }
        //     warrior.move(0, SIZE);
        //     break;
        // }
    }
}); // end of callback

// Enemies
const COLORS = ["red", "green", "yellow", "magenta"];
const enemies = [];
for (let i = 0; i < 10; i++) {
    const color = COLORS[parseInt(Math.random() * COLORS.length)];
    enemies[i] = new Ship(i * SIZE, 0, SIZE, color);
    board.appendChild(enemies[i].id());
    enemies[i].show();
}

const interval = setInterval(moveEnemies, 1000);

function moveEnemies() {
    for (let enemy in enemies) {
        if (enemies[enemy].y() === BOARD_SIZE.height - (2 * SIZE)) {
            clearInterval(interval);
            window.alert("You LOOSE");
            return;
        }
        enemies[enemy].move(0, SIZE);
    }
}

