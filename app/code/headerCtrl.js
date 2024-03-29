;(function(){
	'use strict';
//	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('headerCtrl',	function($state,Session,DBLogout,LxNotificationService,$localStorage) {

			angular.extend(this,{
				session: Session,
				logout: function() {
					DBLogout.logout()
					Session.logout()
					LxNotificationService.warning('Logged Out')
					$state.go('home')
					delete $localStorage.token
					delete $localStorage.session
				},
				goHome: function() {
					console.log('clicked on header bar')
					if (Session.loggedIn) {
						$state.go('landing')
					}
				},
				profile: function() {
					console.log('clicked on user profile')
				}
					  			
			})

		})

})()

