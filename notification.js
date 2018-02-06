'use strict';
var _ = require("lodash");
var request = require('request');

function Notification() {

    function notifyMobile(products, callback) {
        console.log('Notify mobile');
        console.log(JSON.stringify(products));
        var productsDisplayItem = _(products).map(function (product) {
            return product.display;
        });

        console.log('Display information');
        console.log(JSON.stringify(productsDisplayItem));

        var body = {
           // to: "ExponentPushToken[unMNikAIAcmtF4mjtyEr1z]",
			to: "ExponentPushToken[rar1snKU0QE5QH1cYyrnbx]",
            title: "Viavoice",
            body: "Select your option",
            data: {
                products: productsDisplayItem
            }
        };

        var postOption = {
            uri: 'https://exp.host/--/api/v2/push/send',
            body: JSON.stringify(body),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        request(postOption, function (err, response) {
            if (err) {
                console.log(JSON.stringify(err));
            } else {
                console.log('Status ' + JSON.stringify(response));                
            }

            callback();
        });
    }

    return {
        notifyMobile: notifyMobile
    }
}

module.exports = new Notification();