// open ./index.html in your browser to run this test suite

var expect = window.chai.expect;

describe("Solver", function () {

    "use strict";

    var sampleBoard = [
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

    it("should be available globally", function () {
        expect(window.Solver).to.be.an("object");
    });

    describe("#move()", function () {

        it("should fire keydown", function (done) {
            window.addEventListener("keydown", function cb(event) {
                event.currentTarget.removeEventListener(event.type, cb);
                expect(event.which).to.equal(38);
                done();
            });
            Solver.move(Solver.UP);
        });

    });

    describe("#readTile()", function () {

        before(function () {
            document.querySelector(".tile-container").innerHTML = sampleBoard;
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

    describe("#readBoard()", function () {

        before(function () {
            document.querySelector(".tile-container").innerHTML = sampleBoard;
        });

        after(function () {
            document.querySelector(".tile-container").innerHTML = "";
        });

        it("should return an array", function () {
            expect(Solver.readBoard()).to.be.an("array");
        });

        it("should detect all tiles correctly", function () {
            expect(Solver.readBoard()).to.deep.equal([
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 2, 0, 0,
                0, 0, 16, 0,
            ]);
        });

    });

});
