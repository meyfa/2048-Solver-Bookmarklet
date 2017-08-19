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

})();
