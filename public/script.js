$(document).ready(function() {
    
    var socket = io.connect('http://' + window.location.host);
    
    
    /*socket.on('change-home-team-score', function (data) {
        alert('click!');
        alert(data);
        $('#home-team-score').html(data.score);
    });   
    socket.on('change-away-team-score', function (data) {
        alert('AAA');


        $('#away-team-score').html(data.score);
    }); */

    socket.on('change-home-team-timeouts', function (data) {
        var value = $('#home-team-timeouts').html();
        if (data.direction == 'up') {
            value = parseInt(value) + 1;
        } else if (value != 0) {
            value = parseInt(value) - 1;
        }
        $('#home-team-timeouts').html(value);
    });   
    socket.on('change-away-team-timeouts', function (data) {
        var value = $('#away-team-timeouts').html();
        if (data.direction == 'up') {
            value = parseInt(value) + 1;
        } else if (value != 0) {
            value = parseInt(value) - 1;
        }
        $('#away-team-timeouts').html(value);
    }); 

    socket.on('change-quarter', function (data) {
        var value = $('#quarter-number').html();
        if (data.direction == 'up') {
            if (value != 4) 
                value = parseInt(value) + 1;
        } else if (value != 1) {
            value = parseInt(value) - 1;
        }
        $('#quarter-number').html(value);
    }); 

    socket.on('change-down', function (data) {
        if (typeof(data.value) !== 'undefined') {
            $('#down-counter').html(data.value);
            return true;   
        } else {
            var value = $('#down-counter').html();
            if (data.direction == 'up') {
                if (value == 4)
                    value = 1;
                else
                    value = parseInt(value) + 1;
            } else if (value != 1) {
                value = parseInt(value) - 1;
            }
            $('#down-counter').html(value);    
        }
    }); 

    socket.on('playclock-reset', function (data) {
        var a = $('#playclock-timer').html(data.value);
        if (data.mode == 'play') {
            if (PlayClock.running) {
                PlayClock.pause();
            } else {
                PlayClock.start();    
            }
        } else if (data.mode == 'restart') {
            PlayClock.restart(data.value);
        }
    }); 
    socket.on('gameclock-update', function (data) {
        //$('#playclock-timer').html(data.value);
        if (data.mode == 'play') {
            if (GameClock.running) {
                GameClock.pause();
            } else {
                GameClock.start();    
            }
        } else if (data.mode == 'restart') {
            //self.totalSeconds = parseInt(data.min) * 60 + parseInt(data.sec);
            GameClock.restart(data.min, data.sec, data.seconds);
        } else if (data.mode == 'add-min') {
            GameClock.addMin();
        } else if (data.mode == 'subtract-min') {
            GameClock.subtractMin();
        }
    });  

    /*
    * BY JULIUS
    */
   socket.on('gol-local', function (data){
        var value  = parseInt($('#home-team-score').html()) +1;
        if(value>=0){
            $('#home-team-score').html(value);
        }
    });
      socket.on('restar-gol-local', function (data){
        var value  = parseInt($('#home-team-score').html()) -1;
        if(value >=0){
            $('#home-team-score').html(value); 
        }
    });
    socket.on('gol-visitante', function (data){
        var value  = parseInt($('#away-team-score').html()) +1;
        if(value >=0){    
            $('#away-team-score').html(value);
        }
    });
    socket.on('restar-gol-visitante', function (data){
        var value  = parseInt($('#away-team-score').html()) -1;
        if(value >=0){
            $('#away-team-score').html(value);   
        }
    });
    //NUEVO
 /*   socket.on('tecladoevento', function (){
        alert("ha cogido el evento");

    });*/

    var PlayClock = {
        totalSeconds: 20,
        running: false,

        start: function () {
            var self = this;
            this.running = true;

            this.interval = setInterval(function () {
                if (self.totalSeconds == 0) {
                    self.pause();
                    return false;
                }
                self.totalSeconds -= 1;
                //$("#min").text(Math.floor(self.totalSeconds / 60 % 60));
                $("#playclock-timer").text(parseInt(self.totalSeconds % 60));
            }, 1000);
        },

        pause: function () {
            this.running = false;
            clearInterval(this.interval);
            delete this.interval;
        },

        restart: function(value) {
            $("#playclock-timer").text(value);
            clearInterval(this.interval);
            delete this.interval;
            this.totalSeconds = value;
            this.start();
        },

        resume: function () {
            if (!this.interval) this.start();
        }
    };

    var GameClock = {
        totalSeconds: 480,
        running: false,

        start: function () {
            var self = this;
            this.running = true;

            this.interval = setInterval(function () {
                if (self.totalSeconds == 0) {
                    self.pause();
                    return false;
                }
                self.totalSeconds -= 1;
                $("#gameclock-min").text(Math.floor(self.totalSeconds / 60 % 60));
                var seconds = parseInt(self.totalSeconds % 60);
                if (seconds < 10) {
                    seconds = '0' + seconds;
                }
                $("#gameclock-sec").text(seconds);
            }, 1000);
        },

        pause: function () {
            this.running = false;
            clearInterval(this.interval);
            delete this.interval;
        },

        restart: function(min, sec, seconds) {
            $("#gameclock-min").text(min);
            $("#gameclock-sec").text(sec);
            clearInterval(this.interval);
            delete this.interval;

            this.totalSeconds = 480;
            this.totalSeconds = seconds;
        

            this.pause();
        },

        resume: function () {
            if (!this.interval) this.start();
        },

        addMin: function () {
            this.totalSeconds += 60;
            $("#gameclock-min").text(Math.floor(this.totalSeconds / 60 % 60));
        },

        subtractMin: function () {
            if (this.totalSeconds > 60) {
                this.totalSeconds -= 60;
                $("#gameclock-min").text(Math.floor(this.totalSeconds / 60 % 60));
            }
        }
    };

    // Events for interacting directly with ScoreBoard
    // So you do not need a ref

    // Points
    $('#away-team-score').click(function() {
        var score = parseInt($(this).html()) + 1;
        socket.emit('update-away-team-score', { score: score });
    });
    $('#home-team-score').click(function() {
        var score = parseInt($(this).html()) + 1;
        socket.emit('update-home-team-score', { score: score });
    });

    // Timeouts
    $('#away-timeouts-label').click(function() {
        socket.emit('update-away-team-timeouts', { direction: 'down' });
    });
    $('#home-timeouts-label').click(function() {
        socket.emit('update-home-team-timeouts', { direction: 'down' });
    });

    // Quarter
    $('#quarter').click(function(){
        socket.emit('update-quarter', { direction: 'up' });
    });

    // Down
    $('#down').click(function(){
        socket.emit('update-down', { direction: 'up' });
    });

    // Play Clock
    $('#playclock').click(function(){
        socket.emit('reset-playclock', { mode: 'play' });
    });
    $('#playclock').dblclick(function(){
        socket.emit('reset-playclock', { mode: 'restart', value: 20 });
    });

    // Game Clock
    $('#timer').click(function() {
        socket.emit('update-gameclock', { mode: 'play' });
    });
    $('#timer').dblclick(function(){
        socket.emit('update-gameclock', { mode: 'restart', min: 8, sec: '00', seconds: 480});
    });

    document.body.addEventListener('keydown', function (e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (key == 76) {
            //gol local (L)
            socket.emit('gol-local', { data: 1 });
        }else if (key == 75) {
            //quitar gol local (K)
            socket.emit('restar-gol-local', { data: 1 });   
        }else if (key == 86) {
            //gol visitante (V)
            socket.emit('gol-visitante', { data: 1 });   
        }else if (key == 66) {
            //quitar gol visitante (B)
            socket.emit('restar-gol-visitante', { data: 1 });   
        }else if (key == 32) {
            //parar/correr reloj (ESPACIO)
            socket.emit('update-gameclock', { mode: 'play' });
        }else if (key == 82) {
            //restart tiempo (R)
            socket.emit('update-gameclock', { mode: 'restart', min: 8, sec: '00', seconds: 480});
        }else if(key == 83){
            //cambiar tiempo cuarto arriba (S)
            socket.emit('update-quarter', { direction: 'up' });
        }else if(key == 68){
            //cambiar tiempo cuarto(D)
            socket.emit('update-quarter', { direction: 'down' });
        }else if(key == 84){
             //para setear el tiempo (T)
            var txt;
            var input = prompt("Introduzca el tiempo:", "8:00");

            if(input == null || input == "" || !input.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]/)){
                alert("Error en el formato de tiempo. Por favor rellenar con el formato Minutos:Segundos");
            }else{
                var split = input.split(":");
                if(split[0].length > 2 || split[1].length > 2 ){
                    alert("Error en el formato de tiempo. Por favor rellenar con el formato Minutos:Segundos");  
                }else{
                    var segundos = parseInt(split[0]) * 60 + parseInt(split[1]);
                    socket.emit('update-gameclock', { mode: 'restart', min: split[0], sec: split[1], seconds: segundos });
                }
            }


        
        }
    });

    
      
});