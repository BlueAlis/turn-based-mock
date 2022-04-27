var stompClient = null;
var room;
var token = `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJhdXRoc1wiOltcInVzZXJcIl0sXCJqd3RcIjpcIlwiLFwid2F4QWRkcmVzc1wiOlwiYmx1ZWFsaXN6enp6XCJ9IiwiZXhwIjoxNjUxMDUwOTQ1LCJpYXQiOjE2NTEwMzI5NDV9.ZQmKp86wINDpdg1dwBxQ0wcCbGvdU4SuYpmer7D77N4dxcffqPD6o5ha6oJM6IqVS-uKLdoiE6lGWSgqVwi7jQ`
var headers = {Authorization: `Bearer ${token}`}

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

    room = await axios.post('http://localhost:8081/api/game/create-new-game/1', {}, { headers })

    var socket = new SockJS('http://127.0.0.1:8081/api/socket/');
    //https://api.krypton.cards/api/socket/
    //http://localhost:8081/api/socket/
    // stompClient = Stomp.over(socket);
    // stompClient.connect({}, function (frame) {
    //     setConnected(true);
    //     console.log('Connected: ' + frame);
    //     stompClient.subscribe(`/topic/user/${room.data}`, function (greeting) {
    //         showGreeting(JSON.parse(greeting.body).payload);
    //     });
    // });
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
    headers: {Authorization: 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJhdXRoc1wiOltcInVzZXJcIl0sXCJqd3RcIjpcIlwiLFwid2F4QWRkcmVzc1wiOlwiYmx1ZWFsaXN6enp6XCJ9IiwiZXhwIjoxNjUwOTg2MTcxLCJpYXQiOjE2NTA5NjgxNzF9.WNiyzdmSHZJhPat63toVYAMbch0A7Jsn5RuG0ZRbi7c8WOnyweOiOmrLM8MJlkrOWmhTbGWizW7FeJAyQFHKRw'}
    })
}

async function attack(){
    await axios.post('http://localhost:8081/api/game/action', {
        gameId: room.data,
        assetId: $("#atkAsset").val(),
        position: $("#dfPosition").val()
    }, { headers })
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { connect(); });
    $( "#disconnect" ).click(function() { disconnect(); });
    $( "#send" ).click(function() { sendName(); });
    $( "#setGame" ).click(function() { sendGameSetting(); });
    $( "#attack" ).click(function() { attack(); });
});