const frontendURL = "http://localhost:3000/";

const express = require("express");
const checksum_lib = require("../paytm/checksum");
const https = require("https");
const qs = require("querystring");
const db = require("../models");
const config = require("../config");

const app = express();

const success = async (req, res) => {
  try {
    var body = "";

    req.on("data", function (data) {
      body += data;
    });

    req.on("end", async function () {
      var html = "";
      var post_data = qs.parse(body);

      const donation = await db.Donation.findOne({
        _id: post_data.ORDERID,
      });

      if (!donation) {
        return res.send("Transaction Failed, Please retry!!");
      }

      donation.transactionID = post_data.TXNID;

      if (post_data.RESPCODE == "01") {
        var params = post_data;
        var checkSumHash = params.CHECKSUMHASH;
        delete params.CHECKSUMHASH;
        var result = checksum_lib.verifychecksum(
          params,
          config.PaytmConfig.key,
          checkSumHash
        );


        if (result) {
          checksum_lib.genchecksum(
            params,
            config.PaytmConfig.key,
            function (err, checksum) {
              params.CHECKSUMHASH = checksum;
              post_data = "JsonData=" + JSON.stringify(params);

              var options = {
                hostname: "securegw-stage.paytm.in", 
                port: 443,
                path: "/merchant-status/getTxnStatus",
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Content-Length": post_data.length,
                },
              };

              var response = "";
              var post_req = https.request(options, async function (post_res) {
                post_res.on("data", function (chunk) {
                  response += chunk;
                });

                post_res.on("end", async function () {

                  var _result = JSON.parse(response);
                  if (
                    _result.STATUS == "TXN_SUCCESS" &&
                    _result.TXNAMOUNT == params.TXNAMOUNT &&
                    _result.ORDERID == params.ORDERID
                  ) {
                    donation.transactionComplete = true;

                    const campaign = await db.Campaign.findById(
                      donation.campaign
                    );

                    const donationId = donation._id;
                    const campaignId = campaign._id;

                    var details = {
                      transactionID: donation.transactionID,
                      donationAmount: donation.amount,
                    };

                    campaign.donors.push(details);
                    campaign.donorsNum = campaign.donorsNum + 1;
                    campaign.raised = campaign.raised + donation.amount;
                    await campaign.save();
                    await donation.save();

                    res
                      .status(200)
                      .redirect(frontendURL + "donation/success/" + donationId);
                  } else {
                    await donation.save();
                    console.log("Payment Failed");
                    res.status(400).redirect(frontendURL + "donation/failure");
                  }
                });
              });

              // post the data
              post_req.write(post_data);
              post_req.end();
            }
          );
        } else {
          await donation.save();
          console.log("Payment Failed");
          res.status(400).redirect(frontendURL + "donation/failure");
        }
      } else {
        await donation.save();
        console.log("Payment Failed");
        res.status(400).redirect(frontendURL + "donation/failure");
      }
    });
  } catch (err) {
    console.log("Server error.");
    res.status(500).json({
      message: "Server error. Sorry from our end.",
    });
  }
};

module.exports = {
  success,
};
