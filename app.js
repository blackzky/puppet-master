
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server)
http.createServer(app);

var browser_clients = {};
var app_clients = {};

io.sockets.on('connection', function (socket) {
  socket.on("add-client-browser", function(data){
    var browser = "browser-" + data;
    if(!browser_clients[browser]){
      socket.browser = browser_clients[browser] = browser;
      console.log(browser + " has connected!");
    }
  });
  socket.on("add-client-app", function(data){
    var app = "app-" + data;
    if(!browser_clients[app]){
      socket.app = app_clients[app] = app;
      console.log(app + " has connected!");
    }
  });

  socket.on("client-app-to-server-" + socket.app, function(data){
    console.log("Relaying data from client-app -> server -> client-browser");
    //@todo -add a specific client distination
    socket.emit("server-to-client-browser-" + socket.browser, data);
  });
  socket.on('client-browser-to-server-' + socket.browser, function (data) {
    console.log("Relaying data from client-browser -> server -> client-app");
    //@todo -add a specific client distination
    socket.emit("server-to-client-app-" + socket.app, data);
  });
});

