"use strict";

module.exports = (req, res) => {

    let session = req.body.session,
        intent,
        slots;
    session.attributes = session.attributes || {};

    if (req.body.request.intent) {
        intent = req.body.request.intent.name;
        slots = req.body.request.intent.slots;
    }

    let say = (text, shouldEndSession) => {

        let outputSpeech = {};

        if (text.indexOf("/>") > 0 || text.indexOf("</")) {
            outputSpeech.type = 'SSML';
            outputSpeech.ssml = "<speak>" + text + "</speak>";
        } else {
            outputSpeech.type = 'PlainText';
            outputSpeech.text = text;
        }

        res.json({
            version: req.version,
            sessionAttributes: session.attributes,
            response: {
                outputSpeech: outputSpeech,
                shouldEndSession: shouldEndSession
            }
        });

    };

    let play = (url, shouldEndSession) => {
        let outputSpeech = {};
        let directives = [];
        let directive = {};
        let audioItem = {};
        let stream = {};
        directive.type = 'AudioPlayer.Play';
        directive.playBehavior = 'REPLACE_ALL';
        stream.url = 'https://music.amazon.com/user-playlists/db0a5bd6b4924ea29174995b63c7ea66sune?ref=dm_sh_a376-0661-dmcp-3243-7193e&musicTerritory=US&marketplaceId=ATVPDKIKX0DER';
        audioItem.stream = stream;
        directive.audioItem = audioItem;
        directives.push(directive);

        res.json({
            version: req.version,
            sessionAttributes: session.attributes,
            response: {
                outputSpeech: outputSpeech,
                directives: directives
            }
        });
        console.log(res);
    };

    return {

        type: req.body.request.type,

        intent: intent,

        slots: slots,

        session: session,

        response: {
            say: text => say(text, true),
            ask: text => say(text, false),
            play: text => play(text, true)
        }

    };

};