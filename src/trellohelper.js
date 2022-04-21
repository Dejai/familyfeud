/* Common variables based on these helper functions*/
var TRELLO_LABELS = {}
var QUESTIONS = {};
var QUESTION_KEYS = [];
// The pools of questions
var QUESTION_POOL = { "regular": [], "fastMoney":[] }


// Get and map the labels available on this board
function getTrelloLabels()
{
	MyTrello.get_labels((data)=>{
		let resp = myajax.GetJSON(data.responseText);
		resp.forEach( (obj)=>{
			let labelID = obj["id"];
			let labelName = obj["name"];
			TRELLO_LABELS[labelName] = labelID;
		});
	});
}

// Get questions from the pool of questions; Total of -1 means get them all; 
function getPoolQuestions(poolName, successCallback)
{
    // Get count of regular questions
	MyTrello.get_cards_by_list_name(poolName, (cardData)=>{
		
        let response = myajax.GetJSON(cardData.responseText);

        if(response.length >= 1 && successCallback != undefined)
        {
            successCallback(response);
        }
	});
}

// Select random pool questions
function selectRandomPoolQuestions(poolName, count)
{
    poolSize = QUESTION_POOL[poolName]?.length ?? 0;

    let questions = [];
	// Select the random questions;
	for(var idx = 0; idx < count; idx++)
	{
		let rand_id = Math.floor(Math.random()*poolSize);
        rand_question = QUESTION_POOL[poolName][rand_id]
        questions.push(rand_question);
	}

    return questions;
}

// Get the questions from a specific list;
function getGameQuestions(listName, questionType, successCallback, failureCallback)
{
     // Determine if we are getting the fast money questions;
     let getFastMoney = questionType.toLowerCase().includes("fast");
     let expectedQuestions = (getFastMoney) ? 5 : 4;
     
    // Attempt to get the list of cards from the Trello list based on name
    MyTrello.get_cards_by_list_name(listName.toUpperCase(), (cardData)=>{

        let cardResp = myajax.GetJSON(cardData.responseText);

        // Sort the cards based on their Trello pos
        let theCards = cardResp.sort((a,b)=>{
			return a.pos - b.pos;
		});

        // Loop through the cards and setup
        theCards.forEach( (question)=>{

            let cardLabels = question["idLabels"];
            let is5answer = cardLabels.includes(TRELLO_LABELS["5 answers"]);
            let is6answer = cardLabels.includes(TRELLO_LABELS["6 answers"]);
            let is7answer = cardLabels.includes(TRELLO_LABELS["7 answers"]);
            let is8answer = cardLabels.includes(TRELLO_LABELS["8 answers"]);
            let isFastMoney = cardLabels.includes(TRELLO_LABELS["Fast Money"]);

            let isEligibleCard = (getFastMoney) ? (isFastMoney) : (is5answer || is6answer || is7answer || is8answer)
            if(isEligibleCard)
            {
                let cardID = question["id"];
                MyTrello.get_single_card(cardID, (cardData)=>{
                    let cardResp = myajax.GetJSON(cardData.responseText);

                    let pos = cardResp["pos"];
                    QUESTIONS[pos] = cardResp;
                    QUESTION_KEYS = Object.keys(QUESTIONS);

                    if(QUESTION_KEYS.length == expectedQuestions)
                    {
                        // Call the success callback
                        successCallback();
                    }
                });
            }
        });

        
    }, 
    // If cannot find that list;
    (data)=>{
        failureCallback();
    });
}


// Select the next question from the set of questions
function getNextQuestion(roundNumber)
{
    let question = undefined;
    if(roundNumber <= QUESTION_KEYS.length)
    {
        question = QUESTIONS[ QUESTION_KEYS[roundNumber-1] ];
    }
    return question;
}