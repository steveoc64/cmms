// Some global functions available for all
var logClass = function(l) {
			switch (l.Status) {
				case 1:
					return 'syslog-status-1'
					break
				case 2:
					return 'syslog-status-2'
					break
				case 3:
					return 'syslog-status-3'
					break
			}
			return ''
		}

;(function() {
	'use strict';

	//console.log('Init app')
	angular.module('cmms', ['ngMessages','ngAria','formly','lumx','formlyLumx','ui.router','ngResource','ngStorage'])
		.service('Session', session)
    .constant('ServerName', '')
    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })	
		.config(config)
		.run(run)
	    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })
			.directive('stringToNumber', function() {
			  return {
			    require: 'ngModel',
			    link: function(scope, element, attrs, ngModel) {
			      ngModel.$parsers.push(function(value) {
			      	console.log('from number',value,'to string',''+value)
			        return '' + value;
			      });
			      ngModel.$formatters.push(function(value) {
			      	console.log('from string',value,'to number')
			        return parseFloat(value, 10);
			      });
			    }
			  };
			})

  	function config($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $localStorageProvider) {

  		// Force all outgoing http requests to include the Auth token, if defined
			$httpProvider.interceptors.push(function ($q, Session) {
			   return {
			       'request': function (config) {
			           //config.headers.Token = Session.Token
			           if (Session.Token && Session.Token != '') {
			               config.headers.Authorization = Session.Token;
			           }
			           return config;
			       },
			   }
			}) 

			$localStorageProvider.setKeyPrefix('cmms.')
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
	    		templateUrl:'html/cmms.html',
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
	    	.state('logout',{	// Special state with no template !!
	    		url: '/logout',
	    		acl:'*',
	    		onEnter: function($state,Session,LxNotificationService,$localStorageProvider) {
	    			Session.logout()
	    			delete $localStorage.get('token')
	    			delete $localStorage.get('session')
	   				LxNotificationService.warning('Logged Out')
	   				$state.go('home')
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
	      	templateUrl: 'html/public.html'	      	
	      })
	      .state('admin',{
	      	url: '/admin',
	      	acl: 'Admin',
	      	abstract: true,
	      	templateUrl: 'html/admin/admin.html',
	      	controller: 'adminCtrl as admin'
	      })
		      .state('admin.dashboard',{
		      	url: '/dashboard',		
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/dashboard.html',
		      	controller: 'adminDashCtrl as Dashboard',
		      })
		      .state('admin.users',{
		      	url: '/users',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/users.html',
		      	controller: 'adminUserCtrl as Users',
		      	cache: false,
		      	resolve: {
		      		users: function(DBUsers) {
		      			return DBUsers.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 'U', Limit: 100})
		      		}
		      	}
		      })
			      .state('admin.edituser',{
			      	url: '/user/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/users.edit.html',
			      	controller: 'adminEditUserCtrl as editUser',
			      	resolve: {
			      		user: function(DBUsers,$stateParams) {
			      			return DBUsers.get({id: $stateParams.id})
			      		},
			      		sites: function(DBSites) {
			      			return DBSites.query()
			      		},
			      		skills: function(DBSkills) {
			      			return DBSkills.query()
			      		},	      		
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				UserID: $stateParams.id
			      			})
			      		}
			      	}
			      })
			      .state('admin.newuser',{
			      	url: '/newuser',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/users.new.html',
			      	controller: 'adminNewUserCtrl as newUser',
			      	resolve: {
			      		sites: function(DBSites) {
			      			return DBSites.query()
			      		},
			      		skills: function(DBSkills) {
			      			return DBSkills.query()
			      		}		      		
			      	}
			      })
		      .state('admin.skills',{
		      	url: '/skills',
		      	acl: 'Admin',
		      	cache: false,
		      	templateUrl: 'html/admin/skills.html',
		      	controller: 'adminSkillCtrl as Skills',
		      	resolve: {
		      		skills: function(DBSkills) {
		      			return DBSkills.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 's', Limit: 100})
		      		}
		      	}
		      })
			      .state('admin.editskill',{
			      	url: '/user/skill/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/skill.edit.html',
			      	controller: 'adminEditSkillCtrl as editSkill',
			      	resolve: {
			      		skill: function(DBSkills,$stateParams) {
			      			return DBSkills.get({id: $stateParams.id})
			      		},
			      		users: function(DBUsersSkill,$stateParams) {
			      			return DBUsersSkill.query({id: $stateParams.id})
			      		},
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				RefType: 's',
			      				RefID: $stateParams.id,
			      				Limit: 100
			      			})
			      		}
			      	}
			      })
			      .state('admin.newskill',{
			      	url: '/newskill',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/skills.new.html',
			      	controller: 'adminNewSkillCtrl as newSkill',
			      })
		      .state('admin.sites',{
		      	url: '/sites',
		      	acl: 'Admin',
		      	cache: false,
		      	templateUrl: 'html/admin/sites.html',
		      	controller: 'adminSitesCtrl as Sites',
		      	resolve: {
		      		sites: function(DBSites) {
		      			return DBSites.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 'S', Limit: 100})
		      		}
		      	}
		      })
			      .state('admin.editsite',{
			      	url: '/site/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/site.edit.html',
			      	controller: 'adminEditSiteCtrl as editSite',
			      	resolve: {
			      		site: function(DBSites,$stateParams) {
			      			return DBSites.get({id: $stateParams.id})
			      		},
			      		users: function(DBSiteUsers,$stateParams) {
			      			return DBSiteUsers.query({id: $stateParams.id})
			      		},
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				RefType: 'S', 
			      				RefID: $stateParams.id,
			      				Limit: 100})
			      		}
			      	}
			      })
			      .state('admin.newsite',{
			      	url: '/newsite',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/site.new.html',
			      	controller: 'adminNewSiteCtrl as newSite'
			      })
		      .state('admin.equip',{
		      	url: '/equip',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/equip.html',
		      	controller: 'adminEquipCtrl as adminEquip',
		      })
		      .state('admin.parts',{
		      	url: '/parts',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/parts.html',
		      	controller: 'adminPartsCtrl as adminParts',
		      })
		      .state('admin.reports',{
		      	url: '/reports',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/reports.html',
		      	controller: 'adminReportsCtrl as adminReports',
		      })
	      .state('sitemgr',{
	      	url: '/sitemgr',
	      	acl: 'Site Manager',
	      	abstract: true,
	      	templateUrl: 'html/sitemgr/sitemgr.html',
	      	controller: 'sitemgrCtrl as sitemgr'
	      })
		      .state('sitemgr.dashboard',{
		      	url: '/dashboard',		
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/dashboard.html',
		      	controller: 'sitemgrDashCtrl as sitemgrDash',
		      })
		      .state('sitemgr.workorders',{
		      	url: '/workorders',		
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/workorders.html',
		      	controller: 'sitemgrWorkorderCtrl as sitemgrWorkorder',
		      })
		      .state('sitemgr.users',{
		      	url: '/users',
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/users.html',
		      	controller: 'sitemgrUserCtrl as sitemgrUser',
		      	resolve: {
		      		users: function(DBUsers) {
		      			return DBUsers.query()
		      		},
		      		logs: function(DBUserlog) {
		      			return DBUserlog.query()
		      		}
		      	}
		      })
		      .state('sitemgr.edituser',{
		      	url: '/user/edit/:id',
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/users.edit.html',
		      	controller: 'sitemgrEditUserCtrl as editUser',
		      	resolve: {
		      		user: function(DBUsers,$stateParams) {
		      			return DBUsers.get({id: $stateParams.id})
		      		},
		      		logs: function(DBUserlog,$stateParams) {
		      			return DBUserlog.get({id: $stateParams.id})
		      		}
		      	}
		      })
		      .state('sitemgr.equip',{
		      	url: '/equip',
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/equip.html',
		      	controller: 'sitemgrEquipCtrl as sitemgrEquip',
		      })
		      .state('sitemgr.parts',{
		      	url: '/parts',
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/parts.html',
		      	controller: 'sitemgrPartsCtrl as sitemgrParts',
		      })
		      .state('sitemgr.reports',{
		      	url: '/reports',
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/reports.html',
		      	controller: 'sitemgrReportsCtrl as sitemgrReports',
		      })

	      .state('worker',{
	      	url: '/worker',
	      	acl: 'Worker',
	      	template: 'You are now in the worker area<br><a ui-sref="home">Home</a><br><a ui-sref="worker.timesheet">TimeSheets</a><hr><ui-view>Summary of Worker Details Here</ui-view>',
	      	controller: 'workerCtrl as worker',
	      })
		      .state('worker.timesheet',{
		      	url: '/timesheet',
		      	acl: 'Worker',
		      	template: 'Lil bit of timesheet stuff here, in place of where the worker details were <a ui-sref="worker">Close</a>',
		      	controller: 'workerCtrl as worker',
		      })
	  }

	  function session() {
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
	  			this.loggedIn = false
	  			this.Username = ''
	  			this.Role = 'public'
	  			this.fromState = ''
	  			this.toState = ''
	  			this.Site = 0,
	  			this.ID = 0,
	  			this.SiteName = ''
	  		}
	  	}
	  }

	function run($rootScope, $state, LxDialogService, LxNotificationService, Session, formlyConfig, $localStorage) {
	  FastClick.attach(document.body);

		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		  	var acl = toState.acl

		  	if (!Session.loggedIn && toState.name != 'home') {
					// Check first to see if we have a token in local storage before falling in a heap
					// If so, we can substitute the local storage session for the real session, 
					// and get back to running
					var token = $localStorage.token
					var sess  = $localStorage.session
					if (token != null) {
						console.log('Restart session at',toState.name,'using existing token', token)
	          Session.loggedIn = sess.loggedIn
	          Session.ID = sess.ID
	          Session.Username = sess.Username
	          Session.Role = sess.Role
	          Session.Token = sess.Token
	          Session.Site = sess.Site
	          Session.SiteName = sess.SiteName.String
	          if (Session.toState != '') {
	            $state.go(Session.toState)
	          }
	        	Session.toState = Session.fromState = ''
	        }
	      }

		  	var allGood = false
		  	switch (toState.acl) {
		  		case 'landing':
		  			// This is the landing page, just need to be logged in correctly as any role
		  			// before being sent off to the correct homepage
		  			if (Session.loggedIn) {
		  				allGood = true
		  			}
		  			break
		  		case 'Admin':
		  			switch (Session.Role) {
		  				case 'Admin':
		  					allGood = true
		  					break
		  				default:
				  			//console.log('This page requires admin access !',Session.username,':',Session.role)
				  			//LxNotificationService.warning('This page requires admin access')
		  					allGood = false
		  					break
		  			}
		  			break
		  		case 'Site Manager':
		  			switch (Session.Role) {
		  				case 'Admin':
		  				case 'Site Manager':
		  					allGood = true
		  					break
		  				default:
		  					allGood = false
				  			//LxNotificationService.warning('This page requires worker access')
				  			//console.log('This page requires worker access !',Session.username,':',Session.role)
		  					break
		  			}
		  			break
		  		case 'Worker':
		  			switch (Session.Role) {
		  				case 'Admin':
		  				case 'Site Manager':
		  				case 'Worker':
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

		loadFieldDefinitions(formlyConfig)
	}  // run function


})();

