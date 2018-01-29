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
                text += 'Which tour would you like?';
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

exports.romance = (slots, session, response) => {
    response.say('<audio src="https://s3.amazonaws.com/connect-32ae937f641e/carlesswhisper.mp3?response-content-disposition=inline&X-Amz-Security-Token=AgoGb3JpZ2luECoaCXVzLXdlc3QtMSKAAjBrVbdpka2d2KYQIdC%2FJ6h90DfDsbbBe6NoMAdOlnedpWyatfs%2FXSRpE2M3xJW0Sn2cSKxP2dIntxPj2g2z0i%2BwxO%2BAc6gBqbZ%2BmvszkCQ7QSTc%2BDtBcrnmEXfRZi%2BAzK3xKveHvxyQhKc%2BNGKhnpgdFrcWeJS4t8uOf8kf68Lz4reEg2wwBjQQyGS3DhK%2BgLqxv%2FB4tdTRitb8YQIofWmbSerl8YZFGFz7tBW65oRMhtpqaomRkpQJr70x%2BKN5CidWRW6C7ZiPCg63rcobeQkY11JRZMIci4h2mXnAyCqQYoAWhSEHMmIQ7zqOd9XLLURqtYYQqcZqsxWlTo90KKUqzwII3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwzODcyNjI2NzE2MDMiDNmnB9qh73N2GY8PxSqjAgmnwJs75TPQGPLJBR8TbWospHMCx0ild50VxqFLUl8NnpoHFCQx7mkNn2AqsLkYalQEA7%2BMLkYKcfDxzBmgB4Wxy7cwkGZ%2BDAnT3fLnSgFwVXhJ7u2f1We0TwU5At5FpDM6Gl2Fb0k8kuIyBsOUUa6OPJUnmKWQKPLw%2BH8K%2F4GT3utWUqnQNCF5Wa53SPYXEXUAEauR8GG8zxEsh%2FLDAv%2FtamvXhkKjtgtXoBnMRdiIahgWF6Lft1yrNQ7f1deAKDt%2F5dpq9QhMX%2Bd2FEKGgjsfGg5ghbKWEUa98rF%2BSGQDq9cmNDqpvJB27%2Bxsd82%2F8YgvCjkkZwh%2FOXWPL2VHfH2JGhku%2FO2I6P%2FqfiWbDmFIMxVLLniDZK%2BJ0%2F6i3NQP0b0hbDClr77TBQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20180129T215359Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAJ65V4TNLHSOVYUOQ%2F20180129%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=fd0d36053c517dcfb333d74c91f38da1ab6b58c88ebb3a0b437a9d11a3708616" />');
}