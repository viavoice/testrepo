'use strict';
var Alexa = require("alexa-sdk");
var Catalog = require('./catalog');
var catalogData = require('./catalogData');
var util = require('./util');
var notification = require('./notification');
var _ = require("lodash");
var SessionHandler = require('./sessionHandler')

// For detailed tutorial on how to making a Alexa skill,
// please visit us at http://alexa.design/build

exports.handler = function (event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var catalogService = new Catalog(catalogData);

var handlers = {
    'LaunchRequest': function () {
        var speech = 'Welcome to buy natures basket powered by viavoice. What you like to buy today ?';
        this.emit(':ask', speech, speech);
    },
    'InvalidInputTryAgain': function (possibleValues) {
        var speech = 'I’m sorry, The product you requested is not available';
        this.emit(':ask', speech, speech);
    },
    'QUANTITY_INTENT': function (quantity) {
        var speech = 'How much you want?';
        this.emit(':ask', speech, speech);
    },
    'ProductMatched': function (product) {
        var description = util.getProductShortDescription(product);
        var speech = 'Okay. Adding ' + description + ' to cart. You want to continue shopping or checkout';
        this.emit(':ask', speech, speech);
    },
    'CONTINUE_SHOPPING_INTENT': function () {
        var speech = 'oh great. What you like to buy';
        this.emit(':ask', speech, speech);
    },
    'CHECKOUT_INTENT': function () {
        var sessionHandler = new SessionHandler(this.attributes);
        var cartItems = sessionHandler.getCartItems();

        if (!cartItems || cartItems.length == 0) {
            var speech = 'Nothing in the cart to checkout. What you like to buy today ?';
            this.emit(':ask', speech, speech);
            return;
        }

        var description = 'List of items for checkout, ';
		var compute = 'hey, ';
        var msg = 'Amount Payable is rupees ';
        var total = 0;
		var thnum;
		var numberPattern = /\d+/g;
        _.each(cartItems, function (item, index) {
            compute += ' ' + util.getProductShortDescription(item);	
        })
        thnum = compute.match( numberPattern );
         var len = thnum.length;
         if(len == 1)
         {
         total = thnum[0];
         }
         else if(len == 2)
         {
             total = Number(thnum[0])+Number(thnum[1]);
         }
         else if(len == 3)
         {
             total = Number(thnum[0])+Number(thnum[1])+Number(thnum[2]);
         }
         else if(len == 4)
         {
             total = Number(thnum[0])+Number(thnum[1])+Number(thnum[2])+Number(thnum[3]);
         }
         else if(len == 5)
         {
            total = Number(thnum[0])+Number(thnum[1])+Number(thnum[2])+Number(thnum[3])+Number(thnum[4]);
         }

		//thnum.toString();
		msg += ' '+total+'Please say Pay to proceed';
        this.emit(':ask', msg, msg);
        
    
		
       
		//this.emit(':tell', description, description);
       // this.emit(':tell', description, description);
    },
	'PAYMENT_INTENT': function(method) {
		var speech = 'Select your payment method by saying cash on delivery or net banking or card payment.';
		this.emit(':ask', speech, speech);
	},
	'FINAL_INTENT': function() {
		var speech = 'Your order is placed successfully it will be delivered to your registered address in 3 working days';
		this.emit(':tell', speech, speech);
		sessionHandler.clearAll();
		 
	},
    'SHOW_IN_MOBILE': function () {
        var sessionHandler = new SessionHandler(this.attributes);
        if (sessionHandler.isNewSession() || _.isEmpty(sessionHandler.getAllSelectedProperties())) {
            var speech = 'Nothing to show in mobile. What you like to buy today?';
            this.emit(':tell', speech, speech);
            return;
        }

        var products = catalogService.getMatchedProducts(sessionHandler.getAllSelectedProperties());
        notification.notifyMobile(products, function() {
            var speech = 'Information sent to your mobile.  Please say your option';
            this.emit(':ask', speech, speech);
        }.bind(this));
		
    },
    'DYNAMIC_INPUT_INTENT': function () {
        var sessionHandler = new SessionHandler(this.attributes);
        var input = util.getInput(this.event.request);
        console.log(input);

        if (sessionHandler.isNewSession()) {
            var propName = sessionHandler.getQueryPropName();
            var possibleValues = catalogService.getPossibleValues(propName);
            sessionHandler.setPossibleValues(possibleValues);
        }

        if (!util.validateInput(sessionHandler.getPossibleValues(), input)) {
            this.emit('InvalidInputTryAgain', sessionHandler.getPossibleValues());
            return;
        }

        sessionHandler.addSelectedProperty(sessionHandler.getQueryPropName(), input);

        var product = catalogService.getProduct(sessionHandler.getAllSelectedProperties());
        if (!_.isEmpty(product)) {
            sessionHandler.addToCart(product);
            sessionHandler.clearQuery();

            this.emit('ProductMatched', product);
            return;
        }

        var nextProperty = catalogService.getTopRatioProperty(sessionHandler.getAllSelectedProperties());
        if (!_.isEmpty(nextProperty)) {
            sessionHandler.setQueryProperty(nextProperty.name, nextProperty.possibleValues);
            sessionHandler.appendSelectedProperties(nextProperty.directKeys);

            var speech = util.getPossibleInputs(nextProperty.possibleValues);
            this.emit(':ask', speech, speech);
            return;
        }
    },
    'MyNameIsIntent': function () {
        this.emit('SayHelloName');
    },
    'SayHello': function () {
        this.response.speak('Hello World!')
            .cardRenderer('hello world', 'hello world');
        this.emit(':responseReady');
    },
    'SayHelloName': function () {
        var name = this.event.request.intent.slots.name.value;
        this.response.speak('Hello ' + name)
            .cardRenderer('hello world', 'hello ' + name);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak("You can try: 'alexa, hello world' or 'alexa, ask hello world my" +
            " name is awesome Aaron'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, hello world'" +
            " or 'alexa, ask hello world my name is awesome Aaron'");
    }
};