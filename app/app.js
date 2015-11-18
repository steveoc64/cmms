;(function() {
	'use strict';

	console.log('Init app')

	angular.module('cmms', ['lumx','ui.router'])
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
	    	.state('cmms',{
	    		url:'/',
	    		acl: '*',
	    		templateUrl:'templates/cmms.html',
	    		controller: 'cmmsCtrl',
	    	})
	      .state('cmms.admin',{
	      	url: '/admin',
	      	acl: 'admin',
	      	template: 'You are now in the admin area',
	      	controller: 'adminCtrl',
	      	controllerAs: 'adminCtrl',
	      })
	      .state('cmms.worker',{
	      	url: 'worker',
	      	acl: 'worker',
	      	template: 'You are now in the worker area',
	      	controller: 'workerCtrl',
	      	controllerAs: 'workerCtrl',
	      })
	  }

	function run($rootScope, $state, LxDialogService, Session, $controller) {
	   FastClick.attach(document.body);

	  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
	  	if (toState.url != '/login' && toState.url != '/') {
		  	var acl = toState.acl
		  	//console.log('change state to',toState,'with event',event)

		  	var allGood = true
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
		  		console.log('opening login dialog from inside state change detector')
		  		$controller('cmmsCtrl').openLoginDialog()
		  	}
		  }
	  });	   
	}  

})();

