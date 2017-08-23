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
        if (!tile) {
            tile = document.querySelector(cls);
        }
        return tile ? parseInt(tile.querySelector(".tile-inner").innerHTML, 10) : 0;
    };

    Solver.readBoard = function () {
        var tiles = [];
        for (var i = 0; i < 16; ++i) {
            tiles[i] = Solver.readTile(i % 4, Math.floor(i / 4));
        }
        return tiles;
    };

    Solver.getIterationOrder = function (dir) {
        switch (dir) {
            case Solver.LEFT:
                return [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];
            case Solver.RIGHT:
                return [2, 1, 0, 6, 5, 4, 10, 9, 8, 14, 13, 12];
            case Solver.UP:
                return [4, 8, 12, 5, 9, 13, 6, 10, 14, 7, 11, 15];
            case Solver.DOWN:
                return [8, 4, 0, 9, 5, 1, 10, 6, 2, 11, 7, 3];
        }
    };

    Solver.getNewPosition = function (i, dir) {
        var x = i % 4, y = Math.floor(i / 4);
        switch (dir) {
            case Solver.LEFT:
                x = Math.max(x - 1, 0);
                break;
            case Solver.RIGHT:
                x = Math.min(x + 1, 3);
                break;
            case Solver.UP:
                y = Math.max(y - 1, 0);
                break;
            case Solver.DOWN:
                y = Math.min(y + 1, 3);
                break;
        }
        return y * 4 + x;
    };

    Solver.transform = function (board, dir) {
        var merged = {}, changed = false;
        Solver.getIterationOrder(dir).forEach(function (i) {
            while (board[i] !== 0) {
                var j = Solver.getNewPosition(i, dir);
                if (board[j] === 0) {
                    board[j] = board[i];
                    board[i] = 0;
                    i = j;
                    changed = true;
                    continue;
                } else if (j !== i && !merged[j] && board[j] === board[i]) {
                    board[j] *= 2;
                    board[i] = 0;
                    merged[j] = true;
                    changed = true;
                }
                break;
            }
        });
        return changed;
    };

    Solver.heuristics = {};

    Solver.heuristics.emptyTiles = function (board) {
        return board.reduce(function (n, val) {
            return n + (val === 0);
        }, 0);
    };

    Solver.heuristics.largeTilesInCorners = function (board) {
        var score = 0;
        var max = Math.max.apply(null, board);
        for (var i = 0; i < board.length; ++i) {
            var x = i % 4, y = Math.floor(i / 4);
            var scale = board[i] / max;
            var d = (x === 0 || x === 3 ? 0 : 1) + (y === 0 || y === 3 ? 0 : 1);
            score -= scale * d;
        }
        return score * 2;
    };

    Solver.calculateScore = function (board) {
        var score = 0;
        Object.keys(Solver.heuristics).forEach(function (hName) {
            score += Solver.heuristics[hName](board);
        });
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
