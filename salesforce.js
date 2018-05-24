"use strict";

let nforce = require('nforce'),

    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    SF_USER_NAME = process.env.SF_USER_NAME,
    SF_PASSWORD = process.env.SF_PASSWORD;

let org = nforce.createConnection({
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/oauth/_callback',
    mode: 'single',
    autoRefresh: true
});

let login = () => {
    org.authenticate({username: SF_USER_NAME, password: SF_PASSWORD}, err => {
        if (err) {
            console.error("Authentication error");
            console.error(err);
        } else {
            console.log("Authentication successful");
        }
    });
};

let findTours = (params) => {
    console.log('City: ' + params.city);
    let where = "";
    if(params){
        let parts = [];
        parts.push(`Active__c=true`);
        if(params.city) parts.push(`City__c includes ('${params.city}')`);
        if(parts.length>0){
            where = "WHERE " + parts.join(' AND ');
        }
    }
    return new Promise((resolve, reject) => {
        let q = `SELECT Id, Name, Short_Description__c, Price__c  
                FROM Tour__c 
                ${where} ORDER BY Name LIMIT 5`;
        org.query({query: q}, (err, resp) => {
            if(err){
                reject(err);
            }
            else{
                resolve(resp.records);
            }
        });
    });
};

let makeReservation = (session) => {
    console.log('Session ' + session.attributes.selectedTour.id);
    return new Promise((resolve, reject) => {
        let rez = nforce.createSObject('Tour_Reservation__c');
        console.log(session.attributes.adults);
        console.log(session.attributes.children);
        rez.set('Tour__c', session.attributes.selectedTour.id);
        rez.set('Contact_First_Name__c', session.attributes.firstName);
        rez.set('Contact_Last_Name__c', session.attributes.lastName);
        rez.set('Adults__c', parseInt(session.attributes.adults));
        rez.set('Children__c', session.attributes.children);
        rez.set('Reservation_Date__c', session.attributes.date);
        rez.set('Reservation_Time__c', session.attributes.time);
        org.insert({sobject: rez}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a reservation");
            } else {
                resolve(rez);
            }
        });
    });
};

let createServiceRequest = (slot) => {
    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Case');
        console.log('Request: ' + slot);
        c.set('AccountId', '0011N00001DBLiPQAX');
        c.set('Status', 'New');
        c.set('Priority', 'Medium');
        c.set('Origin', 'Alexa');
        c.set('Subject', 'More Towels');
        c.set('Type', 'Room Support');
        c.set('Description', 'Alexa ask Royal Resorts for more towels');
        org.insert({sobject: c}, err => {
            if(err){
                console.error(err);
                reject("An error occurred while creating the service request");
            }
            else{
                resolve(c);
            }
        });
    });
};


login();

exports.org = org;
exports.findTours = findTours;
exports.makeReservation = makeReservation;
exports.createServiceRequest = createServiceRequest;