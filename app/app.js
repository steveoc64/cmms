;(function() {
	'use strict';

	console.log('Init app')

	angular.module('cmms', ['lumx','ui.router'])
		.service('Session', session)
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
	    		controller: 'cmmsCtrl',
	    		controllerAs: 'cmmsCtrl',
	    	})
	    	.state('login',{	// Special state with no template !!
	    		url: '/login',
	    		acl:'*',
	    		onEnter: function($state,Session,LxDialogService) {
	    			if (Session.fromState == '') {
	    				$state.go('home')
	    			} else {
		    			console.log('Forcing a Login Screen, from',Session.fromState,'to',Session.toState)
							LxDialogService.open('loginDialog')	    				
	    			}
	    		},
	    	})
	      .state('public',{
	      	url: '/public',
	      	acl: '*',
	      	template: 'This is a public page, available to all<br><a ui-sref="home">Home</a>',
	      })
	      .state('admin',{
	      	url: '/admin',
	      	acl: 'admin',
	      	template: 'You are now in the admin area<br><a ui-sref="home">Home</a>',
	      	controller: 'adminCtrl',
	      	controllerAs: 'adminCtrl',
	      })
	      .state('worker',{
	      	url: '/worker',
	      	acl: 'worker',
	      	template: 'You are now in the worker area<br><a ui-sref="home">Home</a><br><a ui-sref="worker.timesheet">TimeSheets</a><hr><ui-view>Summary of Worker Details Here</ui-view>',
	      	controller: 'workerCtrl',
	      	controllerAs: 'workerCtrl',
	      })
	      .state('worker.timesheet',{
	      	url: '/timesheet',
	      	acl: 'worker',
	      	template: 'Lil bit of timesheet stuff here, in place of where the worker details were <a ui-sref="worker">Close</a>',
	      	controller: 'workerCtrl',
	      	controllerAs: 'workerCtrl',
	      })
	  }

	  function session(LxNotificationService) {
	  	return {
	  		loggedIn: false,
	  		username: '',
	  		role: 'public',
	  		fromState: '',
	  		toState: '',
	  		logout: function() {
	  			this.loggedIn = false
	  			this.username = ''
	  			this.role = 'public'
	  			this.fromState = ''
	  			this.toState = ''
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
		  		case 'admin':
		  			switch (Session.role) {
		  				case 'admin':
		  					allGood = true
		  					break
		  				default:
				  			console.log('This page requires admin access !',Session.username,':',Session.role)
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
				  			console.log('This page requires worker access !',Session.username,':',Session.role)
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
		  			LxNotificationService.alert('Not for You!','You dont have sufficient access levels to visit that page', 
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

