function find_array_in_array(haystack, needle) {
    var i, j, current;
    for (i = 0; i < haystack.length; ++i) {
        if (needle.length === haystack[i].length) {
            current = haystack[i];
            for (j = 0; j < needle.length && needle[j] === current[j]; ++j);
            if (j === needle.length)
                return i;
        }
    }
    return -1;
}

function remove_array_from_array(haystack, needle) {
    index = find_array_in_array(haystack, needle);
    haystack.splice(index, 1)
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
class Grid {
    constructor(x_n) {
        // Assign the RGB values as a property of `this`.
        this.x_n = x_n;
        this.dx = canvas.width / this.x_n;
        this.dy = this.dx; // keep it square
        this.y_n = this.x_n;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw_lines();

        this.active_cells = [];

        this.all_cells = [];
        for (let x = 0; x < this.x_n; x++) {
            for (let y = 0; y < this.y_n; y++) {
                let cell = [x, y]
                this.all_cells.push(cell);
            }
        }
        this.center = [Math.round(this.x_n / 2), Math.round(this.y_n / 2)]
    }

    draw_lines() {
        for (let step = 0; step < this.x_n+1; step++) {
            ctx.beginPath();
            ctx.moveTo(step * this.dx, 0);
            ctx.lineTo(step * this.dx, canvas.height);
            ctx.stroke();
        }
        for (let step = 0; step < this.y_n+1; step++) {
            ctx.beginPath();
            ctx.moveTo(0, step * this.dy);
            ctx.lineTo(canvas.width, step * this.dy);
            ctx.stroke();
        }
    }

    get_grid_xy(event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left
        let y = event.clientY - rect.top
        let x_grid = Math.floor(x / this.dx);
        let y_grid = Math.floor(y / this.dy);
        return [x_grid, y_grid]
    }

    fill_cell(xy) {
        let grid_x = xy[0];
        let grid_y = xy[1];
        ctx.beginPath();
        ctx.rect(grid_x * this.dx, grid_y * this.dy, this.dx, this.dy);
        ctx.fillStyle = "#AA0033";
        ctx.fill();
        ctx.closePath();
    }

    click_cell(event) {
        let cell = this.get_grid_xy(event);
        if (find_array_in_array(this.active_cells, cell) > -1) {
            remove_array_from_array(this.active_cells, cell)
        } else {
            this.active_cells.push(cell)
        }
        this.draw_cells();
    }

    activate_random_cells(pct) {
        let num = Math.round(pct / 100 * this.x_n * this.x_n);
        console.log(num)
        let new_cells = [];
        for (let i = 0; i < num; i++) {
            let duplicate = true
            let x = 0
            let y = 0
            do {
                x = Math.round(Math.random() * (this.x_n - 1));
                y = Math.round(Math.random() * (this.y_n - 1));
                duplicate = find_array_in_array(new_cells, [x, y]) > -1
                console.log(duplicate)
            } while (duplicate === true);
            new_cells.push([x, y]);
        }
        this.active_cells = new_cells;
        this.draw_cells();
    }

    activate_preset(preset_coord, recenter = true) {
        origin = this.center;
        let new_cells = [];
        if (recenter === true) {
            for (const cell of preset_coord) {
                new_cells.push([origin[0] + cell[0], origin[1] + cell[1]])
            }
        } else { new_cells = preset_coord }
        this.active_cells = new_cells;
        this.draw_cells();
    }

    draw_cells() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.draw_lines()
        for (const cell of this.active_cells) {
            this.fill_cell(cell);
        }
    }

    apply_rules() {
        let new_cells = []
        // Check if alive cells have 2 or 3 neighbours
        for (const cell of this.active_cells) {
            let alive_neighbours = this.num_neighbours(cell)
            if ([2, 3].includes(alive_neighbours)) {
                new_cells.push(cell)
            }
        }

        // check if dead cells have 3 alive neighbours:
        for (const cell of this.all_cells) {
            if (find_array_in_array(this.active_cells, cell) === -1) {
                let alive_neighbours = this.num_neighbours(cell)
                if (alive_neighbours === 3) {
                    new_cells.push(cell)
                }
            }
        }

        this.active_cells = new_cells;
    }

    num_neighbours(cell) {
        let count = 0;
        let rel_coords = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
        for (const rel_xy of rel_coords) {
            let neighbour_cell = [cell[0] + rel_xy[0], cell[1] + rel_xy[1]]
            if (find_array_in_array(this.active_cells, neighbour_cell) > -1) {
                count += 1
            }
        }
        return count
    }

    step() {
        this.apply_rules();
        this.draw_cells();
    }
}
let grid = new Grid(32)

let stepButton = document.querySelector("#step");
stepButton.addEventListener('click', grid.step.bind(grid), false)

let ppButton = document.querySelector("#play_pause")
let running = false
function togglePausePlay() {
    if (running === false) {
        running = true
        ppButton.textContent = 'PAUSE'
    } else {
        running = false
        ppButton.textContent = 'PLAY'
    }
}

function keyDownHandler(e) {
    if (e.key === " " ||
        e.code == "Space" ||
        e.keyCode == 32) {
        togglePausePlay();
    }
}

ppButton.addEventListener('click', togglePausePlay, false)
document.addEventListener("keydown", keyDownHandler, false);
function add_live_cells(event) {
    if (running === true) {
        togglePausePlay();
    }
    grid.click_cell(event)
}

canvas.addEventListener('click', add_live_cells, false);

function auto_run() {
    if (running === true) {
        grid.step();
    }
}
let grid_slider = document.getElementById("grid_num");
let grid_label = document.getElementById("grid_num_label");
let canvas_slider = document.getElementById("canvas_size");
let canvas_size_label = document.getElementById("canvas_size_label");
canvas_slider.oninput = function () {
    let old_x_n = grid.x_n
    canvas.width = this.value;
    canvas.height = this.value;
    grid = new Grid(old_x_n);
    canvas_size_label.innerText = "Size";
    if (this.value < 128) {
        grid_slider.max = this.value
    }
}

// prevent scrolling on space
window.addEventListener('keydown', function (e) {
    if (e.key == " " && e.target == document.body) {
        e.preventDefault();
    }
});

grid_slider.addEventListener('change', function (e) {
    let size = this.value
    grid_label.innerText = "Number of cells"
    grid = new Grid(size)
});

let speed_slider = document.getElementById("speed");
let speed_label = document.getElementById("speed_label");
var interval = 1000,
    i = 0,
    output = document.getElementById('output');

function loop() {
    i++;
    window.setTimeout(loop, interval);
    auto_run()
}

speed_slider.addEventListener('change', function (e) {
    let speed = Math.pow(10, parseInt(this.value) / 10);
    console.log(speed)
    interval = 1000 / speed
    //window.setTimeout(loop, 10); // temp reset interval to make speed change immediate
    speed_label.innerText = "Speed: " + speed.toFixed(1)

});

random_seed = document.getElementById("random_seed")
random_seed_submit = document.getElementById("random_seed_submit")

random_seed_submit.addEventListener('click', function (e) {
    let seed_pct = random_seed.value
    if (seed_pct < 0) { seed_pct = 0 }
    if (seed_pct > 100) { seed_pct = 100 }
    grid.activate_random_cells(seed_pct)
})
loop();

// choose a preset

document.getElementById("r-pentomino").addEventListener('click', function (e) {
    preset_coord = [[0, 0],
    [0, 1],
    [1, 1],
    [0, -1],
    [-1, 0]
    ];
    grid.activate_preset(preset_coord);
})
document.getElementById("glider").addEventListener('click', function (e) {
    preset_coord = [[0, 0],
    [0, 1],
    [0, -1],
    [2, 0],
    [1, -1]
    ];
    grid.activate_preset(preset_coord);
})
document.getElementById("toad").addEventListener('click', function (e) {
    preset_coord = [[0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [-1, 0],
    [1, 0]
    ];
    grid.activate_preset(preset_coord);
})
document.getElementById("pulsar").addEventListener('click', function (e) {
    preset_coord = [[2, 1],
    [3, 1],
    [4, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [6, 2],
    [6, 3],
    [6, 4],
    [2, 6],
    [3, 6],
    [4, 6],
    [-2, 1],
    [-3, 1],
    [-4, 1],
    [-1, 2],
    [-1, 3],
    [-1, 4],
    [-6, 2],
    [-6, 3],
    [-6, 4],
    [-2, 6],
    [-3, 6],
    [-4, 6],
    [2, -1],
    [3, -1],
    [4, -1],
    [1, -2],
    [1, -3],
    [1, -4],
    [6, -2],
    [6, -3],
    [6, -4],
    [2, -6],
    [3, -6],
    [4, -6],
    [-2, -1],
    [-3, -1],
    [-4, -1],
    [-1, -2],
    [-1, -3],
    [-1, -4],
    [-6, -2],
    [-6, -3],
    [-6, -4],
    [-2, -6],
    [-3, -6],
    [-4, -6],
    ];
    grid.activate_preset(preset_coord);
})
document.getElementById("lwss").addEventListener('click', function (e) {
    preset_coord = [[0, 0],
    [0, 1],
    [0, 2],
    [1, 3],
    [4, 3],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 1]
    ];
    grid.activate_preset(preset_coord);
})
document.getElementById("ggg").addEventListener('click', function (e) {
    preset_coord = [[5, 1], [5, 2], [6, 1], [6, 2], [5, 11], [6, 11], [7, 11], [4, 12], [3, 13], [3, 14], [8, 12], [9, 13], [9, 14], [6, 15], [4, 16], [5, 17], [6, 17], [7, 17], [6, 18], [8, 16], [3, 21], [4, 21], [5, 21], [3, 22], [4, 22], [5, 22], [2, 23], [6, 23], [1, 25], [2, 25], [6, 25], [7, 25], [3, 35], [4, 35], [3, 36], [4, 36]
    ];
    // grid needs to be > 35
    if (grid.x_n < 40) {
        size = 40
        grid_label.innerText = "Grid Size: " + size
        grid = new Grid(size)
    }
    grid.activate_preset(preset_coord, recenter = false);
})
