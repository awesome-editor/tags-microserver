var Tags = require('../routes/tags')


var BAD_REQUEST = 400;

var NO_CALLS = [];


describe("create", function () {

    var tagger = new Tags(null);

    describe("validator", function() {

        var validCreate = [{name: 'foo'}, {name: 'bar'}],
            invalidCreate = [{name: 'foo'}, {id: 0, name:'bar'}],

            pojo = {name: 'foo'},
            singleNestedArray = [pojo],

            res = {
                status: function() {}
            },

            json;


        beforeEach(function() {

            json = jasmine.createSpyObj('json', ['json']);

            spyOn(res, 'status').andCallFake(function() {

                return json;
            });
        });


        it("should approve good filename", function() {

            tagger.validatePath({body: [validCreate]}, res);

            expect(res.status.calls).toEqual(NO_CALLS);
        });

        it("should fail a bad filename", function() {

            tagger.validatePath({body: [invalidCreate]}, res);

            expect(res.status.calls[0].args[0]).toEqual(BAD_REQUEST);
        });

        it("should fail if args are not a double array", function() {

            tagger.validatePath({body: singleNestedArray}, res);

            expect(res.status.calls[0].args[0]).toEqual(BAD_REQUEST);
        });
    });
});
