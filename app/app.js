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
	    	.state('welcome'),{
	    		url:'/',
	    		templateUrl:'welcome.html',
	    		controller: 'welcomeCtrl'
	    	})
	      .state('login',{
	        url: '/login',
	        templateUrl: 'templates/login.html',
	        controller: 'loginCtrl',
	      })	      
	      .state('admin',{
	      	url: '/admin',
	      	template: 'You are now in the admin area',
	      })
	  }

	function run($rootScope) {
	   FastClick.attach(document.body);
	}  

})();

