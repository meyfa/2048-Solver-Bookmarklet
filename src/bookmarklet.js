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
        var merged = {};
        Solver.getIterationOrder(dir).forEach(function (i) {
            while (board[i] !== 0) {
                var j = Solver.getNewPosition(i, dir);
                if (board[j] === 0) {
                    board[j] = board[i];
                    board[i] = 0;
                    i = j;
                    continue;
                } else if (j !== i && !merged[j] && board[j] === board[i]) {
                    board[j] *= 2;
                    board[i] = 0;
                    merged[j] = true;
                }
                break;
            }
        });
    };

})();
