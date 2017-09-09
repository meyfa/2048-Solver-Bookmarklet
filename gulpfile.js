var gulp = require("gulp");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

gulp.task("loader", function () {
    "use strict";
    return gulp.src("src/loader.js")
        .pipe(rename("loader.min.js"))
        .pipe(uglify({
            compress: {
                "negate_iife": false,
            },
        }))
        .pipe(gulp.dest("target"));
});

gulp.task("solver", function () {
    "use strict";
    return gulp.src("src/solver.js")
        .pipe(rename("solver.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("target"));
});

gulp.task("default", ["loader", "solver"]);
