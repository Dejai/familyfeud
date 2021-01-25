

/***** 
TIMER OBJECT 
This object stores all the key functions for the timer during the fast money round
******/

const Timer = {

	countdown_timer: undefined,
	timer_default: 20,

	//Start the timer
	startTimer: function()
	{
		this.toggleTimerButtons("start");

		if(!this.countdown_timer)
		{
			this.countdown_timer = setInterval(function(){
				time_ele 	= document.getElementById("timer_second");
				time_ele.contentEditable = false;
				time 		= time_ele.innerHTML;
				time 		= time.replace(" ", "");
				time 		= Number(time);
				time 		-= 1;

				// Return withot doing anything if there is an unacceptable value to display
				if (isNaN(time) || time == undefined || time == -1){ 
					// stopInterval(); 
					Timer.resetTimer();
					Timer.toggleTimerButtons("timeup");
					return; 
				} 
				new_time 	= (time < 10) ? "0" + time : time;
				time_ele.innerHTML = new_time;
				if (time == 0)
				{
					Timer.setTimeColor("red");
					Timer.toggleTimerButtons("timeup");
					Timer.stopInterval();

					if(Timer.timeUpCallback)
					{
						Timer.timeUpCallback();
					}
				}
			}, 1100);
		}		
	},

	//Stop the timer
	stopTimer: function()
	{
		if(this.countdown_timer)
		{
			this.toggleTimerButtons("stop");
			this.stopInterval();
		}
	},


	toggleTimerButtons: function(state)
	{
		let start = document.getElementById("timer_start");
		let stop  = document.getElementById("timer_stop");
		let reset = document.getElementById("timer_reset");

		switch(state)
		{
			case "start":
				start.style.display = "none";
				stop.style.display = "inline";
				reset.style.display = "none";
				break;
			case "timeup":
				start.style.display = "none";
				stop.style.display = "none";
				reset.style.display = "inline";
				break;
			case "stop":
				start.style.display = "inline";
				stop.style.display = "none";
				reset.style.display = "inline";
				break;
			case "reset":
				start.style.display = "inline";
				stop.style.display = "none";
				reset.style.display = "none";
				break;
			default:
				start.style.display = "inline";
				stop.style.display = "none";
				reset.style.display = "none";
		}
	},

	resetTimer: function()
	{
		this.stopInterval();
		this.countdown_timer = undefined;
		this.toggleTimerButtons("reset");
		this.setTimeColor("white");
		this.setTimerSeconds(this.timer_default);
	},


	// Setters
	setTimerSeconds: function(value)
	{
		document.getElementById("timer_second").innerHTML = value;
	},

	setTimeColor: function(color)
	{
		document.getElementById("timer_second").style.color = color;
	},

	setTimerDefault: function(value)
	{
		this.timer_default = value;
		this.setTimerSeconds(this.timer_default);
	},

	setTimeUpCallback: function(callback){
		Timer.timeUpCallback = callback;
	},

	// Getters
	timeUpCallback: function(){
		console.log("Time is up");
	},

	// Reseters
	stopInterval: function()
	{
		if(this.countdown_timer)
		{
			clearInterval(this.countdown_timer);
			this.countdown_timer = undefined;
		}
		document.getElementById("timer_second").contentEditable = true;
	},
}


/*** TIMER HELPER FUNCTIONS ***/

