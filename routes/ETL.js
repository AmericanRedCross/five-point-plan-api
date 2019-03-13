const async = require('async')
const localConfig = require('../config')
const request = require('request')
const moment = require('moment-timezone')

const PostGresHelper = require('../routes/PostGresHelper.js')
const pghelper = new PostGresHelper()


async.waterfall([
  function(cb) {  
    // check our database for the submission time of the most recently submitted survey  
    var sql = "SELECT MAX(submissiontime) FROM data.surveys";
    pghelper.query(sql, cb)
  },
  function(result, cb) {
    // try convert the MAX(submissiontime) result to a string, for example `2019-03-13T16:11:15.000Z`
    var maxTime = moment(result[0].max).toISOString() 
    // set the format of the data from the KoBo server to JSON
    var qs = {'format':'json'} 
    // until the app has injested some data, the MAX(submissiontime) query wont return a valid timestamp
    // when it returns a valid timestamp we want to add a time-based query filter to our KoBo API request
    if((new Date(maxTime)).getTime()>0) {
      qs.query = '{"_submission_time":{"$gt":"' + maxTime + '"}}'
    }
    // make a data request to the KoBo server
    request({
      method: 'GET',
      qs: qs,
      uri: localConfig.kobo.server + '/api/v1/data/' + localConfig.kobo.form.formId,
      headers: { 'Authorization': 'Token ' + localConfig.kobo.token }
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var jsonResponse = JSON.parse(body);
        // pass the result to the next function in the async.waterfall
        cb(null, jsonResponse)
      } else {
        // if the request returns an error the async.waterfall should jump to the main callback
        cb(error, response);
      }
    });
  },
  function(result, cb) {
    var formData = result;
    // check that there is data to process
    if(formData.length > 0) {
      // formData is an array of survey responses
      // we want to proces each one and INSERT into the app's PostgreSQL database
      // documentation on async.each is here: http://caolan.github.io/async/docs.html#each
      async.eachLimit(formData, 1, function(survey, callback) { 
        if( survey['_geolocation'] === undefined ) {
          // ... TODO: deal gracefully with surveys that dont have a location
        } else {
          // ... TODO: reduce coordinate accuracy and reduce overlap
          // build the SQL query to insert survey into app database
          var customFields = ""
          var fieldData = ""
          // use settings from config.js file to build SQL for the adaptable part of the data
          localConfig.kobo.form.fields.forEach(function(item,index) {
            customFields += item.name + ","
            fieldData += "'" + survey[item.formKey] + "',"
          })    
          var sql = "INSERT INTO data.surveys (" + customFields + "formid,uuid,submissiontime,geom) VALUES (" +
            fieldData +
            "'" + localConfig.kobo.form.formId + "'," +
            "'" + survey['_uuid'] + "'," +
            // KoBo appear to return `_submission_time` in UTC 
            // but without the indicative text, for example '2019-03-13T16:11:15'
            // we use `moment` to explicitly format the string as denoting UTC, for example '2019-03-13T16:11:15.000Z'
            // so that PostgreSQL doesn't think the string is in the timezone of the server running this app 
            "'" + moment.tz(survey['_submission_time'], "UTC").format() + "'," + 
            "ST_GeomFromGeoJSON('{" +
            '"type":"Point","coordinates":' +
            JSON.stringify(survey['_geolocation']) + "," +
            '"crs":{"type":"name","properties":{"name":"EPSG:4326"}}}' + "'));";
          console.log("SQL: ", sql)
          // if a pghelper.query throws an err, async.each should skip to the final callback and pass the error
          pghelper.query(sql, callback)
        }
      }, function(err) { // final callback when each is finished or an err is thrown
        // if any of the file processing produced an error, err would equal that error
        if(err) {
          console.log('A survey submission failed to process.')
          console.log(err)
        } else {
          // move to the next step in the async.waterfall
          cb(null, 'All new survey submissions have been processed successfully.')
        }
      });
    } else {
      // the array of formData has length 0, there is no data to process
      // move to the next step in the async.waterfall
      cb(null, 'There were no new survey submissions to process.') 
    }

  },
  function(message, cb) {
    console.log(message)
    // ... TODO
    cb(null, 'Reached the end.')

  }],
  // main callback for when each async.waterfall step is finished or an error is thrown
  function(err, result){
    if(err) {
      // ... TODO
    } else {
      // ... TODO
      console.log(result);
    }
  }
)