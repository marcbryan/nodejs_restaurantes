var express = require('express');
var app = express();
var bodyParser = require('body-parser');
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

var mongo = require('mongodb').MongoClient;
var mongoClient;

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
  var address = req.body.address;
  var phone = req.body.phone;
  var email = req.body.email;
  var zipcode = req.body.zipcode;

  var rest = {name:name, address:address, phone:phone, email:email, zipcode:zipcode};

  var db = mongoClient.db('mongo');
  db.collection('restaurantes').insertOne(rest, function(err, records) {
    if (err) throw err;
    console.log("Inserted: "+records.insertedCount);
    res.send('ok');
  });
});
