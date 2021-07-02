require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyPaser = require("body-parser");
const mongoDB = require("mongodb");
const mongoose = require("mongoose");
const app = express();
const { Schema } = mongoose;
const uri = `${process.env.DB_URI}`;
console.log(typeof uri, uri);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Basic Configuration
const port = process.env.PORT || 5000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});
//body-parser encoding
app.use(bodyPaser.urlencoded({ extended: true }));

// generating Schema
let urlSchema = new Schema({
  _id: { type: String },
  link: "",
  created_at: ""
});
//generating Model
const URL = mongoose.model("URL", urlSchema);

//Handling Post Request

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  
  let urlRegex =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    console.log(urlRegex.test(url));

    if (!urlRegex.test(url)) {
      res.json({ error: "invalid URL" });
    } else {
      URL.findOne({link : url}, (err, doc)=>{
        if(err) throw err;
        if(doc){
          console.log("URL found in DB");
          res.json({
            original_url: url,
            short_url: doc._id
          });
        }else{
          console.log("link NOT found in db, adding new link");
          let id = makeid();
          let url1 = new URL({
            _id: id,
            link: url,
            created_at: new Date()
          });
          url1.save(err, doc => {
            if (err) return console.error("Error: ", err);
            console.log(doc);
            res.json({
              original_url: url,
              short_url: url1._id
            });
          });
        }
      })
    }
  });
  function makeid() {
    //makes a random shortened ID
    let randomText = "";
    //make alphanumeric
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (let i = 0; i < 5; i++) {
      randomText += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return randomText;
  }

  app.get("/api/shorturl/:id?", (req, res) => {
    let id = req.params.id;
    URL.findOne({ _id: id }, (err, doc) => {
      if (doc) {
        res.redirect(doc.link);
      } else {
        res.redirect("/");
      }
    });
  });
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
