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
	    	.state('welcome',{
	    		url:'/',
	    		acl: '*',
	    		templateUrl:'welcome.html',
	    		controller: 'welcomeCtrl',
	    	})
	      .state('login',{
	        url: '/login',
	        acl: '*',
	        templateUrl: 'templates/login.html',
	        controller: 'loginCtrl',
	        controllerAs: 'loginCtrl',
	      })	      
	      .state('admin',{
	      	url: '/admin',
	      	acl: 'admin',
	      	template: 'You are now in the admin area',
	      	controller: 'adminCtrl',
	      	controllerAs: 'adminCtrl',
	      })
	      .state('worker',{
	      	url: '/worker',
	      	acl: 'worker',
	      	template: 'You are now in the worker area',
	      	controller: 'workerCtrl',
	      	controllerAs: 'workerCtrl',
	      })
	  }

	function run($rootScope, $state) {
	   FastClick.attach(document.body);

	  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
	  	if (toState.url != '/login') {
		  	var acl = toState.acl
		  	console.log('change state to',toState,'with event',event)

		  	switch (toState.acl) {
		  		case 'admin':
		  			console.log('This page requires admin priv !!')
		  			event.preventDefault()
		  			return $state.go('login')
		  		case '*':
		  			console.log('This page is available to all !')
		  			return $state.go(toState.name, toParams)
		  	}
		  }
	  });	   
	}  

})();

