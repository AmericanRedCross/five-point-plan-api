const async = require('async')
const localConfig = require('../config')

var PostGresHelper = require("../routes/PostGresHelper.js")
var pghelper = new PostGresHelper()


async.waterfall([
  function(cb) {
    var sql = "CREATE EXTENSION postgis"
    pghelper.query(sql, cb)
  },
  function(result, cb) {
    console.log("result: ", result)
    var sql = "CREATE EXTENSION postgis_topology"
    pghelper.query(sql, cb)
  },
  function(result, cb) {
    console.log("result: ", result)
    var sql = "CREATE SCHEMA data"
    pghelper.query(sql, cb)
  },
  function(result, cb) {
    console.log("result: ", result)
    var customFields = ""
    localConfig.kobo.form.fields.forEach(function(item, index) {
      customFields += item.name + " " + item.sqlType + ", ";
    })
    var sql = "CREATE TABLE data.surveys " +
      "( " +
        "id serial primary key, " +
        customFields +
        "formid text," +
        "uuid text, " +
        // for timestamptz postgresql stores time in UTC, 
        // an input value that has an explicit time zone specified 
        // is converted to UTC using the appropriate offset for that time zone
        // a lot of detail on timestamp and timezones: https://phili.pe/posts/timestamps-and-time-zones-in-postgresql/
        "submissiontime timestamptz" +
      ")" 
    pghelper.query(sql, cb)
    
  },
  function(result, cb) {
    console.log("result: ", result)
    var sql = "SELECT AddGeometryColumn('data','surveys','geom',4326,'POINT',2)"
    pghelper.query(sql, cb)
    
  }],
  // main callback
  function(err, result){
    console.log("err: ", err)
    console.log("result: ", result)
  }
)
