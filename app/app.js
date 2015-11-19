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

	    // Setup a special login modal state
	    $stateProvider


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
	    		onEnter: function(Session,LxDialogService) {
	    			console.log('Forcing a Login Screen, from',Session.fromState,'to',Session.toState)
						LxDialogService.open('loginDialog')
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
	      	template: 'You are now in the worker area<br><a ui-sref="home">Home</a>',
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
		  	console.log('change to',toState.name,'Session=',Session)

		  	var allGood = false
		  	switch (toState.acl) {
		  		case 'admin':
		  			console.log('This page requires admin priv !!')
		  			switch (Session.role) {
		  				case 'admin':
		  					allGood = true
		  					break
		  				default:
		  					allGood = false
		  					break
		  			}
		  			break
		  		case 'worker':
		  			console.log('This page requires worker access !, and your Session is',Session.loggedIn, Session.username,Session.role)
		  			switch (Session.role) {
		  				case 'admin':
		  				case 'worker':
		  					allGood = true
		  					break
		  				default:
		  					allGood = false
		  					break
		  			}
		  			break
		  		case '*':
		  			console.log('This page is available to all !')
		  			allGood = true
		  			break
		  	}

		  	if (!allGood) {
		  		event.preventDefault()
		  		Session.fromState = fromState.name
		  		Session.toState = toState.name
		  		$state.go('login')
				}
		 }) // rootscope on   
	}  // run function

})();

