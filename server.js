var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;
var url = process.env.MONGOLAB_URI;
var validUrl = require("valid-url");
var shortid = require('shortid');

app.use(express.static('public'));
app.use(express.static('views'));

app.get('/new/:que(*)', function(req, res){
  mongo.connect(url, function(err, db){
    if(err){
      console.error(err);
    }
    else{
      var col = db.collection("urls");
      var q = req.params.que;
      
      var newLink = function(db,callback){
        col.findOne({"original_url": q}, {short_url: 1, _id: 0}, function(err, doc){
          if(doc!=null){
          res.json({original_url: q, short_url: "same-flock.glitch.me/"+doc.short_url})  
          }
          else{
            if(validUrl.isUri(q)){
            var short = shortid.generate();
            var newLink = {original_url: q, short_url: short};
            col.insert([newLink]);
            res.json({original_url: q, short_url: "same-flock.glitch.me/"+short});
          }
        else{
          res.json({error: "Wrong url type. Please enter a valid url"});
          }
         };
        });
      };
      newLink(db, function(){
        db.close();
      });
    }
  });
});


app.get("/:short", function(req, res){
  mongo.connect(url, function(err, db){
    var col = db.collection("urls");
    var s = req.params.short;
    var findLink = function(db, callback){
      col.findOne({"short_url":s},{original_url: 1, _id: 0}, function(err, doc){
        if(doc!=null){
          res.redirect(doc.original_url);
        }
        else{
          res.send("No such link found in database");
        }
      });
    };
    findLink(db, function(){
      db.close();
    });
  });
});
app.listen(3000);