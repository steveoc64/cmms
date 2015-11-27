;(function(){
	'use strict';
//	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('headerCtrl',	function($state,Session,DBLogout,LxNotificationService,localStorageService) {

			angular.extend(this,{
				session: Session,
				logout: function() {
					DBLogout.logout()
					Session.logout()
					LxNotificationService.warning('Logged Out')
					$state.go('home')
					localStorageService.remove('token')
					localStorageService.remove('session')
				}
					  			

			})

		})

})()

