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

});
