## five-point-plan

API for a mapping and visualization tool to support the Red Cross 5-Point Plan to strengthen routine immunization.

### Development

- install PostgreSQL (11.2) and PostGIS (2.5.1), on OSX you can do this easily with https://postgresapp.com
- install Node.js (10.15.2)
  - suggested to install [nvm](https://github.com/creationix/nvm)
  - and run `nvm install 10.15.2` and `nvm use`
- `npm install` to install node module dependencies
- `node ./setup/dbSetup.js` to initialize database
- `node server.js` to start the app

### Production

- install PostgreSQL (11.2) and PostGIS (2.5.1)
  - create an empty database, e.g. `createdb mapping` (name should match whatever you set in `config.js` for `config.pg.database`)
- install Node.js (10.15.2)
  - suggested to install [nvm](https://github.com/creationix/nvm)
  - and run `nvm install 10.15.2` and `nvm use`
- `npm install` to install node module dependencies
- `node ./setup/dbSetup.js` to initialize database
- `nvm use default`
- install [PM2](https://github.com/Unitech/pm2) `sudo npm install pm2 -g`
  - other tools will let you keep the application up and running on your server (e.g. [Forever](https://github.com/foreverjs/forever))
- `pm2 start server.js --name="five-point-plan-api_3020" --interpreter=/home/ubuntu/.nvm/versions/node/v10.15.2/bin/node` to start the app
  - to have the app restart itself after a reboot, server downtime, etc., you can generate a startup script
  - see the [PM2 documentation](https://github.com/Unitech/pm2#startup-script-generation) on this for more details