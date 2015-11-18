;(function(){
	'use strict';
	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',
		function($state, $stateParams, LxDialogService, Session, $timeout) {

			// if not logged in, then raise the login dialog
			console.log('Running cmmsCtrl', Session)

			angular.extend(this,{
				openLoginDialog: function() {
					console.log('Opening Dialog from inside cmms controller')
					LxDialogService.open('loginDialog')
				},
				closeLoginDialog: function() {
					LxNotificationService.info('Login Dialog Closed')
				},
				login: function() {
					console.log('Login !!')
					LxDialogService.close()
				},
				scrollEndDialog: function() {
					console.log('scrollEndDialog')
				}
			})
		})

})()
