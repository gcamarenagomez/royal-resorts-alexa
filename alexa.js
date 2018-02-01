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

    let play = (text, shouldEndSession) => {
        let outputSpeech = {};
        outputSpeech.type = 'PlainText';
        outputSpeech.text = text;
        res.json({
            version: req.version,
            sessionAttributes: session.attributes,
            response: {
                outputSpeech: outputSpeech,
                directives: [
                    {
                        "type" : "AudioPlayer.Play",
                        "playBehavior" : "REPLACE_ALL",
                        "audioItem" : {
                            "stream" : {
                                "token" : "Song Playback",
                                "url" : session.attributes.url,
                                "offsetInMilliseconds" : 5000
                            }
                        }
                    }
                ]
            }
        });
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