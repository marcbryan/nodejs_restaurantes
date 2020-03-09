var express = require('express');
var app = express();
var bodyParser = require('body-parser');
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

var mongo = require('mongodb').MongoClient;
var mongoClient;
var ObjectID = require('mongodb').ObjectID;

// constantes
const PORT = process.env.PORT || 3000;
const user = encodeURIComponent( process.env.DBUSER );
const pass = encodeURIComponent( process.env.DBPASS );

var conn = 'mongodb+srv://'+user+':'+pass+'@cluster0-ccmcr.mongodb.net';

mongo.connect(conn, {useUnifiedTopology: true}, function( err, _client ) {
  if( err ) throw err;
  mongoClient = _client;
  app.listen(PORT, function () {
    console.log('Example app listening on port '+PORT+'!');
  });
});

app.get('/restaurantes', function(req, res) {
  var db = mongoClient.db('mongo');
  var options = {};
  var query = {};
  db.collection('restaurantes').find(query, options).toArray(function(err, docs) {
    if (err) {
      res.render('error', {msg:'Error en la query!'});
      return;
    }
    res.render('restaurantes', {'restaurantes':docs});
  });
});

app.get('/restaurantes/create', function(req, res) {
  res.render('newRestaurante');
});

app.post('/restaurantes/create', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var city = req.body.city;
  var zipcode = req.body.zipcode;
  var address = req.body.address;

  var rest = {name:name, email:email, phone:phone, city:city, zipcode:zipcode, address:address, coord:{lat:0.0, lon:0.0}, schedule:[], categories:[], products:[]};

  var db = mongoClient.db('mongo');
  db.collection('restaurantes').insertOne(rest, function(err, records) {
    if (err) throw err;
    console.log("Inserted: "+records.insertedCount);
    res.redirect('/restaurantes');
  });
});

app.get('/categories/create', function(req, res) {
  res.render('newCategory');
});

app.get('/restaurantes/:id/updateCategories', function(req, res) {
  var db = mongoClient.db('mongo');
  var options = {};
  var query = {_id: new ObjectID(req.params.id)};
  console.log(query);
  db.collection('restaurantes').findOne(query, options, function(err, doc) {
    if (err) {
      res.render('error', {msg:'Error en la query!'});
      return;
    }
    if (doc.length == 0) {
      res.redirect('/restaurantes');
    }
    console.log(doc.categories);
    res.render('editCategories', {categories: doc.categories});
  });
});

app.post('/restaurantes/:id/updateCategories', function(req, res) {
  var id = req.params.id;
  var db = mongoClient.db('mongo');
  console.log(req.body.category);
  db.collection('restaurantes').updateOne(
    { '_id':  new ObjectID(id) },
    { $push: {'categories':{$each: req.body.category}} }
  );
  res.redirect('/restaurantes/'+id+'/updateCategories');
});
