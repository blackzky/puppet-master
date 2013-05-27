$(function(){
    var socket = io.connect(window.location, 5000);
    socket.on('connect', function () {
      socket.emit("add-client-browser", "browser");

      var client_bid = document.querySelector("#client_bid").value;
      socket.on("set-browser-id", function(data){
        document.querySelector("#client_bid").value = data;
      });
      socket.on('server-to-browser', function (data) {
        var client_bid = document.querySelector("#client_bid").value;
        if(client_bid == data.bid && data.response != ""){
          if(typeof(data.response) != 'undefined'){
            data.response = data.response.replace(/\n/g, '<br />');
            document.querySelector("#response").innerHTML = data.response;
          }else{
            document.querySelector("#response").innerHTML = "Command is either invalid or has no response";
          }
        }
      });
    });
    document.addEventListener('keydown', function(event) {
      var command = document.querySelector("#command").value;
      var bid = document.querySelector("#client_bid").value;
      var app_id = document.querySelector("#client_aid").value;
      if(event.keyCode == 13) {
        socket.emit('browser-to-server', {bid: bid, app_id: app_id, command: command});
        document.querySelector("#command").value = "";
      }
    });

});
