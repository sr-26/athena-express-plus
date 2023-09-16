"use strict";

const chai = require("chai"),
	expect = chai.expect,
	AthenaExpress = require(".."),
	athena = require("@aws-sdk/client-athena"),
	s3 = require("@aws-sdk/client-s3");

chai.should();

describe("Negative Scenarios", () => {
	it("should not have config object undefined", function() {
		expect(function() {
			new AthenaExpress();
		}).to.throw(TypeError, "Config object not present in the constructor");
	});
});
