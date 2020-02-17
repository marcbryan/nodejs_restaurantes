var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

var mongo = require('mongodb').MongoClient;
var mongoClient;

// connexió a mongo i start app
mongo.connect('mongodb://localhost:27017', {useUnifiedTopology: true}, function( err, _client ) {
  // si no ens podem connectar, sortim
  if( err ) throw err;
  mongoClient = _client;
  // si no hi ha cap error de connexió, engeguem el servidor
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });
});

app.get('/restaurantes', function(req, res) {
  var db = mongoClient.db('restaurantes');
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

app.get('/new/restaurante', function(req, res) {
  res.render('newRestaurante');
});

app.post('/new/restaurante', function(req, res) {
  var rest = new Object();
  rest.name = req.body.name;
  rest.address = req.body.address;
  rest.phone = req.body.phone;
  rest.email = req.body.email;
  rest.zipcode = req.body.zipcode;

  //var rest = {name}

  var db = mongoClient.db('restaurantes');
  db.collection('restaurantes').insertOne(rest, function(err, records) {
    if (err) throw err;
    console.log("Record added as "+records[0]);//._id);
    res.send('ok');
  });
});
