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

  	function config($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  		// Force all outgoing http requests to include the Auth token, if defined
			$httpProvider.interceptors.push(function ($q, Session) {
			   return {
			       'request': function (config) {
			       		console.log('request, config =',config.url, config.Token, Session.Token)
			           config.headers = config.headers || {}
			           config.headers.Addthis = 'I added this'
			           config.headers.Token = Session.Token
			           if (Session.Token && Session.Token != '') {
			               config.headers.Authorization = Session.Token;
			           }
			           return config;
			       },
			   }
			}) 

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
	      	abstract: true,
	      	templateUrl: 'templates/admin/admin.html',
	      	controller: 'adminCtrl as admin'
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
		      	resolve: {
		      		users: function(DBUsers) {
		      			return DBUsers.query()
		      		}
		      	}
		      })
		      .state('admin.sites',{
		      	url: '/sites',
		      	acl: 'admin',
		      	templateUrl: 'templates/admin/sites.html',
		      	controller: 'adminSitesCtrl as adminSites',
		      })
		      .state('admin.equip',{
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

	  function session(LxNotificationService) {
	  	return {
	  		loggedIn: false,
	  		Token: '',
	  		Username: '',
	  		ID: 0,
	  		Role: 'public',
	  		fromState: '',
	  		toState: '',
	  		Site: 0,
	  		SiteName: '',
	  		logout: function() {
	  			//DBLogin.logout({id: this.uid})
	  			this.loggedIn = false
	  			this.Username = ''
	  			this.Role = 'public'
	  			this.fromState = ''
	  			this.toState = ''
	  			this.Site = 0,
	  			this.ID = 0,
	  			this.SiteName = '',
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
		  			if (Session.loggedIn) {
		  				allGood = true
		  			}
		  			break
		  		case 'admin':
		  			switch (Session.Role) {
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
		  			switch (Session.Role) {
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

