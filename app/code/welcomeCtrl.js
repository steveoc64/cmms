;(function(){
	'use strict';
	console.log('Inside the welcomeCtrl code file')

	angular.module('cmms').controller('welcomeCtrl',
		function($state, $stateParams, LxDialogService, Session, $timeout) {

			// if not logged in, then raise the login dialog
			console.log('Running welcomeCtrl', Session)

			angular.extend(this,{
				openDialog: function() {
					console.log('Opening Dialog from inside welcome controller')
					LxDialogService.open('loginDialog')
				},
				closeDialog: function() {
					LxNotificationService.info('Login Dialog Closed')
				},
				login: function() {
					console.log('Login !!')
					LxDialogService.close('loginDialog called from welcome')
//					$state.go('admin')
				},
			})


			// Wait for a couple of secs ... then move on to login screen
			/*
			$timeout(function() {
				$state.go('login')
				console.log('jump to login')
			}, 2000)
*/
		})

})()
