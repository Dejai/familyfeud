javascript:(function(){

	/* Finally --- loop through and set all the CSV outputs */
	let CSV = "Question,A1,C1,A5,C5,A2,C2,A6,C6,A3,C3,A7,C7,A4,C4,A8,C8";

	/* Clean up the question values */
	var cleanUpQuestion = function(value)
	{
		var cleanValue = value.replaceAll("\n", "");
		cleanValue = cleanValue.replaceAll(",", " ");
		cleanValue = cleanValue.replaceAll("\"","\'");
		cleanValue = cleanValue.trim();
		return cleanValue;
	};

	/* Store the question in a map and a list */
	let questionMap = {};
	let questionList = [];

	/* Get the number of answers */
	let answer = prompt("How many answers?");
	let numAnswers = Number(answer);
	let isValidNumber = !isNaN(numAnswers);

	/* Alert if it is an invalid number */
	if(!isValidNumber)
	{
		alert("Not a valid number");
	}

	/* Only Process if the given response is a valid number */
	if(isValidNumber)
	{
		console.log("Processing for " + numAnswers + " answers ...");

		/* Set the initial question objects & in the list */
		let olderQuestions = document.querySelectorAll("table[bgcolor='#808080'] td");
		let olderQuestions2 = document.querySelectorAll("center td[width='644']");
		let newerQuestions = document.querySelectorAll("center font[size='4']");
		
		let questions = (olderQuestions.length > 0) ? olderQuestions : 
						(olderQuestions2.length > 0) ? olderQuestions2 : 
						(newerQuestions.length > 0) ? newerQuestions : 
						[];

		questions.forEach(function(obj){
			let value = cleanUpQuestion(obj.innerText);
			if(!questionMap.hasOwnProperty(value))
			{
				questionMap[value] = 
				{
					"question": value,
					"answers": [],
					addAnswer: function(value){ if(value != "" && value!= undefined){ this["answers"].push(value) } },
					hasAllAnswers: function(amt){ return this.answers.length == amt * 2; }
				};
				questionList.push(value);
			}
		});

		console.log(questionMap);

		/* Get the answers */
		let olderAnswers = document.querySelectorAll("table[bgcolor='#FF8A33'] table[bgcolor='#000000'] center");
		let olderAnswers2 = document.querySelectorAll("table[bgcolor='#000000'] center");
		let newerAnswers = document.querySelectorAll("center table[width='542'] p[align='CENTER']");
		
		let answers = (olderAnswers.length > 0) ? olderAnswers :
					  (olderAnswers2.length > 0) ? olderAnswers2 :
					  (newerAnswers.length > 0) ? newerAnswers : 
					  [];

		currQuestion = questionMap[questionList.shift()];
		answers.forEach(function(obj){
			if(currQuestion)
			{
				if(currQuestion.hasAllAnswers(numAnswers))
				{
					/* Add the recently completed question to the CSV */
					question = currQuestion["question"];
					answers = currQuestion["answers"];
					joint = `"${answers.join("\",\"")}"`;
					row = `\n"${question}",${joint}`;
					CSV += row;
					console.log(currQuestion);
					currQuestion = questionMap[questionList.shift()];
				}

				ele = obj.querySelector("b");
				var value = "";
				if(ele != undefined)
				{
					value = ele.innerText.replaceAll("\n").replaceAll(",", " ").replaceAll("\"","\'");
				}
				if(currQuestion){
					currQuestion.addAnswer(value);				
				}
			}
		});

		/* Write the CSV to the browser */
		document.write(`<pre>${CSV}</pre>`);
	}
})();