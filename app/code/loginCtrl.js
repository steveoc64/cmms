;(function(){
	'use strict';
	console.log('Inside the loginCtrl code file')

	angular.module('cmms').controller('loginCtrl', 
		function($state, $stateParams) {

			angular.extend(this,{
				loginState: 'loggedIn'
			})

	})

})()