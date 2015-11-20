;(function(){
	'use strict';
//	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',	function($scope,Session,Menu,LxNotificationService) {

			// if not logged in, then raise the login dialog
			console.log('Running cmmsCtrl', Menu)

			angular.extend(this,{
				session: Session,
				menu: Menu,
				logout: function() {
					Session.logout()
				},

			})

		})

})()

