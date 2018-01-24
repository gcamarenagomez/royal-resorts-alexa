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
        if(params.city) parts.push(`City__c='${params.city}'`);
        if(parts.length>0){
            where = "WHERE " + parts.join(' AND ');
        }
    }
    return new Promise((resolve, reject) => {
        let q = `SELECT Id, Name, Short_Description__c 
                FROM Tour__c 
                ${where} LIMIT 5;
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

let findProperties = (params) => {
    let where = "";
    if (params) {
        let parts = [];
        if (params.id) parts.push(`id='${params.id}'`);
        if (params.city) parts.push(`city__c='${params.city}'`);
        if (params.bedrooms) parts.push(`beds__c=${params.bedrooms}`);
        if (params.priceMin) parts.push(`price__c>=${params.priceMin}`);
        if (params.priceMax) parts.push(`price__c<=${params.priceMax}`);
        if (parts.length>0) {
            where = "WHERE " + parts.join(' AND ');
        }
    }
    return new Promise((resolve, reject) => {
        let q = `SELECT id,
                    title__c,
                    address__c,
                    city__c,
                    state__c,
                    price__c,
                    beds__c,
                    baths__c,
                    picture__c
                FROM property__c
                ${where}
                LIMIT 5`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject(err);
            } else {
                resolve(resp.records);
            }
        });
    });

};

let findCases = (params) => {
    let where = "";
    if(params){
        let parts = [];
        if(params.pnr) parts.push(`pnr__c='${params.pnr}'`);
        if(parts.length>0){
            where = "WHERE " + parts.join(' AND ');
        }
    }
    return new Promise((resolve, reject) => {
        let q = `SELECT Id, CaseNumber, Status, Priority, Origin, pnr__c, Subject, Description, LastModifiedDate FROM Case ${where} LIMIT 1`;
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

let findPriceChanges = () => {
    return new Promise((resolve, reject) => {
        let q = `SELECT
                    OldValue,
                    NewValue,
                    CreatedDate,
                    Field,
                    Parent.Id,
                    Parent.title__c,
                    Parent.address__c,
                    Parent.city__c,
                    Parent.state__c,
                    Parent.price__c,
                    Parent.beds__c,
                    Parent.baths__c,
                    Parent.picture__c
                FROM property__history
                WHERE field = 'Price__c'
                ORDER BY CreatedDate DESC
                LIMIT 3`;
        org.query({query: q}, (err, resp) => {
            if (err) {
                reject("An error as occurred");
            } else {
                resolve(resp.records);
            }
        });
    });
};


let createCase = (propertyId, customerName, customerId) => {

    return new Promise((resolve, reject) => {
        let c = nforce.createSObject('Case');
        c.set('subject', `Contact ${customerName} (Facebook Customer)`);
        c.set('description', "Facebook id: " + customerId);
        c.set('origin', 'Facebook Bot');
        c.set('status', 'New');
        c.set('Property__c', propertyId);

        org.insert({sobject: c}, err => {
            if (err) {
                console.error(err);
                reject("An error occurred while creating a case");
            } else {
                resolve(c);
            }
        });
    });

};

login();

exports.org = org;
exports.findTours = findTours;
exports.findProperties = findProperties;
exports.findPriceChanges = findPriceChanges;
exports.createCase = createCase;
exports.findCases = findCases;