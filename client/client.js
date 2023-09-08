console.log("client.js executing");
const socket = io();
let roomUniqueId = null;
let player1 = false;
let intervalid;
let confettiFlag = false;

var elem = document.documentElement;
window.addEventListener('popstate', function(event) {
    console.log('popstate event triggered:', event.state);

    const currentState = event.state;
    if (currentState === 'gamePlay') {
        document.getElementById('initial').style.display = 'none';
        document.getElementById('gamePlay').style.display = 'block';
    } else {
        document.getElementById('initial').style.display = 'block';
        document.getElementById('gamePlay').style.display = 'none';
    }
});


/* function back btn */
const turnBack = () =>{
    let homeLocation = document.getElementById('initial');
    let joinbox = document.getElementById('home-box-input');
    let waitAreaLocation = document.getElementById('waitingArea');
    let ArenaLocation = document.getElementById('gameArea');

    if(homeLocation.style.display === "none"){
        homeLocation.style.display = "flex";
        waitAreaLocation.style.display = "none";
        ArenaLocation.style.display = "none";
    }
    joinbox.classList.add("hidden");
    stopConfetti();
}


var isFull = false;
function openFullscreen() {
    let scrElebtn = document.getElementById('full-btn');
  if (elem.requestFullscreen && isFull == false) {
    scrElebtn.innerHTML = "Exit Fullscreen";
    isFull = true;
    elem.requestFullscreen();
  } 
  else if (elem.webkitRequestFullscreen && isFull == false) { /* Safari */
    isFull = true;
    elem.webkitRequestFullscreen();
  } 
  else if (elem.msRequestFullscreen && isFull == false) { /* IE11 */
    isFull = true;
    elem.msRequestFullscreen();
  }
  else{
    closeFullscreen();
  }
}

function closeFullscreen() {
    let scrElebtn = document.getElementById('full-btn');
    scrElebtn.innerHTML = "⏹️";
    if (document.exitFullscreen && isFull == true) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen && isFull == true) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen && isFull == true) { /* IE11 */
      document.msExitFullscreen();
    }
    isFull = false;
  }

function createGame() {
    let waitingArea = document.getElementById('waitingArea');
    waitingArea.style.display = "flex";
    player1 = true;
    socket.emit('createGame');
}

/* Display Join Game function */
function displayJoinGame(x){
    let InputEle = document.getElementById('home-box-input');
    if(x==1){InputEle.classList.remove('hidden');}
    else{
        InputEle.classList.add('hidden');
    }
}



function joinGame() {
    roomUniqueId = document.getElementById('roomUniqueId').value;
    socket.emit('joinGame', {roomUniqueId: roomUniqueId});
}

socket.on("newGame", (data) => {
    let textvar=false;
    roomUniqueId = data.roomUniqueId;
    document.getElementById('initial').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';
    let copyButton = document.createElement('button');
    copyButton.style.display = 'block';
    copyButton.classList.add('copy-btn','py-2', 'my-2')
    copyButton.innerText = 'Copy Code';
    copyButton.addEventListener('click', () => {

        navigator.clipboard.writeText(roomUniqueId).then(function() {
            if(copyButton.innerText==='Copy Code'){
                copyButton.innerHTML = "Copied";
                textvar = true;
            }
            else{if(textvar==true){ alert("Join code is already copied !!!");copyButton.innerHTML = "Copy Code";}}
            console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
        });
    });
    document.getElementById('waitingArea').innerHTML = `<div class="wa-div IDdiv-wa"><button class="back-btn" onclick="turnBack()">🏠Go to Home</button><button class="fullscr-btn" id="full-btn" onclick="openFullscreen()">⏹️</button><h1 class="wa-TopHead">Waiting for opponent...</h1><h2 class="wa-MidHead"> please share code <span class="wa-Span">${roomUniqueId}</span> to join</h2></div>`;
    document.getElementById('waitingArea').appendChild(copyButton);
});

socket.on("playersConnected", () => {
    document.getElementById('initial').style.display = 'none';
    document.getElementById('waitingArea').style.display = 'none';
    document.getElementById('gameArea').style.display = 'flex';
})

socket.on("p1Choice",(data)=>{
    if(!player1) {
        createOpponentChoiceButton(data);
    }
});

socket.on("p2Choice",(data)=>{
    if(player1) {
        createOpponentChoiceButton(data);
    }
});

socket.on("result",(data)=>{
    let winnerText = '';
    if(data.winner != 'd') {
        if(data.winner == 'p1' && player1) {
            winnerText = 'You won';
        } else if(data.winner == 'p1') {
            winnerText = 'You lose';
        } else if(data.winner == 'p2' && !player1) {
            winnerText = 'You won';
        } else if(data.winner == 'p2') {
            winnerText = 'You lose';
        }
    } else {
        winnerText = `It's a draw`;
    }
    document.getElementById('opponentState').style.display = 'none';
    document.getElementById('opponentButton').style.display = 'block';
    startConfetti();
    // document.getElementById('winnerArea').innerHTML = winnerText;
    document.getElementById('winnerArea').innerHTML = `<div class="custom-modal modal-div" id="myModal">
    <canvas id="confetti"></canvas>
    <div class="custom-modal-content modal-content-div">
      <h1 class="modal-head">Game Result</h1>
      <h1 class="modal-winner">${winnerText}</h1>
      <div class="modal-btn-div"><button class="modal-btn" onclick="closeModal()">Close</button></div>
    </div>
  </div>
  `;
});

function sendChoice(rpsValue) {
    const choiceEvent= player1 ? "p1Choice" : "p2Choice";
    socket.emit(choiceEvent,{
        rpsValue: rpsValue,
        roomUniqueId: roomUniqueId
    });
    let playerChoiceButton = document.createElement('button');
    playerChoiceButton.style.display = 'block';
    playerChoiceButton.classList.add(rpsValue.toString().toLowerCase(),'result-p1');
    playerChoiceButton.innerHTML = `<img src="./assets/ass/${rpsValue.toString().toLowerCase()}.png" class="res-img1"/>`;
    // document.getElementById('myChoice').innerHTML = "You";
    document.getElementById('myChoice').appendChild(playerChoiceButton);

    if(rpsValue.toString().toLowerCase()=="rock"){
      document.getElementById("scissor").disabled = true;
      document.getElementById("paper").disabled = true;


    }
    if(rpsValue.toString().toLowerCase()=="paper"){
      document.getElementById("rock").disabled = true;
      document.getElementById("scissor").disabled = true;

    }
    if(rpsValue.toString().toLowerCase()=="scissor"){
      document.getElementById("rock").disabled = true;
      document.getElementById("paper").disabled = true;

    }
}

function createOpponentChoiceButton(data) {
    document.getElementById('opponentState').innerHTML = "Opponent made a choice";
    let opponentButton = document.createElement('button');
    opponentButton.id = 'opponentButton';
    opponentButton.classList.add(data.rpsValue.toString().toLowerCase(),'result-p2');
    opponentButton.style.display = 'none';
    opponentButton.innerHTML = `<img src="./assets/ass/${data.rpsValue.toString().toLowerCase()}.png" class="res-img2"/>` ;
    document.getElementById('player2Choice').appendChild(opponentButton);
}

const closeModal = () =>{
    let modal = document.getElementById('myModal');
    modal.style.display = 'none';
    
    window.location.reload();
    "use strict";
    document.getElementById('initial').style.display = 'block' ;
}
//confetti js
"use strict";
function startConfetti () {
  // Globals
  var random = Math.random,
    cos = Math.cos,
    sin = Math.sin,
    PI = Math.PI,
    PI2 = PI * 2,
    timer = undefined,
    frame = undefined,
    confetti = [];

  var particles = 100,
    spread = 40,
    sizeMin = 3,
    sizeMax = 12 - sizeMin,
    eccentricity = 10,
    deviation = 100,
    dxThetaMin = -0.1,
    dxThetaMax = -dxThetaMin - dxThetaMin,
    dyMin = 0.13,
    dyMax = 0.18,
    dThetaMin = 0.4,
    dThetaMax = 0.7 - dThetaMin;

  var colorThemes = [
    function () {
      return color(
        (200 * random()) | 0,
        (200 * random()) | 0,
        (200 * random()) | 0
      );
    },
    function () {
      var black = (200 * random()) | 0;
      return color(200, black, black);
    },
    function () {
      var black = (200 * random()) | 0;
      return color(black, 200, black);
    },
    function () {
      var black = (200 * random()) | 0;
      return color(black, black, 200);
    },
    function () {
      return color(200, 100, (200 * random()) | 0);
    },
    function () {
      return color((200 * random()) | 0, 200, 200);
    },
    function () {
      var black = (256 * random()) | 0;
      return color(black, black, black);
    },
    function () {
      return colorThemes[random() < 0.5 ? 1 : 2]();
    },
    function () {
      return colorThemes[random() < 0.5 ? 3 : 5]();
    },
    function () {
      return colorThemes[random() < 0.5 ? 2 : 4]();
    }
  ];
  function color(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // Cosine interpolation
  function interpolation(a, b, t) {
    return ((1 - cos(PI * t)) / 2) * (b - a) + a;
  }

  // Create a 1D Maximal Poisson Disc over [0, 1]
  var radius = 1 / eccentricity,
    radius2 = radius + radius;
  function createPoisson() {
    // domain is the set of points which are still available to pick from
    // D = union{ [d_i, d_i+1] | i is even }
    var domain = [radius, 1 - radius],
      measure = 1 - radius2,
      spline = [0, 1];
    while (measure) {
      var dart = measure * random(),
        i,
        l,
        interval,
        a,
        b,
        c,
        d;

      // Find where dart lies
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        (a = domain[i]), (b = domain[i + 1]), (interval = b - a);
        if (dart < measure + interval) {
          spline.push((dart += a - measure));
          break;
        }
        measure += interval;
      }
      (c = dart - radius), (d = dart + radius);

      // Update the domain
      for (i = domain.length - 1; i > 0; i -= 2) {
        (l = i - 1), (a = domain[l]), (b = domain[i]);
        // c---d          c---d  Do nothing
        //   c-----d  c-----d    Move interior
        //   c--------------d    Delete interval
        //         c--d          Split interval
        //       a------b
        if (a >= c && a < d)
          if (b > d) domain[l] = d;
          // Move interior (Left case)
          else domain.splice(l, 2);
        // Delete interval
        else if (a < c && b > c)
          if (b <= d) domain[i] = c;
          // Move interior (Right case)
          else domain.splice(i, 0, c, d); // Split interval
      }

      // Re-measure the domain
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
        measure += domain[i + 1] - domain[i];
    }

    return spline.sort();
  }

  // Create the overarching container
  var container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.height = "0";
  container.style.overflow = "visible";
  container.style.zIndex = "9999";

  // Confetto constructor
  function Confetto(theme) {
    this.frame = 0;
    this.outer = document.createElement("div");
    this.inner = document.createElement("div");
    this.outer.appendChild(this.inner);

    var outerStyle = this.outer.style,
      innerStyle = this.inner.style;
    outerStyle.position = "absolute";
    outerStyle.width = sizeMin + sizeMax * random() + "px";
    outerStyle.height = sizeMin + sizeMax * random() + "px";
    innerStyle.width = "100%";
    innerStyle.height = "100%";
    innerStyle.backgroundColor = theme();

    outerStyle.perspective = "50px";
    outerStyle.transform = "rotate(" + 360 * random() + "deg)";
    this.axis =
      "rotate3D(" + cos(360 * random()) + "," + cos(360 * random()) + ",0,";
    this.theta = 360 * random();
    this.dTheta = dThetaMin + dThetaMax * random();
    innerStyle.transform = this.axis + this.theta + "deg)";

    this.x = window.innerWidth * random();
    this.y = -deviation;
    this.dx = sin(dxThetaMin + dxThetaMax * random());
    this.dy = dyMin + dyMax * random();
    outerStyle.left = this.x + "px";
    outerStyle.top = this.y + "px";

    // Create the periodic spline
    this.splineX = createPoisson();
    this.splineY = [];
    for (var i = 1, l = this.splineX.length - 1; i < l; ++i)
      this.splineY[i] = deviation * random();
    this.splineY[0] = this.splineY[l] = deviation * random();

    this.update = function (height, delta) {
      this.frame += delta;
      this.x += this.dx * delta;
      this.y += this.dy * delta;
      this.theta += this.dTheta * delta;

      // Compute spline and convert to polar
      var phi = (this.frame % 7777) / 7777,
        i = 0,
        j = 1;
      while (phi >= this.splineX[j]) i = j++;
      var rho = interpolation(
        this.splineY[i],
        this.splineY[j],
        (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
      );
      phi *= PI2;

      outerStyle.left = this.x + rho * cos(phi) + "px";
      outerStyle.top = this.y + rho * sin(phi) + "px";
      innerStyle.transform = this.axis + this.theta + "deg)";
      return this.y > height + deviation;
    };
  }

  function poof() {
    if (!frame) {
      // Append the container
      document.body.appendChild(container);

      // Add confetti
      var theme = colorThemes[0],
        count = 0;
      (function addConfetto() {
        var confetto = new Confetto(theme);
        confetti.push(confetto);
        container.appendChild(confetto.outer);
        timer = setTimeout(addConfetto, spread * random());
      })(500000000);

      // Start the loop
      var prev = undefined;
      requestAnimationFrame(function loop(timestamp) {
        var delta = prev ? timestamp - prev : 0;
        prev = timestamp;
        var height = window.innerHeight;

        for (var i = confetti.length - 1; i >= 0; --i) {
          if (confetti[i].update(height, delta)) {
            container.removeChild(confetti[i].outer);
            confetti.splice(i, 1);
          }
        }

        if (timer || confetti.length)
          return (frame = requestAnimationFrame(loop));

        // Cleanup
        document.body.removeChild(container);
        frame = undefined;
      });
    }
  }

  poof();

};
