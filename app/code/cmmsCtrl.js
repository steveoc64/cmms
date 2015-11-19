;(function(){
	'use strict';
	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',	function($scope,Session,LxNotificationService) {

			// if not logged in, then raise the login dialog
			console.log('Running cmmsCtrl', Session)

			angular.extend(this,{
				session: Session,
				logout: function() {
					Session.logout()
					console.log('Session is now',Session)
				},

			})

		})

})()

