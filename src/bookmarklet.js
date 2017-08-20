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
    Solver.move.left = Solver.move.bind(Solver, Solver.LEFT);
    Solver.move.up = Solver.move.bind(Solver, Solver.UP);
    Solver.move.right = Solver.move.bind(Solver, Solver.RIGHT);
    Solver.move.down = Solver.move.bind(Solver, Solver.DOWN);

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

})();
