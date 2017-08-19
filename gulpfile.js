var gulp = require("gulp");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");

gulp.task("default", function () {
    return gulp.src("src/**/*.js")
        .pipe(rename("bookmarklet.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("target"));
});
