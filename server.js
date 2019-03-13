var express = require('express')
var localConfig = require('./config')

var PostGresHelper = require('./routes/PostGresHelper.js')
var pghelper = new PostGresHelper()

var app = express()

var api = express.Router()

api.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
});

api.get('/data', function(req, res) {
  var sql = "SELECT * FROM data.surveys"
  pghelper.query(sql, function(err, results) {
    res.send(results) 
  })
})

api.get('/geojson', function(req, res) {
  var sql = "SELECT * FROM data.surveys"
  pghelper.query(sql, function(err, results) {
    res.send(results) 
  })
})

app.use('/api', api)


app.listen(localConfig.app.port, function() {
  console.log('Listening on port ' + localConfig.app.port);
});