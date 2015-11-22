;(function() {
	'use strict';

	//console.log('Init app')

	angular.module('cmms', ['lumx','ui.router','ngResource'])
		.service('Session', session)
    .constant('ServerName', '')
    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })	
		.config(config)
		.run(run)
	    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })

  	function config($stateProvider, $urlRouterProvider, $locationProvider) {
	    $urlRouterProvider.otherwise('/');

	    $locationProvider.html5Mode({
	      enabled:false,
	      requireBase: false
	    });

	    $locationProvider.hashPrefix('!');

	    // Manually create all the routes here
	    $stateProvider
	    	.state('home',{
	    		url:'/',
	    		acl: '*',
	    		templateUrl:'templates/cmms.html',
	    		controller: 'cmmsCtrl as cmmsCtrl',
	    	})
	    	.state('login',{	// Special state with no template !!
	    		url: '/login',
	    		acl:'*',
	    		onEnter: function($state,Session,LxDialogService) {
	    			if (Session.fromState == '') {
	    				$state.go('home')
	    			} else {
		    			//console.log('Forcing a Login Screen, from',Session.fromState,'to',Session.toState)
							LxDialogService.open('loginDialog')	    				
	    			}
	    		},
	    	})
	      .state('landing',{
	      	url: '/landing',
	      	acl: 'landing',
	      	template: 'This is the landing page',
	      	controller: 'landingCtrl as landing',    	
	      })
	      .state('loginpage',{
	      	url: '/loginpage',
	      	acl: '*',
	      	templateUrl: 'templates/loginpage.html',
	      	controller: 'loginCtrl as login',    	
	      })
	      .state('homepage', {
	      	url: '/home',
	      	acl: '*',
	      	template: 'Home',
	      	controller: 'homeCtrl as home',
	      })
	      .state('public',{
	      	url: '/public',
	      	acl: '*',
	      	templateUrl: 'templates/public.html'	      	
	      })
	      .state('admin',{
	      	url: '/admin',
	      	acl: 'admin',
	      	abstract: true
	      	//templateUrl: 'templates/admin/dashboard.html',
	      	//controller: 'adminCtrl as admin'
	      })
		      .state('admin.dashboard',{
		      	url: '/dashboard',		
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/dashboard.html',
		      	controller: 'adminDashCtrl as adminDash',
		      })
		      .state('admin.users',{
		      	url: '/users',
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/users.html',
		      	controller: 'adminUserCtrl as adminUser',
		      })
		      .state('admin.sites',{
		      	url: '/sites',
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/sites.html',
		      	controller: 'adminSitesCtrl as adminSites',
		      })
		      .state('admin.eqiup',{
		      	url: '/equip',
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/equip.html',
		      	controller: 'adminEquipCtrl as adminEquip',
		      })
		      .state('admin.parts',{
		      	url: '/parts',
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/parts.html',
		      	controller: 'adminPartsCtrl as adminParts',
		      })
		      .state('admin.reports',{
		      	url: '/reports',
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/reports.html',
		      	controller: 'adminReportsCtrl as adminReports',
		      })
	      .state('worker',{
	      	url: '/worker',
	      	acl: 'worker',
	      	template: 'You are now in the worker area<br><a ui-sref="home">Home</a><br><a ui-sref="worker.timesheet">TimeSheets</a><hr><ui-view>Summary of Worker Details Here</ui-view>',
	      	controller: 'workerCtrl as worker',
	      })
		      .state('worker.timesheet',{
		      	url: '/timesheet',
		      	acl: 'worker',
		      	template: 'Lil bit of timesheet stuff here, in place of where the worker details were <a ui-sref="worker">Close</a>',
		      	controller: 'workerCtrl as worker',
		      })
	  }

	  function session(LxNotificationService,DBLogin,$state) {
	  	return {
	  		loggedIn: false,
	  		token: '',
	  		username: '',
	  		uid: 0,
	  		role: 'public',
	  		fromState: '',
	  		toState: '',
	  		site: 0,
	  		siteName: '',
	  		logout: function() {
	  			DBLogin.logout({id: this.uid})
	  			this.loggedIn = false
	  			this.username = ''
	  			this.role = 'public'
	  			this.fromState = ''
	  			this.toState = ''
	  			this.site = 0,
	  			this.uid = 0,
	  			this.siteName = '',
	  			LxNotificationService.warning('You are now Logged Out');
	  		}
	  	}
	  }

	function run($rootScope, $state, LxDialogService, LxNotificationService, Session) {
	  FastClick.attach(document.body);

		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		  	var acl = toState.acl
		  	//console.log('change to',toState.name,'Session=',Session)

		  	var allGood = false
		  	switch (toState.acl) {
		  		case 'landing':
		  			// This is the landing page, just need to be logged in correctly as any role
		  			// before being sent off to the correct homepage
		  			console.log('into the landing state, with session',Session)
		  			if (Session.loggedIn) {
		  				allGood = true
		  			}
		  			break
		  		case 'admin':
		  			switch (Session.role) {
		  				case 'admin':
		  					allGood = true
		  					break
		  				default:
				  			//console.log('This page requires admin access !',Session.username,':',Session.role)
				  			//LxNotificationService.warning('This page requires admin access')
		  					allGood = false
		  					break
		  			}
		  			break
		  		case 'worker':
		  			switch (Session.role) {
		  				case 'admin':
		  				case 'worker':
		  					allGood = true
		  					break
		  				default:
		  					allGood = false
				  			//LxNotificationService.warning('This page requires worker access')
				  			//console.log('This page requires worker access !',Session.username,':',Session.role)
		  					break
		  			}
		  			break
		  		case '*':
		  			allGood = true
		  			break
		  	}

		  	if (!allGood) {
		  		if (Session.loggedIn) {
			  		event.preventDefault()		  			
		  			// But we are already logged in - so just raise a notification, and then fail the state transition
		  			LxNotificationService.alert('Not for You!','Insufficient access level to visit that page', 
		  				'OK, Got it',
		  				function(answer) {
		  					$state.go(fromState.name)
		  				})
		  		} else {
		  			// Not even logged in, so present the user with the opportunity to login
			  		event.preventDefault()
			  		Session.fromState = fromState.name
			  		Session.toState = toState.name
			  		$state.go('login')
		  		}
				}
		 }) // rootscope on   
	}  // run function

})();

