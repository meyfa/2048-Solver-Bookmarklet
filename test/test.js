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

    describe("#initUI()", function () {

        afterEach(function () {
            var e = document.getElementById("solver-bookmarklet-ui");
            e.parentNode.removeChild(e);
        });

        it("should add start and stop buttons", function () {
            Solver.initUI();
            var buttons = document.querySelectorAll("#solver-bookmarklet-ui > button");
            expect(buttons).to.have.lengthOf(2);
            expect(buttons[0].getAttribute("onclick")).to.equal("Solver.start()");
            expect(buttons[1].getAttribute("onclick")).to.equal("Solver.stop()");
        });

        it("should not run multiple times", function () {
            // run first time
            Solver.initUI();
            var e1 = document.querySelectorAll("#solver-bookmarklet-ui");
            // run second time
            Solver.initUI();
            var e2 = document.querySelectorAll("#solver-bookmarklet-ui");
            expect(e2).to.deep.equal(e1);
        });

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
            expect(Solver.readTile(1, 2)).to.equal(1);
        });

        it("should detect merged tiles", function () {
            expect(Solver.readTile(2, 3)).to.equal(4);
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
                0, 1, 0, 0,
                0, 0, 4, 0,
            ]);
        });

    });

    describe("#transformLineLeft()", function () {

        it("should move the tiles", function () {
            var line = [0, 3, 0, 0];
            Solver.transformLineLeft(line);
            expect(line).to.deep.equal([3, 0, 0, 0]);
        });

        it("should merge tiles correctly", function () {
            var line = [0, 3, 3, 3];
            Solver.transformLineLeft(line);
            expect(line).to.deep.equal([4, 3, 0, 0]);
        });

    });

    describe("#getLookupIndex()", function () {

        it("should return unique indices 0 to 65535", function () {
            var values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
            var seen = [];
            values.forEach(function (a) {
                values.forEach(function (b) {
                    values.forEach(function (c) {
                        values.forEach(function (d) {
                            var value = Solver.getLookupIndex(a, b, c, d);
                            if (seen[value]) {
                                throw new Error("value seen twice");
                            }
                            if (value < 0) {
                                throw new Error("value less than 0");
                            }
                            if (value > 65535) {
                                throw new Error("value bigger than 65535");
                            }
                            seen[value] = true;
                        });
                    });
                });
            });
        });

    });

    describe("#initLookup()", function () {

        before(function () {
            Solver.initLookup();
        });

        after(function () {
            delete Solver.lineLookup;
        });

        it("should init Solver.lineLookup", function () {
            expect(Solver).to.have.property("lineLookup");
            expect(Solver.lineLookup).to.be.an("array");
        });

        it("should assign transformed lines", function () {
            var index = Solver.getLookupIndex(0, 0, 1, 0);
            expect(Solver.lineLookup[index]).to.deep.equal([1, 0, 0, 0]);
        });

        it("should not assign unchanged lines", function () {
            var index = Solver.getLookupIndex(3, 2, 1, 0);
            expect(Solver.lineLookup[index]).to.equal(undefined);
        });

    });

    describe("#getTransformOrder()", function () {

        it("should return an array", function () {
            expect(Solver.getTransformOrder(Solver.DOWN)).to.be.an("array");
        });

    });

    describe("#transform()", function () {

        before(function () {
            Solver.initLookup();
        });

        after(function () {
            delete Solver.lineLookup;
        });

        it("should move the tiles", function () {
            var board = [
                0, 0, 0, 1,
                0, 0, 2, 0,
                0, 3, 0, 0,
                4, 0, 0, 0,
            ];
            Solver.transform(board, Solver.LEFT);
            expect(board).to.deep.equal([
                1, 0, 0, 0,
                2, 0, 0, 0,
                3, 0, 0, 0,
                4, 0, 0, 0,
            ]);
        });

        it("should merge tiles correctly", function () {
            var board = [
                0, 5, 5, 5,
                4, 4, 0, 0,
                0, 3, 3, 4,
                2, 0, 0, 0,
            ];
            Solver.transform(board, Solver.RIGHT);
            expect(board).to.deep.equal([
                0, 0, 5, 6,
                0, 0, 0, 5,
                0, 0, 4, 4,
                0, 0, 0, 2,
            ]);
        });

        it("should return whether the board changed", function () {
            var board = [
                2, 2, 2, 2,
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,
            ];
            expect(Solver.transform(board, Solver.DOWN)).to.equal(true);
            expect(Solver.transform(board, Solver.DOWN)).to.equal(false);
        });

    });

    describe("#calculateScore()", function () {

        it("should value empty boards more", function () {
            var board = [
                2, 2, 2, 2,
                2, 2, 2, 2,
                2, 2, 2, 2,
                2, 2, 2, 2,
            ];
            var score = Solver.calculateScore(board);
            // note that board will never be completely empty
            // so we only go down to length - 1 empty tiles
            for (var i = 0; i < board.length - 1; ++i) {
                board[i] = 0;
                var newScore = Solver.calculateScore(board);
                expect(newScore).to.be.above(score);
                score = newScore;
            }
        });

        it("should prefer large numbers near corners", function () {
            var score1 = Solver.calculateScore([
                0, 0, 0, 0,
                0, 7, 7, 0,
                0, 7, 7, 0,
                0, 0, 0, 0,
            ]);
            var score2 = Solver.calculateScore([
                0, 0, 0, 0,
                7, 0, 7, 0,
                0, 7, 7, 0,
                0, 0, 0, 0,
            ]);
            var score3 = Solver.calculateScore([
                7, 0, 0, 0,
                0, 0, 7, 0,
                0, 7, 7, 0,
                0, 0, 0, 0,
            ]);
            expect(score2).to.be.above(score1);
            expect(score3).to.be.above(score2);
        });

    });

    describe("#pickDirection()", function () {

        before(function () {
            Solver.initLookup();
        });

        after(function () {
            delete Solver.lineLookup;
        });

        it("returns an object with direction and score", function () {
            var result = Solver.pickDirection([
                0, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 0, 0,
                0, 0, 3, 0,
            ], 1);
            expect(result).to.be.an("object");
            expect(result.direction).to.be.oneOf(Solver.DIRECTIONS);
            expect(result.score).to.be.a("number");
        });

        it("does not modify the input", function () {
            var board1 = [
                2, 2, 4, 4,
                0, 0, 0, 0,
                0, 0, 4, 0,
                0, 0, 0, 0,
            ];
            var board2 = board1.slice();
            Solver.pickDirection(board2);
            expect(board2).to.deep.equal(board1);
        });

        it("accepts a recursion level", function () {
            var board = [
                2, 2, 3, 3,
                0, 0, 0, 0,
                0, 1, 3, 0,
                0, 1, 0, 0,
            ];
            var score = 0;
            for (var i = 1; i <= 5; ++i) {
                var newScore = Solver.pickDirection(board, i);
                expect(newScore).to.not.equal(score);
                score = newScore;
            }
        });

    });

    describe("#next()", function () {

        before(function () {
            Solver.initLookup();
        });

        after(function () {
            delete Solver.lineLookup;
        });

        it("should perform a move", function (done) {
            Solver.move = function (dir) {
                expect(dir).to.be.oneOf(Solver.DIRECTIONS);
                done();
            };
            Solver.next();
        });

    });

});
