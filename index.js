var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var NanoTimer = require('nanotimer');
var fs = require('fs');

class Player {
  constructor(username) {
      this.username = username;
  }
}

var players = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    // Remove the player from our global player list.
    if (socket.player) {
      console.log("Player " + socket.player.username + " logged off.");
      delete players[socket.player.username];
    }
  });

  socket.on('chat message', function(msg) {
    var parts = msg.split(/\s+/);

    var cmd = parts[0];
    
    if (cmd === 'login') {
        username = parts[1];
        password = parts[2];

        if (!username || !password) {
            socket.emit('text', 'You must specify a username and password.');
            return;
        }

        fs.readFile('accounts.json', 'utf8', function (err, data) {
            if (err) throw err;
            var obj = JSON.parse(data);
            
            var found = false;
            obj.accounts.forEach(user => {
                if (user.username === username && user.password === password) {
                  socket.emit('text', 'Welcome to the server ' + username + '!');
                  found = true;

                  // Add the player to our global player list and store a reference
                  // to their data on the socket.
                  var newPlayerData = new Player(username);
                  players[username] = newPlayerData;
                  socket.player = newPlayerData;

                  console.log("Player " + username + " logged on.");

                  return;
                }
            });

            if (!found) {
              socket.emit('text', 'Failed to login. Please try again.');
            }
          });
    }
  });

  socket.emit('text', 'Welcome to the server. Type login <username> <password> to login.');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var timer = new NanoTimer();

function gameLoop() {
}

timer.setInterval(gameLoop, '', '1000m');

