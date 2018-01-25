"use strict";

let salesforce = require("./salesforce");

exports.searchDeals = (slots, session, response) => {
    session.attributes.stage = 'ask_city';
    response.ask("OK, in what city?");
}


exports.city = (slots, session, response) => {
    if(session.attributes.stage === 'ask_city'){
        salesforce.findTours({city: slots.CityName.value})
        .then(tours => {
            session.attributes.tours = tours;
            if(tours && tours.length>0){
                session.attributes.stage = 'select_option';
                let text = `OK, here are the tours I found near ${slots.CityName.value}: `;
                let i = 1;
                tours.forEach(t => {
                    text += `Tour ${i}: ${t.get('Name')}, ${t.get('Short_Description__c')}. Price: ${t.get('Price__c')} US Dollars. `;
                    i += 1;
                });
                text += 'Which tour would you like?';
                response.say(text);
            }
            else{
                response.say(`Sorry, I did not find any tours in ${slots.CityName.value}`)
            }
        })
        .catch((err)=>{
            console.error(err);
            response.say('Oops... Something went wrong');
        });
    }
    else{
        response.say("Sorry, I didn't understand that");
    }
}

exports.AnswerNumber = (slots, session, response) => {
    if(session.attributes.stage === 'select_option'){
        console.log(session.attributes.tours);
        let option = slots.NumericAnswer.value - 1;
        let selectedTour = session.attributes.tours[option];
        console.log(selectedTour);
        let text = `You selected ${selectedTour.name}. `;
        text += 'Would you like to make a reservation?';
        response.say(text);
        session.attributes.selectedTour = selectedTour;
        session.attributes.stage === 'ask_reservation';
    }
}

exports.AnswerBoolean = (slots, session, response) => {
    if(session.attributes.stage === 'ask_reservation'){
        let answer = slots.BoolAnswer.value;
        let text = '';
        if(answer === 'Yes'){
            text += 'How many adults?';
        }
        else {
            text += 'Fuck off then asshole';
        }
        response.say(text);
    }
}

