const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const VerifyToken = require("../controllers/AuthController").verifyToken;
const VerifySupperAdminToken = require("../controllers/AuthController").verifySupperAdminToken;
const VerifyAdminToken =
  require("../controllers/AuthController").verifyAdminToken;

let User = require("../models/user.model");

//register User
router.route("/register").post(async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;
  const rol = req.body.rol;

  //check if email exist
  let user = await User.findOne({ email: email });
  if (user) {
    //status 200
    return res.status(400).send("user already registered");
  }

  bcrypt.hash(password, 10, function (err, hashedPass) {
    if (err) {
      res.json({
        error: err,
      });
    }
    if (hashedPass) {
      //else add new user
      const newUser = new User({
        name,
        password: hashedPass,
        email,
        rol
      });

      newUser
        .save()
        .then(() => {
          const token = jwt.sign(
            { id: newUser.id, name: newUser.name, email: newUser.email, rol: rol },
            "verySecretValue",
            { expiresIn: "24h" }
          );
          const response = {
            token: token,
            user: newUser,
          };

          res.send(response);
        })
        .catch((err) => res.status(400).send(err));
    }
  });
});


router.post(
  "/registerAdmin",
  VerifyAdminToken,
  async function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const rol = "user";

    //check if email exist
    let user = await User.findOne({ email: email });
    if (user) {
      //status 200
      return res.status(400).send("user already registered");
    }

    bcrypt.hash(password, 10, function (err, hashedPass) {
      if (err) {
        res.json({
          error: err,
        });
      }
      if (hashedPass) {
        //else add new user
        const newUser = new User({
          name,
          password: hashedPass,
          email,
          rol
        });

        newUser
          .save()
          .then(() => {
            const token = jwt.sign(
              { id: newUser.id, name: newUser.name, email: newUser.email, rol: rol },
              "verySecretValue",
              { expiresIn: "24h" }
            );
            const response = {
              token: token,
              user: newUser,
            };

            res.send(response);
          })
          .catch((err) => res.status(400).send(err));
      }
    });
  }
);

router.post(
  "/registerSupperAdmin",
  VerifySupperAdminToken,
  async function (req, res) {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const rol = req.body.rol;

    //check if email exist
    let user = await User.findOne({ email: email });
    if (user) {
      //status 200
      return res.status(400).send("user already registered");
    }

    bcrypt.hash(password, 10, function (err, hashedPass) {
      if (err) {
        res.json({
          error: err,
        });
      }
      if (hashedPass) {
        //else add new user
        const newUser = new User({
          name,
          password: hashedPass,
          email,
          rol
        });

        newUser
          .save()
          .then(() => {
            const token = jwt.sign(
              { id: newUser.id, name: newUser.name, email: newUser.email, rol: rol },
              "verySecretValue",
              { expiresIn: "24h" }
            );
            const response = {
              token: token,
              user: newUser,
            };

            res.send(response);
          })
          .catch((err) => res.status(400).send(err));
      }
    });
  }
);



//login User
router.route("/login").post(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, function (err, hashedPass) {
          if (err) {
            res.json({
              error: err,
            });
          }
          if (hashedPass) {
            let token = null;
            if (user.rol) {
              token = jwt.sign(
                {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  rol: user.rol,
                },
                "verySecretValue",
                { expiresIn: "24h" }
              );
            }

            const response = {
              token: token,
              user: user,
            };
            res.send(response);
          } else {
            res.status(401).send("Bad login");
          }
        });
      } else {
        res.status(401).send("Bad login");
      }
    });
});

//la tchuf eza ltoken ba3do sale7 aw la2
router.get("/me", VerifyToken, function (req, res, next) {
  User.findById(req.decoded.id, function (err, user) {
    if (err)
      return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");

    res.status(200).send(user);
  });
});

module.exports = router;
