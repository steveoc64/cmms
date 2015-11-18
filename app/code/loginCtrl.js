;(function(){
	'use strict';
	console.log('Inside the loginCtrl code file')

	angular.module('cmms').controller('loginCtrl',
		function($state, $stateParams, LxDialogService) {

			// if not logged in, then raise the login dialog
			console.log('Not logged in, so open the login dialog')
			LxDialogService.open('loginDialog')

			angular.extend(this,{
				loginState: 'loggedIn',

				openDialog: function() {
					console.log('Opening Dialog')
					LxDialogService.open('loginDialog')
				},
				closeDialog: function() {
					LxNotificationService.info('Dialog Closed')
				},
				login: function() {
					console.log('Login !!')
					$state.go('admin')
					LxDialogService.close('loginDialog')
				},
			})
		})

})()
