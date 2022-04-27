const TOKEN = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJqd3RcIjpcIlwiLFwiYXV0aHNcIjpbXCJ1c2VyXCJdLFwid2F4QWRkcmVzc1wiOlwiYmx1ZWFsaXN6enp6XCJ9IiwiZXhwIjoxNjUxMDY4OTgzLCJpYXQiOjE2NTEwNTA5ODN9.yIK2unfwNM3YQ6pAfhFd4nlvXg88okBp6bVyl8mRzOITpvvrwNEsu5SGbIrHqDvd_s2U-g7Y7G2LY4-_DA0hag"
const GAME_SCENE = {
	start: 'startScene',
	set: 'setGameScene',
	attack: 'attackScene'
}
const STATE = {
	state: 'turnbased-state',
	turnState: 'turnbased-turn-state',
	actionAttack: 'turnbased-action-attack',
	playerTurn: 'turnbased-player-turn'
}

//const MOCK = {"subject":"turnbased-state","body":{"id":55546,"currentTurn":null,"isGameOver":false,"isBotGame":true,"gameAssets":[{"assetId":2099526508971,"position":"D1","speed":80,"hp":400,"team":"B","users":"BOT"},{"assetId":2099526508973,"position":"C1","speed":60,"hp":400,"team":"B","users":"BOT"},{"assetId":2099526508972,"position":"D2","speed":70,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099526508974,"position":"C2","speed":50,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099528452868,"position":"B1","speed":40,"hp":400,"team":"B","users":"BOT"},{"assetId":2099528452869,"position":"B2","speed":30,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099528452871,"position":"A2","speed":10,"hp":400,"team":"A","users":"bluealiszzzz"},{"assetId":2099528452870,"position":"A1","speed":20,"hp":400,"team":"B","users":"BOT"}]}}
let testState = {"subject" : "wait"}
let playerAssetId = 0;
let attackPosition = ''
// GAME CLASSES
class Game {
  constructor() {
		this.startSceneElem = document.getElementById(GAME_SCENE.start)
		this.setGameSceneElem = document.getElementById(GAME_SCENE.set)
		this.attackSceneElem = document.getElementById(GAME_SCENE.attack)

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
				break;
			case GAME_SCENE.attack:
				this.startSceneElem.classList.add('hidden')
				this.setGameSceneElem.classList.add('hidden')
				this.attackSceneElem.classList.remove('hidden')
				break;
			default:
				this.startSceneElem.classList.remove('hidden')
				this.setGameSceneElem.classList.add('hidden')
				this.attackSceneElem.classList.add('hidden')
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

				switch (obj.subject) {
					case STATE.state:
						//console.log(obj);
						testState = obj;
						//console.log(testState)
						game.renderRobots()
						break;
					case STATE.playerTurn:
						let playerObj = JSON.parse(JSON.parse(JSON.parse(greeting.body).payload).body)
						playerAssetId = playerObj.assetId
						break;
				}
		})
	}
}

// `game` variables of Game service
const game = new Game()
