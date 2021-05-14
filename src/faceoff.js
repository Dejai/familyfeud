
mydoc.ready(function(){

	// Load the voice options once page loaded
	Speaker.loadVoiceOptions();

	// Set the button height
	setButtonHeight();

	// Set the team names
	setTeamNames();

	// Set listener ups
	faceOffListenerOnKeyUp();



});

function setButtonHeight()
{
	let innerHeight = window.innerHeight;
	let heightToSet = (innerHeight > 600) ? innerHeight : innerHeight / 2
	Array.from(document.querySelectorAll(".face_off_section")).forEach(function(obj){
		obj.style.height = heightToSet + "px";
	});
}

function faceOffListenerOnKeyUp()
{
	document.addEventListener("keyup", function(event){
		// console.log(event.code);
		switch(event.code)
		{
			case "Backquote":
			case "Tab":
			case "CapsLock":
			case "ShiftLeft":
			case "ControlLeft":
				document.getElementById("player_one").click();
				break;

			case "ShiftRight":
			case "Enter":
			case "Backslash":
			case "Backspace":
			case "ControlRight":
				document.getElementById("player_two").click();
				break;
			default:
				return;
		}
	});	
}

function cleanTeamName(value)
{
	console.log(value);
	console.log(decodeURIComponent(value));

	let cleanName = decodeURIComponent(value.replaceAll("+", " "));
	return cleanName
}

function setTeamNames()
{
	let searchString = location.search;

	let queryMap = mydoc.get_query_map();

	let teamOne = (queryMap["team1"] != undefined) ? queryMap["team1"] : "Family One";
	let teamTwo = (queryMap["team2"] != undefined) ? queryMap["team2"] : "Family Two";

	document.getElementById("player_one").innerText = cleanTeamName(teamOne);
	document.getElementById("player_two").innerText = cleanTeamName(teamTwo);

}

var FACE_OFF_WINNER = false;
function face_off_winner(player, name)
{
	// If already a winner, return;
	if(FACE_OFF_WINNER){ return; }

	FACE_OFF_WINNER = true; 
	document.getElementById(player).classList.add("face_off_winner");
	// Play sound;
	document.getElementById("face_off_buzzer_sound").play();

	// Indicate player by voice
	setTimeout(function(){
		Speaker.speakText(name);
	}, 1200);

	setTimeout(function(){
		FACE_OFF_WINNER = false; 
		document.getElementById(player).classList.remove("face_off_winner");
	}, 5000);
}