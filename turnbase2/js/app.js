var stompClient = null;
var room;
var token = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJhdXRoc1wiOltcInVzZXJcIl0sXCJqd3RcIjpcIlwiLFwid2F4QWRkcmVzc1wiOlwiYmx1ZWFsaXN6enp6XCJ9IiwiZXhwIjoxNjUxMDUwOTQ1LCJpYXQiOjE2NTEwMzI5NDV9.ZQmKp86wINDpdg1dwBxQ0wcCbGvdU4SuYpmer7D77N4dxcffqPD6o5ha6oJM6IqVS-uKLdoiE6lGWSgqVwi7jQ"
var obj;
function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#greetings").html("");
}

async function connect() {

    room = await axios.post('http://localhost:8081/api/game/create-new-game/1', {}, {
    headers: {Authorization: token}
    })

    var socket = new SockJS('http://localhost:8081/api/socket/');
    //https://api.krypton.cards/api/socket/
    //http://localhost:8081/api/socket/
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe(`/topic/user/${room.data}`, function (greeting) {
            obj = JSON.parse(JSON.parse(greeting.body).payload)
            // showGreeting(JSON.parse(greeting.body).payload);
            console.log(greeting.body);

            //switch(obj.type)
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    stompClient.send("/app/notification/send", {}, JSON.stringify({'name': $("#name").val()}));
}

function showGreeting(message) {
    $("#greetings").append(`<tr><td>" + ${message} + "</td></tr>
    <tr><td>--------------------------</td></tr>`);
}

async function sendGameSetting(){
    await axios.post('http://localhost:8081/api/game/find-game', {
        assetIds: JSON.parse($("#assets").val()),
        positions: JSON.parse($("#positions").val()),
        isBotGame: true,
        gameId: room.data
    }, {
    headers: {Authorization: token}
    })
}

async function attack(){
    await axios.post('http://localhost:8081/api/game/action', {
        gameId: room.data,
        assetId: $("#selectAsset").val(),
        position: $("#attackPosition").val()
    }, {
    headers: {Authorization: token}
    })
}

function start() {
    var str = document.getElementById("start");
    if (str.style.display === "none") {
        str.style.display = "block";
    } else {
        str.style.display = "none";
        document.getElementById("setGame").style.display = "block";
    }
}

function setGame() {
    var sG = document.getElementById("setGame");
    if (sG.style.display === "none") {
        sG.style.display = "block";
    } else {
        sG.style.display = "none";
        document.getElementById("attack").style.display = "block";
    }
}



const showAllRobot = async () => {
    let css = ""
    try {
        for(i = 0; i < 4; i++){
            css += `
            <div class="row">
            <div class="col ml-5">
                <div class="carddff">
                    <div class="main">
                        <p> player <p></p>
                        <p>AssetID: 54654654</p>
                        <p>HP: 100</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="carddff">
                    <div class="main">
                        <p> bot <p></p>
                        <p>AssetID: 54654654</p>
                        <p>HP: 100</p>
                    </div>
                </div>   
            </div>
    </div>
            `
        document.getElementById("allRobot").innerHTML = css
        }
        // document.getElementById("allRobot").innerHTML = obj.employees.map(
        //     (a) => 
        //     `
        //         <h1>${a.firstName}</h1>
        //     `
        // ).join("");

    } catch(e){
        console.log(e);
    }
}

showAllRobot();

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#butStart" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#send" ).click(function() { sendName(); });
    $( "#go" ).click(function() { sendGameSetting(); });
    $( "#attackBtn" ).click(function() { attack(); });
});