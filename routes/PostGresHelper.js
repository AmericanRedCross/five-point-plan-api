const localConfig = require("../config.js")
const { Pool } = require('pg')

var PostGresHelper = function() {

  this.pool = new Pool({
    user: localConfig.pg.user,
    host: localConfig.pg.server,
    database: localConfig.pg.database,
    password: localConfig.pg.password,
    port: localConfig.pg.port
  })
  
  // the pool with emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  this.pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

};

PostGresHelper.prototype.query = function(queryStr, cb) {
  
  console.log("about to run: ", queryStr)
  // checkout a client
  this.pool.connect((err, client, done) => {
    if (err) throw err
    client.query(queryStr, (err, res) => {
      done()

      if (err) {
        console.log(err.stack)
      }
      
      cb(err, (res && res.rows ? res.rows : res))
    })
  })
  
}

module.exports = PostGresHelper;