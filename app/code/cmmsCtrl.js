;(function(){
	'use strict';
//	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',	function($scope,Session,LxNotificationService) {

			// if not logged in, then raise the login dialog
			console.log('.. cmmsCtrl')

			angular.extend(this,{
				label: 'cmmsCtrl',
				session: Session,
				getLoginState: function() {
					return 'login state'
				},
				logout: function() {
					Session.logout()
				},

			})

		})

})()

