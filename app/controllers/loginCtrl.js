;(function(){
	'use strict';
//	console.log('Inside the cmmsCtrl code file')

	angular.module('cmms').controller('loginCtrl',	function($scope,$state,Session,Menu,DBLogin,LxNotificationService) {

			// if not logged in, then raise the login dialog
			console.log('Running loginCtrl', Menu)

			angular.extend(this,{
				session: Session,
				menu: Menu,
        username: '',
        passwd: '',
        login: function() {
        	//console.log('Calling login from loginpage',Session)
          // First, get login creds from login service
          var vm = this
          DBLogin.login({
            username: this.username,
            passwd: this.passwd
          },function(retval,r){
            //console.log('login from dialog OK', retval)
            Session.loggedIn = true
            Session.uid = retval.ID
            Session.username = retval.Username
            Session.role = retval.Role
            Session.token = retval.Token
            Session.site = retval.Site
            Session.siteName = retval.SiteName.String
            Session.toState = Session.fromState = ''
            $state.go('landing')
          },function(){
            LxNotificationService.warning('Login Failed ...')
          })
        }, // login fn
			}) // extend this

		}) // controller

})()

