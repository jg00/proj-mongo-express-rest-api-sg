const mongoose = require("mongoose");

before((done) => {
  mongoose.connect("mongodb://localhost/muber_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  mongoose.connection
    .once("open", () => done())
    .on("error", (err) => console.warn("Warning", error));
});

beforeEach((done) => {
  const { drivers } = mongoose.connection.collections;
  drivers
    .drop() // Remember indexes are dropped as well
    .then(() => drivers.createIndexes({ "geometry.coordinates": "2dsphere" })) // fix test scenario where collection is dropped along with indexes - "no geo indices for geoNear"
    .then(() => done())
    .catch(() => done()); // handle very first time our test suite runs with this new database and drivers collection currently do not exists
});

/*
  1 Note that we are placing the test database .connection here explicitly because we only get
  access to done() callback inside of our test helper world.  This was we run test only after
  the connection has been established.
*/
