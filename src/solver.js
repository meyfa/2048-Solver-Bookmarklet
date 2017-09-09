(function () {

    "use strict";

    if (window.Solver) {
        return;
    }

    var Solver = window.Solver = {};

    Solver.LEFT = 37;
    Solver.UP = 38;
    Solver.RIGHT = 39;
    Solver.DOWN = 40;

    Solver.DIRECTIONS = [
        Solver.LEFT, Solver.UP, Solver.RIGHT, Solver.DOWN,
    ];

    Solver.init = function () {
        Solver.initUI();
        Solver.initLookup();
    };

    Solver.initUI = function () {
        if (document.getElementById("solver-bookmarklet-ui")) {
            return;
        }
        var ui = document.createElement("p");
        ui.id = "solver-bookmarklet-ui";
        ui.style.marginTop = '30px';
        var buttonStyle = [
            '-webkit-appearance: none',
            '-moz-appearance: none',
            'appearance: none',
            'border: none',
            'font: inherit',
            'display: inline-block',
            'background: #8f7a66',
            'border-radius: 3px',
            'margin: 0 8px',
            'padding: 0 20px',
            'text-decoration: none',
            'color: #f9f6f2',
            'height: 40px',
            'line-height: 42px',
            'cursor: pointer',
            'font-weight: bold',
        ].join("; ");
        ui.innerHTML = [
            '<hr />',
            'Solver by <a href="http://meyfa.net">Fabian Meyer</a>',
            '<button onclick="Solver.start()" style="' + buttonStyle + '">Start</button>',
            '<button onclick="Solver.stop()" style="' + buttonStyle + '">Stop</button>',
        ].join("");
        var c = document.querySelector(".game-container");
        c.parentNode.insertBefore(ui, c);
    };

    function fireKeyboardEvent(type, code) {
        var evt = document.createEvent("KeyboardEvent");
        if (evt.initKeyEvent) {
            evt.initKeyEvent(type, true, true, document.defaultView,
                false, false, false, false, code, code);
        } else if (evt.initKeyboardEvent) {
            evt.initKeyboardEvent(type, true, true, document.defaultView,
                code, code, false, false, false, false, false);
        }
        Object.defineProperty(evt, "keyCode", {
            get: function() {
                return code;
            },
        });
        Object.defineProperty(evt, "which", {
            get: function() {
                return code;
            },
        });
        document.documentElement.dispatchEvent(evt);
    }

    Solver.move = function (dir) {
        fireKeyboardEvent("keydown", dir);
        fireKeyboardEvent("keyup", dir);
    };

    Solver.readTile = function (x, y) {
        var cls = ".tile-position-" + (x + 1) + "-" + (y + 1);
        var tile = document.querySelector(cls + ".tile-merged");
        if (!tile && !(tile = document.querySelector(cls))) {
            return 0;
        }
        var table = { 0: 0, 2: 1, 4: 2, 8: 3, 16: 4, 32: 5, 64: 6, 128: 7,
            256: 8, 512: 9, 1024: 10, 2048: 11, 4096: 12, 8192: 13, 16384: 14,
            32768: 15 };
        return table[parseInt(tile.querySelector(".tile-inner").innerHTML, 10)];
    };

    Solver.readBoard = function () {
        var tiles = [];
        for (var i = 0; i < 16; ++i) {
            tiles[i] = Solver.readTile(i % 4, Math.floor(i / 4));
        }
        return tiles;
    };

    Solver.transformLineLeft = function (line) {
        var merged = [];
        for (var i = 1; i < 4; ++i) {
            var pos = i;
            while (line[pos] !== 0 && pos > 0) {
                if (line[pos - 1] === 0) {
                    line[pos - 1] = line[pos];
                    line[pos] = 0;
                    --pos;
                    continue;
                }
                if (!merged[pos - 1] && line[pos - 1] === line[pos]) {
                    ++line[pos - 1];
                    line[pos] = 0;
                    merged[pos - 1] = true;
                }
                break;
            }
        }
    };

    Solver.getLookupIndex = function (a, b, c, d) {
        return ((a * 16 + b) * 16 + c) * 16 + d;
    };

    Solver.initLookup = function () {
        Solver.lineLookup = [];
        var values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        values.forEach(function (a) {
            values.forEach(function (b) {
                values.forEach(function (c) {
                    values.forEach(function (d) {
                        var line = [a, b, c, d];
                        Solver.transformLineLeft(line);
                        if (line[0] !== a || line[1] !== b || line[2] !== c || line[3] !== d) {
                            var index = Solver.getLookupIndex(a, b, c, d);
                            Solver.lineLookup[index] = line;
                        }
                    });
                });
            });
        });
    };

    Solver.getTransformOrder = function (dir) {
        switch (dir) {
            case Solver.LEFT:
                return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            case Solver.RIGHT:
                return [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8, 15, 14, 13, 12];
            case Solver.UP:
                return [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
            case Solver.DOWN:
                return [12, 8, 4, 0, 13, 9, 5, 1, 14, 10, 6, 2, 15, 11, 7, 3];
        }
    };

    Solver.transform = function (board, dir) {
        var changed = false, src, dst;
        var order = Solver.getTransformOrder(dir);
        for (var i = 0; i < 16; i += 4) {
            src = Solver.getLookupIndex(board[order[i]], board[order[i + 1]],
                board[order[i + 2]], board[order[i + 3]]);
            dst = Solver.lineLookup[src];
            if (dst) {
                changed = true;
                board[order[i]] = dst[0];
                board[order[i + 1]] = dst[1];
                board[order[i + 2]] = dst[2];
                board[order[i + 3]] = dst[3];
            }
        }
        return changed;
    };

    Solver.calculateScore = function (board) {
        var distances = [0, 1, 1, 0, 1, 2, 2, 1, 1, 2, 2, 1, 0, 1, 1, 0];
        var score = 0;
        var max = Math.max.apply(null, board);
        for (var i = 0; i < board.length; ++i) {
            var scale = board[i] / max;
            score = score + (board[i] === 0 ? 1 : 0) - scale * distances[i];
        }
        return score;
    };

    Solver.pickDirection = function (board, levels) {
        var result = { direction: Solver.LEFT, score: -Infinity };
        Solver.DIRECTIONS.forEach(function (dir) {
            var b = board.slice();
            var changed = Solver.transform(b, dir);
            if (!changed) {
                return;
            }
            var score = Solver.calculateScore(b);
            if (levels > 0) {
                score += Solver.pickDirection(b, levels - 1).score * 0.5;
            }
            if (score > result.score) {
                result.direction = dir;
                result.score = score;
            }
        });
        return result;
    };

    Solver.next = function () {
        var result = Solver.pickDirection(Solver.readBoard(), 6);
        Solver.move(result.direction);
    };

    var intval = null;

    Solver.start = function () {
        if (!intval) {
            intval = window.setInterval(Solver.next, 100);
        }
    };

    Solver.stop = function () {
        window.clearInterval(intval);
        intval = null;
    };

})();
