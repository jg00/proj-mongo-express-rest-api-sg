const assert = require("assert");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");

const Driver = mongoose.model("driver"); // See notes below. This is more of a 'direct' access to the driver model vs require() method.

describe("Drivers controller", () => {
  it("Post to /api/drivers creates a new driver", (done) => {
    // Count Before/After Test Approach
    Driver.countDocuments().then((count) => {
      request(app)
        .post("/api/drivers")
        .send({ email: "test@test.com" })
        .end((err, response) => {
          // Count After
          Driver.countDocuments().then((newCount) => {
            assert(count + 1 === newCount);
            done();
          });
        });
    });
  });

  it("PUT to /api/dirvers/id edits and existing driver", (done) => {
    // Create driver, edit driver, get driver to assert
    const driver = new Driver({ email: "t@t.com", driving: false });

    driver.save().then((result) => {
      request(app)
        .put(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end((err, response) => {
          Driver.findOne({ email: "t@t.com" }).then((driver) => {
            assert(driver.driving === true);
            done();
          });
        });
    });
  });

  it("DELETE to /api/drivers/id can delete a driver", (done) => {
    // Create user, delete user, confirm driver no longer exists
    const driver = new Driver({ email: "del@del.com" });

    driver.save().then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .end((err, response) => {
          Driver.findOne({ email: "del@del.com" }).then((driver) => {
            assert(driver === null);
            done();
          });
        });
    });
  });

  it("GET to /api/drivers finds drivers in a location", (done) => {
    const seattleDriver = new Driver({
      email: "seattle@test.com",
      geometry: { type: "Point", coordinates: [-122.335167, 47.608013] },
    });

    const miamiDriver = new Driver({
      email: "miami@test.com",
      geometry: { type: "Point", coordinates: [-80.191788, 25.761681] },
    });

    Promise.all([seattleDriver.save(), miamiDriver.save()]).then(() => {
      request(app)
        .get(`/api/drivers?lng=-80&lat=25`)
        .end((err, response) => {
          console.log(response.body[0]);
          console.log(
            `-- Found a driver at a distance of ${response.body[0].dist.calculated} meters --`
          );
          assert(response.body.length === 1);
          assert(response.body[0].email === "miami@test.com");
          done();
        });
    });
  });
});

/*
  // 1 Configuration options
     request(app) <-- Send request to you express application 'app'
      .post('/api/drivers') <-- configuration option
      .send({email: 'test@test.com'}) <-- means send along data with the request 
              (not a res.send() http response).  .send() is a configuration option

  // 2 Possible tests/assertions we could make to make sure the request was issued correctly and received by the server
  1 Look at response object we get back (ie .end(err,response)) after the request was completed and 
    maybe we will assume that the resonse contains the driver that was just created
  2 Look inside of our drivers collection and then assert that a driver with the specific email exists
  3 Look at the number of drivers inside of our drivers collection before and after and compare


  // 3 const Driver = mongoose.model("driver"); 
  Why are directly accessing the driver model instead of requiring in? This is more of 
  a work around applied only because Express, Mocha, Mongoose do not always work well together 
  inside of a test environment. Issue is Mocha tends to require in files more than one time
  which means the driver model tend to be required in more than one time and results in an error
  stating that a driver model has already been declared.

  // 4 Side gotcha: MissingSchemaError: Schema hasn't been registered for model "driver".
  - We do have the driver model (modesl/driver.js) created but nowhere have we required it yet into our project.
  - Note: It is common in a Node application where you may have some files and define code "but they dont
  necessarily export anything that you immediately need to make access to".
  - Fix: In that case you need to require it in at least one location just to make sure the code inside of it is actually executed.
  - Added const Driver = require("../models/driver"); to controllers/drivers_controller.js to make the error
  inside of our test file here to go away.
*/
