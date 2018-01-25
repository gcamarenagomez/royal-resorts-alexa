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
                ${where} LIMIT 5`;
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


login();

exports.org = org;
exports.findTours = findTours;