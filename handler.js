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
    let option = slots.NumericAnswer.value;
    let text = '';
    if(session.attributes.stage === 'select_option'){
        console.log(session.attributes.tours);        
        let selectedTour = session.attributes.tours[option-1];
        console.log(selectedTour);
        text += `You selected ${selectedTour.name}. `;
        text += 'Would you like to make a reservation?';
        session.attributes.selectedTour = selectedTour;
        session.attributes.stage = 'ask_reservation';        
    }
    else if(session.attributes.stage === 'ask_adults'){
        text += `Making reservation for ${option} adults. How many children?`;
        session.attributes.adults = option;
        session.attributes.stage = 'ask_children';
    }
    else if(session.attributes.stage === 'ask_children'){
        text += `Adding ${option} children to your reservation. To complete the process please give me your first name.`;
        session.attributes.stage = 'ask_firstName';
    }
    response.say(text);
}

exports.AnswerBoolean = (slots, session, response) => {
    console.log(slots.BoolAnswer.value);
    console.log(session.attributes.stage);
    if(session.attributes.stage === 'ask_reservation'){
        let answer = slots.BoolAnswer.value;
        let text = '';
        if(answer === 'yes'){
            session.attributes.stage = 'ask_adults';
            text += 'How many adults?';
        }
        else {
            text += 'OK, please let me know if I can further assist you';
        }
        response.say(text);
    }
}

exports.AnswerFirstName = (slots, session, response) => {
    console.log(slots.firstName.value);
    let firstName = slots.firstName.value;
    let text = '';
    if(session.attributes.stage === 'ask_firstName'){
        text += `Thank you ${firstName}, can I have your last name?`;
        session.attributes.firstName = firstName;
        session.attributes.stage = 'ask_lastName';
    }
    else{
        text += `Hello, ${firstName}!`;
    }
    response.say(text);
}

