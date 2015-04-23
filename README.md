mock4Organizer-UI
==========

mockserver for Organizer-UI.

Setup
--------------

requirements

* LINUX or MacOS X
* git
* node.js v0.12.X
* npm


for developer
-------------------

run mockserver.

```
 % node ./bin/www
 or
 % DEBUG=* node ./bin/www
 access http://localhost:3000/ldssearch?q=""
```

DEBUG options

* `app` - ./bin/www

logfiles are stored in `./logs/` directory.

options
------------------
* `PORT` - port of mockserver. default setting is `3000`.
