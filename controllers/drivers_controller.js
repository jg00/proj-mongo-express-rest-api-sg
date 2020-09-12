const Driver = require("../models/driver");

module.exports = {
  greeting(req, res) {
    res.send({ hi: "there" });
  },

  index(req, res, next) {
    const { lng, lat } = req.query;

    // Provided a point find drivers within 200km or 200,000m
    Driver.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "dist.calculated",
          maxDistance: 200000,
          spherical: true,
        },
      },
    ])
      .then((drivers) => {
        res.send(drivers);
      })
      .catch(next);
  },

  create(req, res, next) {
    const driverProps = req.body;

    Driver.create(driverProps)
      .then((driver) => res.send(driver))
      .catch(next);
  },

  edit(req, res, next) {
    const driverId = req.params.id;
    const driverProps = req.body;

    Driver.findByIdAndUpdate({ _id: driverId }, driverProps)
      .then(() => Driver.findById({ _id: driverId }))
      .then((driver) => res.send(driver))
      .catch(next);
  },

  delete(req, res, next) {
    const driverId = req.params.id;

    Driver.findByIdAndDelete({ _id: driverId })
      .then((driver) => res.status(204).send(driver))
      .catch(next);
  },
};

/*
  1 Create using Model Instance vs Model Class
  create(req, res) {
    const driverProps = req.body;

    Driver.create(driverProps).then((driver) => {
      return res.send(driver);
    });

    // const driver = new Driver(driverProps);
    // driver.save().then((driver) => res.send(driver));
  },

  2 Express documentation
  Since promises automatically catch both synchronous errors and rejected promises, 
  you can simply provide next as the final catch handler and Express will catch errors, 
  because the catch handler is given the error as the first argument.

  create(req, res, next) {
      const driverProps = req.body;

      Driver.create(driverProps)
        .then((driver) => res.send(driver))
        .catch(next); // Approach to catch database operation errors and passed on to Express and handled via our custom middleware at the app level.
    },

  3 Note on Driver.findByIdAndUpdate({ _id: driverId }, driverProps)
  returns some object that give statistics on objects updated and not the expected driver that was updated.

  4 Note a GeoJSON point is an {} object that has a type and coordinate property.

  5 .geoNear() deprecated
    index(req, res, next) {
      const { lng, lat } = req.query; // User's position

    Driver.geoNear(
      { type: "Point", coordinates: [lng, lat] },
      { spherical: true, maxDistance: 200000 } // 200000m or 200km
    )
      .then((drivers) => {
        res.send(drivers);
      })
      .catch(next);
    },
*/
