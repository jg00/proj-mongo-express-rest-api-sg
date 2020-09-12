const assert = require("assert");
const request = require("supertest");
const app = require("../app");

describe("The express app", () => {
  it("handles a GET request to /api", (done) => {
    request(app)
      .get("/api")
      .end((err, response) => {
        assert(response.body.hi === "there");
        done();
      });
  });
});

/*
  // 1 .end(err,..)
  err does not refer to status code. It refers to any errors with the test request above. 
 */
