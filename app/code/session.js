;(function() {
	'use strict';

	angular.module('cmms').service('Session', function(){
	
		return {
			loggedIn: false,
			username: '',
			role: '',
		}	
	})
})