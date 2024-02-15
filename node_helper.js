/* Magic Mirror
 * Node Helper: MMM-MathExcercises
 *
 * By Bas Knol
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({

	start: function () {
		Log.log(this.name + " is started!");
	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the notification.
	 * argument payload mixed - The payload of the notification.
	 */
    socketNotificationReceived: function (notification, payload) {
		Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);

        var self = this;
		if (notification === "SET_CONFIG") {
            this.config = payload; 
		}
	},
});