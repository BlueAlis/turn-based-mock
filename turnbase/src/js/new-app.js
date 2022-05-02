const TOKEN = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJqd3RcIjpcIlwiLFwiYXV0aHNcIjpbXCJ1c2VyXCJdLFwid2F4QWRkcmVzc1wiOlwiYmx1ZWFsaXN6enp6XCJ9IiwiZXhwIjoxNjUxNTI4ODY0LCJpYXQiOjE2NTE1MTA4NjR9.BhpUfCUMhHqFF2RIIkkex4L9vHjxzsb6uqSYF6fO6dl1BR_I9fnrmcS7gw23IrOxDaWvLTdXbxPVlT09cmzoQQ"
const GAME_SCENE = {
	start: 'startScene',
	set: 'setGameScene',
	attack: 'attackScene',
	end: 'endScene'
}
const STATE = {
	state: 'turnbased-state',
	turnState: 'turnbased-turn-state',
	actionAttack: 'turnbased-action-attack',
	playerTurn: 'turnbased-player-turn',
}

const MOCK = {"subject":"turnbased-state","body":{"id":55546,"currentTurn":null,"isGameOver":false,"isBotGame":true,"gameAssets":[{"assetId":2099526508971,"position":"D1","speed":80,"hp":400,"team":"B","users":"BOT"},{"assetId":2099526508973,"position":"C1","speed":60,"hp":400,"team":"B","users":"BOT"},{"assetId":2099526508972,"position":"D2","speed":70,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099526508974,"position":"C2","speed":50,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099528452868,"position":"B1","speed":40,"hp":400,"team":"B","users":"BOT"},{"assetId":2099528452869,"position":"B2","speed":30,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099528452871,"position":"A2","speed":10,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099528452870,"position":"A1","speed":20,"hp":400,"team":"B","users":"BOT"}]}}
const turnStateMock = {"subject":"turnbased-turn-state","body":{"2099528452870":30,"2099528452871":15,"2099528452868":60,"2099526508971":0,"2099528452869":45,"2099526508972":0,"2099526508973":85,"2099526508974":70}}
let testTurnState = {"body" : ""}
let testState = {"subject" : "wait"}
let playerAssetId = 0;
let attackPosition = ''

let turnStateSort = [];

// for (var id in turnStateMock.body) {
//     turnStateSort.push([id, turnStateMock.body[id]]);
// }
// turnStateSort.sort(function(a, b) {
//     return a[1] - b[1];
// });

// console.log(turnStateSort[1][1])



// GAME CLASSES
class Game {
  constructor() {
		this.startSceneElem = document.getElementById(GAME_SCENE.start)
		this.setGameSceneElem = document.getElementById(GAME_SCENE.set)
		this.attackSceneElem = document.getElementById(GAME_SCENE.attack)
		this.endSceneElem = document.getElementById(GAME_SCENE.end)

		// this.scene = GAME_SCENE.start
		this.scene = GAME_SCENE.start
		this.stompClient = null
		this.room = null

		// checking
		this.checkScene()
	}

	// Check to display scene
	checkScene() {
		switch (this.scene) {
			case GAME_SCENE.set:
				this.startSceneElem.classList.add('hidden')
				this.setGameSceneElem.classList.remove('hidden')
				this.attackSceneElem.classList.add('hidden')
				this.endSceneElem.classList.add('hidden')
				break;
			case GAME_SCENE.attack:
				this.startSceneElem.classList.add('hidden')
				this.setGameSceneElem.classList.add('hidden')
				this.attackSceneElem.classList.remove('hidden')
				this.endSceneElem.classList.add('hidden')
				break;
			case GAME_SCENE.end:
				this.startSceneElem.classList.add('hidden')
				this.setGameSceneElem.classList.add('hidden')
				this.attackSceneElem.classList.add('hidden')
				this.endSceneElem.classList.remove('hidden')
				break;
			default:
				this.startSceneElem.classList.remove('hidden')
				this.setGameSceneElem.classList.add('hidden')
				this.attackSceneElem.classList.add('hidden')
				this.endSceneElem.classList.add('hidden')
				break;
		}
	}

	// On handle click next scene
	nextScene(val) {
		this.scene = val
		this.checkScene()
	}
	
	// On start game
	onStart() {
		this.onConnectSocket()
	}

	// On Submit set game
	async onSetGame() {
		const form = new FormData(document.getElementById('setGameForm'))
		const assetsValue = form.get('assets')
		const positionsValue = form.get('positions')

		try {
			await axios.post('http://localhost:8081/api/game/find-game', {
				assetIds: JSON.parse(assetsValue),
				positions: JSON.parse(positionsValue),
				isBotGame: true,
				gameId: this.room
			}, {
				headers: {Authorization: TOKEN}
			})

			this.nextScene(GAME_SCENE.attack)
		} catch (err) {
			console.log(`SET GAME ERROR`, err)
		}
	}

		// On Submit attack
		async onAttack() {
			const form = new FormData(document.getElementById('attackForm'))
			//const selectAsset = form.get('selectAsset')
			//const attackPosition = form.get('attackPosition')
	
			try {
				await axios.post('http://localhost:8081/api/game/action', {
					assetId: playerAssetId,
					position: attackPosition,
					gameId: this.room
				}, {
					headers: {Authorization: TOKEN}
				})
			} catch (err) {
				console.log(`ATTACK GAME ERROR`, err)
			}
		}

	// HTML TEMPLATE
	renderTemplateContainer(title = 'TITLE', templateItem = '') {
		return `<div class="flex flex-col items-center justify-start flex-1 space-y-3">
		<h5 class="text-2xl font-semibold">${title}</h5>
		${templateItem}
	</div>`
	}

	

	renderTemplateRobot(position = 'XX', assetId = 'XX', hp = 'XX') {
		return `<div class="bg-gray-100 text-black p-3 rounded" ${attackPosition == position && `style="background:red"` } onclick="game.selectPosition('${position}')">
			<p><strong>Position :</strong> ${position}</p>
			<p><strong>AssetId :</strong>: ${assetId}</p>
			<p><strong>HP :</strong>: ${hp}</p>
		</div>`
	}

	renderTemplateRobotTurn(id,turn){
		return `
		<div class="flex flex-col items-center justify-start flex-1 bg-gray-100 text-black rounded-xl">
			<p> ${turn} </p>
			<p> ${id} </p>
	  	</div>`
	}

	renderTurnState() {
		const robotTurnState = document.getElementById('turnState')
		let allTemplate = ``

		turnStateSort.forEach((id,turn) => {
			allTemplate += this.renderTemplateRobotTurn(id,turn)
		})
		robotTurnState.innerHTML = allTemplate
	}

	// Render Robots
	renderRobots() {
		const gameAssets = _.sortBy(testState.body.gameAssets, 'team')
		const robotsAreaElem = document.getElementById('allRobot')
		let allTemplate = ``
		
		_.map(_.groupBy(gameAssets, 'team'), (val, key) => {
			let robots = ``
			_.sortBy(val, 'position').forEach((item) => {
				robots += this.renderTemplateRobot(item.position, item.assetId, item.hp)
			})
			
			allTemplate += this.renderTemplateContainer(key === 'A' ? 'Player' : 'Bot', robots)	
		})

		robotsAreaElem.innerHTML = allTemplate
	}

	renderWinner(win) {
		const winner = document.getElementById('winner')
		winner.innerHTML = 'team ' + win
	}

	selectPosition(position ='XX') {
			console.log(position)
			attackPosition = position;
			this.renderRobots();
		}
	// SOCKET
	// Connect
	async onConnectSocket() {
		const response = await axios.post('http://localhost:8081/api/game/create-new-game/1', {}, {
    	headers: {Authorization: TOKEN}
    })

    const socket = new SockJS('http://localhost:8081/api/socket/');
    //https://api.krypton.cards/api/socket/
    //http://localhost:8081/api/socket/
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);
				this.room = response.data
				this.onSubscribe()
				this.nextScene(GAME_SCENE.set)
    })
	}

	// Subscribe
	onSubscribe() {
		this.stompClient.subscribe(`/topic/user/${this.room}`, (greeting) => {
				let obj = JSON.parse(JSON.parse(greeting.body).payload)
				// showGreeting(JSON.parse(greeting.body).payload);
				console.log(JSON.parse(JSON.parse(greeting.body).payload));
				//switch(obj.type)

				if(obj.isGameOver){
					console.log(obj.isGameOver)
					this.renderWinner(obj.winner)
					this.nextScene(GAME_SCENE.end)
				}

				switch (obj.subject) {
					case STATE.state:
						//console.log(obj);
						testState = obj;
						//console.log(testState)
						game.renderRobots()
						//game.renderTurnState()
						break;
					case STATE.playerTurn:
						let playerObj = JSON.parse(JSON.parse(JSON.parse(greeting.body).payload).body)
						playerAssetId = playerObj.assetId
						break;
					case STATE.turnState:

						turnStateSort = []
						let count = 0
						let i = 0;
						let check = 1000;
						for (var id in obj.body) {
							
							//console.log('speed ' + obj.body[id])
							turnStateSort.push([id, obj.body[id]]);
							check = obj.body[id]
							
							if(check == 0){
									count++
									console.log(count);
							}
							i++
						}

						console.log(obj.body);

						turnStateSort.sort(function(a, b) {
							return a[1] - b[1];
						});
						console.log(turnStateSort);

						if(count == 2){
							turnStateSort.shift()
						}
						let temp = turnStateSort[0]
						turnStateSort.shift()
						
						turnStateSort.reverse()
						turnStateSort.unshift(temp)

						console.log(temp)

						game.renderTurnState()
						break;

				}
		})
	}
}

// `game` variables of Game service
const game = new Game()

