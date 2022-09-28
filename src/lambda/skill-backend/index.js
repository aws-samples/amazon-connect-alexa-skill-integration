/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const AWS = require("aws-sdk");

/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Fitness Geek, your choice in healthier life.  How can I help?";

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .getResponse();
  },
};

const PersonalTrainerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "PersonalTrainerIntent";
  },
  handle(handlerInput) {
    const speechText = "Sure.  To get more details, I can have a trainer call you or text chat with you now.  You can say speak with a trainer or chat with a trainer.";
    return handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const TrainerCallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
    && handlerInput.requestEnvelope.request.intent.name === "TrainerCallbackIntent";
  },
  handle(handlerInput) {
    
    
    let cbPhoneNumber = null;
        try {
          const cbPhoneNumberSlot = handlerInput.requestEnvelope.request.intent.slots.callbackPhoneNumber.value;
          cbPhoneNumber = `+1${cbPhoneNumberSlot}`;
        } catch (err) {
          throw new Error("Could not resolve the phone number, goodbye!");
        }
        
    var connect = new AWS.Connect();
    var params = {
      DestinationPhoneNumber:process.env.DestinationPhoneNumber,
      ContactFlowId:process.env.ContactFlowId,
      InstanceId:process.env.InstanceId,
      QueueId:process.env.QueueId,
      Attributes:{
        "CallbackNumber": cbPhoneNumber
      }
    };
    
    try {
      connect.startOutboundVoiceContact(params, function(err, data) {
        if (err) {
          console.log("Error in adding call= "+err);
          console.log(err, err.stack) ;
        }
        else console.log(data);
      });
   
    } 
    catch (e){
    };  
      
    const speechText = "A certified trainer will call you back later today.  Now, anything else I can help you with?";
    return handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const ChatWithTrainerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
    && handlerInput.requestEnvelope.request.intent.name === "ChatWithTrainerIntent";
  },
  handle(handlerInput) {
    
    let toPhoneNumber = null;
        try {
          const toPhoneNumberSlot = handlerInput.requestEnvelope.request.intent.slots.chatPhoneNumber.value;
          toPhoneNumber = `+1${toPhoneNumberSlot}`;
        } catch (err) {
          throw new Error("Could not resolve the phone number, goodbye!");
        }
        
    var params = {
      PhoneNumber:toPhoneNumber,
      Message: "Fitness Geek: please click on this link and chat widget: <YOUR WEBSITE URL HERE WITH CHAT WIDGET>", 
    };
    console.log("In Chat intent handler, params= "+JSON.stringify(params))
    
    try{
      var SNS = new AWS.SNS();
      SNS.publish(params, function(err, data) {
        if (err){
          console.log("Error in sending sms= "+err);
          console.log(err.err.stack);
        
        }
      });

    }
   catch(e){
    console.log("Exception in sending SMS= "+e)
   }
    
    const speechText = "We have sent you a text to your mobile number.  Please open the link and click on the chat widget to chat with one of our agent.  Now, anything else I can help you with?";

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const FallBackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
    && (handlerInput.requestEnvelope.request.intent.name === "AMAZON.FallbackIntent");
  },
  handle(handlerInput) {
    const speechText = "Oops, sorry I did not understand that. You can ask to speak to a trainer or to chat to a trainer to get help";

    return handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .withShouldEndSession(false)
    .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
    && handlerInput.requestEnvelope.request.intent.name === "HelloWorldIntent";
  },
  handle(handlerInput) {
    const speechText = "Hello World";

    return handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard("Hello World", speechText)
    .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
    && handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent";
  },
  handle(handlerInput) {
    const speechText = "You can say things like: speak to a trainer or chat with a trainer";

    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
    && (handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent"
    || handlerInput.requestEnvelope.request.intent.name === "AMAZON.StopIntent");
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard("Fitness Geek", speechText)
    .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
    .speak("Sorry, I can\"t understand the command. Please say again.")
    .reprompt("Sorry, I can\"t understand the command. Please say again.")
    .getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    PersonalTrainerIntentHandler,
    TrainerCallbackIntentHandler,
    ChatWithTrainerIntentHandler,
    FallBackIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
