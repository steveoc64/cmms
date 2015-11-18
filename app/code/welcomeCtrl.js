;(function(){
	'use strict';
	console.log('Inside the welcomeCtrl code file')

	angular.module('cmms').controller('welcomeCtrl',
		function($state, $stateParams, LxDialogService, $timeout) {

			// if not logged in, then raise the login dialog
			console.log('Running welcomeCtrl')

			// Wait for a couple of secs ... then move on to login screen
			/*
			$timeout(function() {
				$state.go('login')
				console.log('jump to login')
			}, 2000)
*/
		})

})()
