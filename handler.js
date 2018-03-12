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
                    text += `Tour ${i}: ${t.get('Name')}. Price: ${t.get('Price__c')} US Dollars. `;
                    i += 1;
                });
                text += 'Which tour would you like? Remeber you have a 10% discount for Tour Two.';
                response.ask(text);
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
        text += `Adding ${option} children to your reservation. When do you wish to take the tour?`;
        session.attributes.children = option;
        session.attributes.stage = 'ask_date';
    }
    response.ask(text);
}

exports.AnswerBoolean = (slots, session, response) => {
    console.log(slots.BoolAnswer.value);
    console.log(session.attributes.stage);
    let answer = slots.BoolAnswer.value;
    let text = '';
    if(session.attributes.stage === 'ask_reservation'){        
        if(answer === 'yes'){
            session.attributes.stage = 'ask_adults';
            text += 'How many adults?';
        }
        else {
            text += 'OK, please let me know if I can further assist you';
        }
        response.ask(text);
        
    }
    else if(session.attributes.stage === 'confirm_rez'){
        console.log('Confirm rez stage');
        text += `Excellent, ${session.attributes.firstName}. Your reservation has been confirmed.`;
        if(answer === 'yes'){
            salesforce.makeReservation(session)
            .then(rez => {
                console.log('Reservation created successfully');
                
                console.log('Response: ' + text);
            })
            .catch((err)=> {
                console.error(err);
                text += 'Oops, something went wrong...';
            })
        }
        else{
            text += `Sorry to hear that. Please restart the process and try again.`;
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
    response.ask(text);
}

exports.AnswerLastName = (slots, session, response) => {
    console.log(slots.lastName.value);
    let lastName = slots.lastName.value;
    let text = '';
    if(session.attributes.stage === 'ask_lastName'){
        text += `Thank you. Your reservation is as follows: ${session.attributes.selectedTour.name}, for ${session.attributes.adults} adults and ${session.attributes.children} children on ${session.attributes.date} at ${session.attributes.time}. Reservation contact: ${session.attributes.firstName} ${lastName}. Is this OK?`;
        session.attributes.lastName = lastName;
        session.attributes.stage = 'confirm_rez';
    }
    response.ask(text);
}

exports.date = (slots, session, response) => {
    console.log(slots.resDate.value);
    let date = slots.resDate.value;
    let text = '';
    if(session.attributes.stage === 'ask_date'){
        text += `Setting your reservation date to ${date}. At what time should I book this tour?`;
        session.attributes.date = date;
        session.attributes.stage = 'ask_time';
    }
    response.ask(text);
}

exports.time = (slots, session, response) => {
    console.log(slots.resTime.value);
    let time = slots.resTime.value;
    let text = '';
    if(session.attributes.stage === 'ask_time'){
        text += `I haved booked a space for you at ${time}. Now, can I have your first name?`;
        session.attributes.time = time;
        session.attributes.stage = 'ask_firstName';
    }
    response.ask(text);
}

exports.roomSupport = (slots, session, response) => {

    salesforce.createServiceRequest('More towels')
    .then(c => {
        console.log('Service request created successfully');
    })
    .catch((err)=> {
        console.error(err);
    });
    response.say('Thank you. Your Service Request has been created successfully. The housekeeper will be with you shortly.');
}

exports.romance = (slots, session, response) => {
    session.attributes.url = 'https://s3.amazonaws.com/royal-resorts/GeorgeMichael-Careless+Whisper.mp3';
    response.play('Lets get romantic!!');
}

exports.party = (slots, session, response) => {
    session.attributes.url = 'https://s3.amazonaws.com/royal-resorts/Guns_N_Roses_-_Welcome_To_The_Jungle.mp3';
    response.play('Lets get this party started!!');
}

exports.introduceSpeaker = (slots, session, response) => {
    session.attributes.url = 'https://s3.amazonaws.com/royal-resorts/Thunderstruck-ACDC.mp3';
    response.play('Introducing the awesome Sales Engineering Team! I give you Cesar, Aldo, Christian, and Francisco');
}

exports.stopPlaying = (slots, session, response) => {
    session.attributes.url = 'https://s3.amazonaws.com/royal-resorts/Silence.mp3';
    response.play('Stopping playback.');
}