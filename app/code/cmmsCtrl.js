;(function(){
	'use strict';
	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',
		function(Session) {

			// if not logged in, then raise the login dialog
			console.log('Running cmmsCtrl')

			angular.extend(this,{
				Session: Session,
				logout: function() {
					Session.logout()
				},

			})

		})

})()

