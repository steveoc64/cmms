;(function(){
	'use strict';
//	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('cmmsCtrl',	function($scope,$rootScope,Session,LxNotificationService) {

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

			$rootScope.Session = Session

		})

})()



