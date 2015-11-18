;(function(){
	'use strict';
	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',
		function($rootScope, $scope, $state, $stateParams, LxDialogService, LxNotificationService, Session, $timeout) {

			// if not logged in, then raise the login dialog
			console.log('Running cmmsCtrl', Session)

			angular.extend(this,{
			})

		})

})()

