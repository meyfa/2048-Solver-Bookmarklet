// open ./index.html in your browser to run this test suite

var expect = window.chai.expect;

describe("Solver", function () {

    "use strict";

    it("should be available globally", function () {
        expect(window.Solver).to.be.an("object");
    });

    describe("#move", function () {

        it("should fire keydown", function (done) {
            window.addEventListener("keydown", function cb(event) {
                event.currentTarget.removeEventListener(event.type, cb);
                expect(event.which).to.equal(38);
                done();
            });
            Solver.move(Solver.UP);
        });

    });

    describe("#readTile", function () {

        before(function () {
            var c = document.querySelector(".tile-container");
            c.innerHTML = [
                '<div class="tile tile-2 tile-position-2-3">',
                '    <div class="tile-inner">2</div>',
                '</div>',
                '<div class="tile tile-8 tile-position-3-4">',
                '    <div class="tile-inner">8</div>',
                '</div>',
                '<div class="tile tile-16 tile-position-3-4 tile-merged">',
                '    <div class="tile-inner">16</div>',
                '</div>',
            ].join("");
        });

        after(function () {
            document.querySelector(".tile-container").innerHTML = "";
        });

        it("should detect regular tiles", function () {
            expect(Solver.readTile(1, 2)).to.equal(2);
        });

        it("should detect merged tiles", function () {
            expect(Solver.readTile(2, 3)).to.equal(16);
        });

        it("should return 0 for empty tiles", function () {
            expect(Solver.readTile(1, 1)).to.equal(0);
        });

    });

});
