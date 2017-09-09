(function (window, head) {
    "use strict";

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onerror = function () {
        // eslint disable-next-line no-alert
        window.alert("The bookmarklet could not be loaded.");
    };
    script.onload = function () {
        window.Solver.init();
    };
    head.appendChild(script);
    script.src = "https://meyfa.net/projects/2048-solver-bookmarklet/solver.min.js";

})(window, document.head || document.getElementsByTagName("head")[0]);
