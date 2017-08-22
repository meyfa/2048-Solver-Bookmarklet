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

    describe("#getIterationOrder()", function () {

        it("should return an array", function () {
            expect(Solver.getIterationOrder(Solver.DOWN)).to.be.an("array");
        });

        it("should not contain edge tiles", function () {
            expect(Solver.getIterationOrder(Solver.UP)).to.not.have.members([
                0, 1, 2, 3,
            ]);
        });

    });

    describe("#getNewPosition()", function () {

        it("should return modified indices", function () {
            expect(Solver.getNewPosition(5, Solver.LEFT)).to.equal(4);
            expect(Solver.getNewPosition(5, Solver.RIGHT)).to.equal(6);
            expect(Solver.getNewPosition(5, Solver.UP)).to.equal(1);
            expect(Solver.getNewPosition(5, Solver.DOWN)).to.equal(9);
        });

        it("should limit x to 0 .. 3 inclusive", function () {
            expect(Solver.getNewPosition(4, Solver.LEFT)).to.equal(4);
            expect(Solver.getNewPosition(7, Solver.RIGHT)).to.equal(7);
        });

        it("should limit y to 0 .. 3 inclusive", function () {
            expect(Solver.getNewPosition(1, Solver.UP)).to.equal(1);
            expect(Solver.getNewPosition(13, Solver.DOWN)).to.equal(13);
        });

    });

    describe("#transform()", function () {

        it("should move the tiles", function () {
            var board = [
                0, 0, 0, 2,
                0, 0, 2, 0,
                0, 2, 0, 0,
                2, 0, 0, 0,
            ];
            Solver.transform(board, Solver.LEFT);
            expect(board).to.deep.equal([
                2, 0, 0, 0,
                2, 0, 0, 0,
                2, 0, 0, 0,
                2, 0, 0, 0,
            ]);
        });

        it("should merge tiles correctly", function () {
            var board = [
                0, 2, 2, 2,
                2, 2, 0, 0,
                0, 2, 2, 4,
                2, 0, 0, 0,
            ];
            Solver.transform(board, Solver.RIGHT);
            expect(board).to.deep.equal([
                0, 0, 2, 4,
                0, 0, 0, 4,
                0, 0, 4, 4,
                0, 0, 0, 2,
            ]);
        });

        it("should return whether the board changed", function () {
            var board = [
                0, 0, 0, 2,
                0, 0, 0, 2,
                0, 0, 0, 2,
                0, 0, 0, 2,
            ];
            expect(Solver.transform(board, Solver.LEFT)).to.equal(true);
            expect(Solver.transform(board, Solver.LEFT)).to.equal(false);
        });

    });

    describe("#heuristics", function () {

        describe("#emptyTiles()", function () {

            it("should value empty boards more", function () {
                var board = [
                    2, 2, 2, 2,
                    2, 2, 2, 2,
                    2, 2, 2, 2,
                    2, 2, 2, 2,
                ];
                var score = Solver.heuristics.emptyTiles(board);
                for (var i = 0; i < board.length; ++i) {
                    board[i] = 0;
                    var newScore = Solver.heuristics.emptyTiles(board);
                    expect(newScore).to.be.above(score);
                    score = newScore;
                }
            });

        });

        describe("#largeTilesInCorners()", function () {

            it("should prefer large numbers near corners", function () {
                var score1 = Solver.heuristics.largeTilesInCorners([
                    0, 0, 0, 0,
                    0, 128, 128, 0,
                    0, 128, 128, 0,
                    0, 0, 0, 0,
                ]);
                var score2 = Solver.heuristics.largeTilesInCorners([
                    0, 0, 0, 0,
                    128, 0, 128, 0,
                    0, 128, 128, 0,
                    0, 0, 0, 0,
                ]);
                var score3 = Solver.heuristics.largeTilesInCorners([
                    128, 0, 0, 0,
                    0, 0, 128, 0,
                    0, 128, 128, 0,
                    0, 0, 0, 0,
                ]);
                expect(score2).to.be.above(score1);
                expect(score3).to.be.above(score2);
            });

        });

    });

    describe("#calculateScore()", function () {

        it("sums up all heuristics", function () {
            Solver.heuristics = {
                a: function () {
                    return 32;
                },
                b: function () {
                    return -4;
                },
            };
            expect(Solver.calculateScore([
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ])).to.equal(32 - 4);
        });

    });

});
