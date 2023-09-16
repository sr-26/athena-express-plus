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
	it("should not have athena object undefined", function() {
		expect(function() {
			const athenaExpress = new AthenaExpress({});
		}).to.throw(
			TypeError,
			"athenaClient, s3Client, and s3 are required in the config object"
		);
	});
	it("should not have s3 object undefined", function() {
		expect(function() {
			const athenaExpress = new AthenaExpress({athena: new athena.Athena({})});
		}).to.throw(
			TypeError,
			"athenaClient, s3Client, and s3 are required in the config object"
		);
	});
});
