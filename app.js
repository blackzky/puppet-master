
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
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

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
    callback(null, true); // error first callback style
  });
});

io.sockets.on('connection', function (socket) {
  socket.on("add-client-app", function(data){
    var app_id = "";
    do{
      app_id = genID();
      console.log("[App] generating id: " + app_id);
    }while(app_clients[app_id]);
    socket.app_id = app_clients[app_id] = app_id;
    socket.emit("set-app-id", socket.app_id);
  });

  socket.on("add-client-browser", function(data){
    var browser_id = "";
    do{
      browser_id = genID();
      console.log("[Browser] generating id: " + browser_id);
    }while(browser_clients[browser_id]);
    socket.browser_id = browser_clients[browser_id] = browser_id;
    socket.emit("set-browser-id", socket.browser_id);
  });

  socket.on("app-to-server", function(data){
    console.log("[App] Relaying data from client-app -> server -> client-browser");
    socket.broadcast.emit("server-to-browser", data);
  });
  socket.on('browser-to-server', function (data) {
    console.log("[Browser] Relaying data from client-browser -> server -> client-app");
    socket.broadcast.emit("server-to-client-app-" + data.app_id, data);
  });
});

var genID = function () {
  return Math.random().toString(36).substr(2, 13);
};
