(function () {

    "use strict";

    if (window.Solver) {
        return;
    }

    var Solver = window.Solver = {};

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
    Solver.move.left = Solver.move.bind(Solver, 37);
    Solver.move.up = Solver.move.bind(Solver, 38);
    Solver.move.right = Solver.move.bind(Solver, 39);
    Solver.move.down = Solver.move.bind(Solver, 40);

    Solver.readTile = function (x, y) {
        var cls = ".tile-position-" + x + "-" + y;
        var tile = document.querySelector(cls + ".tile-merged");
        if (!tile) {
            tile = document.querySelector(cls);
        }
        return tile ? parseInt(tile.querySelector(".tile-inner").innerHTML, 10) : 0;
    };

    Solver.readBoard = function () {
        var tiles = [];
        for (var i = 0; i < 16; ++i) {
            tiles[i] = Solver.readTile(i % 4 + 1, Math.floor(i / 4 + 1));
        }
        return tiles;
    };

})();
