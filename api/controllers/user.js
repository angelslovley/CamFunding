const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models");
require("dotenv").config();

db.User.find().exec(function (err, results) {
  var count = results.length;

  if (count == 0) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err)
        return res
          .status(400)
          .json({ message: "Something went wrong, try again" });
      bcrypt.hash("abc", salt, (err, hash) => {
        if (err)
          return res
            .status(400)
            .json({ message: "Something went wrong, try again" });

        const user = new db.User({
          email: "imt_2018109@iiitm.ac.in",
          password: hash,
          isVerified: true,
        });

        user.save();
      });
    });
  }
});

//-------------------------------------------------------------------------------------------------------
// Validating email address and domain
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(email)) {
    if (
      email.indexOf("@iiitm.ac.in", email.length - "@iiitm.ac.in".length) !== -1
    ) {
      return true;
    }
  }
  return false;
}
//-------------------------------------------------------------------------------------------------------

const addAdmin = (req, res) => {
  const userData = req.body;
  if (!userData.email || !userData.password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.User.findOne({ email: userData.email }, (err, foundUser) => {
    if (err) return res.status(400).json({ message: "Bad request, try again" });

    if (!validateEmail(userData.email))
      return res.status(400).json({
        message: "You can only add admins having email of iiitm.ac.in domain",
      });

    if (foundUser)
      return res.status(400).json({
        message: "Email is already been registered.",
      });

    bcrypt.genSalt(10, (err, salt) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Something went wrong, try again" });
      bcrypt.hash(userData.password, salt, (err, hash) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Something went wrong, try again" });

        const { email, password } = req.body;
        const newUser = {
          email: email,
          password: hash,
        };

        db.User.create(newUser, (err, createdUser) => {
          if (err)
            return res.status(500).json({
              message: "Something went wrong, Please try again",
            });
          jwt.sign(
            { foo: createdUser._id },
            `${"${process.env.JWT_SECRET}"}`,
            { expiresIn: "10h" },
            (err, jwt) => {
              if (err)
                return res.status(403).json({
                  message: "Access forbidden",
                });
              if (`${process.env.NODE_ENV}` == "prod") {
              } else {
                res.status(200).json({
                  message: "Admin added successfully.",
                });
              }
            }
          );
        });

       
      });
    });
  });
};

const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Please enter both your email and password",
    });
  }
  db.User.findOne({ email: req.body.email }, (err, foundUser) => {
    if (err)
      return res.status(500).json({
        message: "Something went wrong. Please try again",
      });

    if (!validateEmail(req.body.email))
      return res.status(400).json({
        message: "Please login with email of iiitm.ac.in domain",
      });

    if (!foundUser) {
      return res.status(400).json({
        message:
          "Email address is not associated with any account. Please check and try again",
      });
    }

    bcrypt.compare(req.body.password, foundUser.password, (err, isMatch) => {
      if (err)
        return res.status(500).json({
          message: "Something went wrong. Please try again",
        });

      if (isMatch) {
        /* jwt */
        jwt.sign(
          { foo: foundUser._id, email: foundUser.email },

          `${process.env.JWT_SECRET}`,
          { expiresIn: "10h" },
          (err, jwt) => {
            if (err)
              return res.status(403).json({
                message: "Access Forbidden",
              });
            res.status(200).json({ jwt, userId: foundUser._id });
          }
        );
      } else {
        return res.status(400).json({
          message: "Email or Password is not correct.",
        });
      }
    });
  });
};


const create = async (req, res) => {
  const campaign = { ...req.body, raised: 0 };

  if (!campaign.title || !campaign.description || !campaign.subTitle) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (campaign.required <= 0) {
    return res.status(400).json({
      message: "The required amount cannot be equal to or smaller than 0",
    });
  }

  try {
    const newCampaign = await db.Campaign.create(campaign);

    res.status(200).json(newCampaign);
  } catch (err) {
    console.log("Server error.");
    return res.status(500).json({
      message: "Something went wrong when creating a new campaign",
    });
  }
};
//-------------------------------------------------------------------------------------------------------

const options = {
  new: true,
  upsert: true,
  setDefaultsOnInsert: true,
};

const update = async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      let updatedCampaign = await db.Campaign.findByIdAndUpdate(
        req.params.id,
        req.body,
        options
      );
      res.status(200).json(updatedCampaign);
    } else {
      res.status(404).json({
        message: "No such campaign exists.",
      });
    }
  } catch (err) {
    console.log("Server error.");
    return res.status(500).json({
      message: "Something went wrong while updating campaign. Try again.",
    });
  }
};
//-------------------------------------------------------------------------------------------------------

const deleteCampaign = async (req, res) => {
  try {
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      db.Campaign.findByIdAndRemove(req.params.id, (err, success) => {
        if (err) {
          return res.status(500).json({
            message: "Something went wrong while deleting campaign. Try again.",
          });
        }

        return res.status(200).json({
          message: "Successfully deleted the campaign.",
        });
      });
    } else {
      res.status(404).json({
        message: "No such campaign exists.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong while deleting campaign. Try again.",
    });
  }
};

//-------------------------------------------------------------------------------------------------------
module.exports = {
  addAdmin,
  login,
  create,
  update,
  deleteCampaign,
};
