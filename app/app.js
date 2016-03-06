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

var getMapURI = function(addr) {
  return "https://www.google.com/maps?q="+encodeURIComponent(addr)
}

;(function() {
	'use strict';

	//console.log('Init app')
//	angular.module('cmms', ['ngMessages','ngAria','formly','lumx','formlyLumx','ui.router','ngResource','ngStorage','textAngular','ngWig','ngFileUpload','ngWebsocket'])
	angular.module('cmms', ['ngMessages','ngAria','formly','lumx','formlyLumx','ui.router','ngResource','ngStorage',
		'ngWig','ngFileUpload','ngWebsocket','gridshore.c3js.chart'])
		.service('Session', session)
    .constant('ServerName', '')
    .filter('unsafe', function($sce) { return $sce.trustAsHtml; })	
		.config(config)
		.run(run)
			.directive('stringToNumber', function() {
			  return {
			    require: 'ngModel',
			    link: function(scope, element, attrs, ngModel) {
			      ngModel.$parsers.push(function(value) {
			      	console.log('from number',value,'to string',''+value)
			        return '' + value;
			      })
			      ngModel.$formatters.push(function(value) {
			      	console.log('from string',value,'to number')
			        return parseFloat(value, 10);
			      })
			    }
			  };
			})
		.service('socket',function($websocket,$location){
			var socketUrl = 'ws://' + $location.host() + ':' + $location.port() + '/ws'
			//var socketUrl = 'ws://' + $location.host() + '/ws'
			console.log("socketUrl =",socketUrl)
			var ws = $websocket.$get(socketUrl)
			ws.$open() // open connection if not already done
			return {
				url: socketUrl,
				ws: ws,
				on: function(msg, callback) {
					ws.$un(msg)	// unsub 
					ws.$on(msg, callback)
				}
			}
		})
		.filter('firstline', function() {
		  return function(input) {
		  	return input.split('\n')[0]
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
	    	.state('floor',{
	    		url:'/floor',
	    		acl: 'Floor',
	    		templateUrl:'html/floor.html',
	    		controller: 'floorCtrl as Floor',
	    		resolve: {
	    			machines: function(DBMachine) {
	    				return DBMachine.query()
	    			}
	    		}
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
	      	templateUrl: 'html/admin/admin.menu.html',
	      	controller: 'adminCtrl as admin'
	      })
		      .state('admin.dashboard',{
		      	url: '/dashboard',		
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/dashboard.html',
		      	controller: 'adminDashCtrl as Dashboard',
		      	resolve: {
		      		workorders: function(DBWorkOrder){
		      			return DBWorkOrder.query()
		      		}
		      	}
		      })
		      .state('admin.events',{
		      	url: '/events',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/event.list.html',
		      	controller: 'adminEventCtrl as Events',
		      	cache: false,
		      	resolve: {
		      		events: function(DBEvent) {
		      			return DBEvent.query()
		      		}, 
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 'E', Limit: 100})
		      		}
		      	}  
		      })
			      .state('admin.editevent',{
			      	url: '/event/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/event.edit.html',
			      	controller: 'adminEditEventCtrl as editEvent',
			      	resolve: {
			      		event: function(DBEvent,$stateParams) {
			      			return DBEvent.get({id: $stateParams.id})
			      		},
			      		workorders: function(DBEventWorkorders,$stateParams) {
			      			return DBEventWorkorders.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'toolevent', id: $stateParams.id})
			      		},
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				RefType: 'E',
			      				RefID: $stateParams.id,
			      				Limit: 100
			      			})
			      		}
			      	}
			      })
			      .state('admin.editworkorder',{
			      	url: '/workorder/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/workorder.edit.html',
			      	controller: 'adminEditWorkorderCtrl as editWorkorder',
			      	resolve: {
			      		workorder: function(DBWorkOrder,$stateParams) {
			      			return DBWorkOrder.get({id: $stateParams.id})
			      		},
/*			      		event: function(DBWorkOrderEvent, $stateParams)	{
			      			return DBWorkOrderEvent.get({id: $stateParams.id})
			      		},
*/			      		docs: function(DBWODocs,$stateParams) {
			      			return DBWODocs.query({id: $stateParams.id})
			      		},
			      	}
			      })
		      .state('admin.users',{
		      	url: '/users',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/user.list.html',
		      	controller: 'adminUserCtrl as Users',
		      	cache: false,
		      	resolve: {
		      		users: function(DBUser) {
		      			return DBUser.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({Limit: 500})  // Get the last 500 events for all
		      		}
		      	}
		      })
			      .state('admin.edituser',{
			      	url: '/user/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/users.edit.html',
			      	controller: 'adminEditUserCtrl as editUser',
			      	resolve: {
			      		user: function(DBUser,$stateParams) {
			      			return DBUser.get({id: $stateParams.id})
			      		},
			      		skills: function(DBSkill) {
			      			return DBSkill.query()
			      		},	    
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'user', id: $stateParams.id})
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
			      })
		      .state('admin.skills',{
		      	url: '/skills',
		      	acl: 'Admin',
		      	cache: false,
		      	templateUrl: 'html/admin/skill.list.html',
		      	controller: 'adminSkillCtrl as Skills',
		      	resolve: {
		      		skills: function(DBSkill) {
		      			return DBSkill.query()
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
			      		skill: function(DBSkill,$stateParams) {
			      			return DBSkill.get({id: $stateParams.id})
			      		},
			      		users: function(DBUserSkill,$stateParams) {
			      			return DBUserSkill.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'skill', id: $stateParams.id})
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
		      	templateUrl: 'html/admin/site.list.html',
		      	controller: 'adminSitesCtrl as Sites',
		      	resolve: {
		      		sites: function(DBSite) {
		      			return DBSite.query()
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
			      		site: function(DBSite,$stateParams) {
			      			return DBSite.get({id: $stateParams.id})
			      		},
			      		supplies: function(DBSiteSupplies,$stateParams) {
			      			return DBSiteSupplies.query({id: $stateParams.id})
			      		},
			      		users: function(DBSiteUsers,$stateParams) {
			      			return DBSiteUsers.query({id: $stateParams.id})
			      		},
			      		machines: function(DBSiteMachines, $stateParams) {
			      			return DBSiteMachines.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'site', id: $stateParams.id})
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
			      	controller: 'adminNewSiteCtrl as newSite',
			      })
		      .state('admin.machines',{
		      	url: '/machines',
		      	acl: 'Admin',
		      	cache: false,
		      	templateUrl: 'html/admin/machine.list.html',
		      	controller: 'adminMachineCtrl as Machines',
		      	resolve: {
		      		machines: function(DBMachine) {
		      			return DBMachine.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 'M', Limit: 100})
		      		}
		      	}
		      })
			      .state('admin.editmachine',{
			      	url: '/machine/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/machine.edit.html',
			      	controller: 'adminEditMachineCtrl as editMachine',
			      	resolve: {
			      		machine: function(DBMachine,$stateParams) {
			      			return DBMachine.get({id: $stateParams.id})
			      		},
			      		components: function(DBMachineComponents,$stateParams) {
			      			return DBMachineComponents.query({id: $stateParams.id})
			      		},
			      		parts: function(DBMachineParts,$stateParams) {
			      			return DBMachineParts.query({id: $stateParams.id})
			      		},
			      		events: function(DBMachineEvents,$stateParams) {
			      			return DBMachineEvents.query({id: $stateParams.id})		      			
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'machine', id: $stateParams.id})
			      		},
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				RefType: 'M', 
			      				RefID: $stateParams.id,
			      				Limit: 100})
			      		}
			      	}
			      })
			      .state('admin.newmachine',{
			      	url: '/newmachine',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/machine.new.html',
			      	controller: 'adminNewMachineCtrl as newMachine',
			      })
		      .state('admin.tools',{
		      	url: '/tools',
		      	acl: 'Admin',
		      	cache: false,
		      	templateUrl: 'html/admin/tool.list.html',
		      	controller: 'adminToolCtrl as Tools',
		      	resolve: {
		      		components: function(DBComponent) {
		      			return DBComponent.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 'T', Limit: 100})
		      		}
		      	}
		      })
			      .state('admin.edittool',{
			      	url: '/tool/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/tool.edit.html',
			      	controller: 'adminEditToolCtrl as editTool',
			      	resolve: {
			      		component: function(DBComponent,$stateParams) {
			      			return DBComponent.get({id: $stateParams.id})
			      		},
			      		machine: function(DBComponentMachine,$stateParams) {
			      			return DBComponentMachine.get({id: $stateParams.id})
			      		},
			      		events: function(DBComponentEvents,$stateParams) {
			      			return DBComponentEvents.query({id: $stateParams.id})
			      		},
			      		parts: function(DBComponentParts,$stateParams) {
			      			return DBComponentParts.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'tool', id: $stateParams.id})
			      		},		      		
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				RefType: 'T', 
			      				RefID: $stateParams.id,
			      				Limit: 100})
			      		}
			      	}
			      })
			      .state('admin.newtool',{
			      	url: '/newtool',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/tool.new.html',
			      	controller: 'adminNewToolCtrl as newTool',
			      })
		      .state('admin.parts',{
		      	url: '/parts',
		      	acl: 'Admin',
		      	cache: false,
		      	templateUrl: 'html/admin/part.list.html',
		      	controller: 'adminPartsCtrl as Parts',
		      	resolve: {
		      		parts: function(DBPart) {
		      			return DBPart.query()
		      		},
		      		logs: function(DBSysLog) {
		      			return DBSysLog.query({RefType: 'P', Limit: 1000})
		      		}
		      	}
		      })
			      .state('admin.editpart',{
			      	url: '/part/edit/:id',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/part.edit.html',
			      	controller: 'adminEditPartCtrl as editPart',
			      	resolve: {
			      		part: function(DBPart,$stateParams) {
			      			return DBPart.get({id: $stateParams.id})
			      		},
			      		logs: function(DBSysLog,$stateParams) {
			      			return DBSysLog.query({
			      				RefType: 'P', 
			      				RefID: $stateParams.id,
			      				Limit: 100})
			      		},
			      		vendors: function(DBPartVendors,$stateParams) {
			      			return DBPartVendors.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'part', id: $stateParams.id})
			      		},		      		
			      		components: function(DBPartComponents,$stateParams) {
			      			return DBPartComponents.query({id: $stateParams.id})
			      		}
			      	}
			      })
			      .state('admin.newpart',{
			      	url: '/newpart',
			      	acl: 'Admin',
			      	templateUrl: 'html/admin/part.new.html',
			      	controller: 'adminNewPartCtrl as newPart'
			      })
		      .state('admin.reports',{
		      	url: '/reports',
		      	acl: 'Admin',
		      	templateUrl: 'html/admin/reports.html',
		      	controller: 'adminReportsCtrl as Reports',
		      })
          .state('admin.vendors',{
            url: '/vendors',
            acl: 'Admin',
            cache: false,
            templateUrl: 'html/admin/vendor.list.html',
            controller: 'adminVendorCtrl as Vendors',            
            resolve: {
              vendors: function(DBVendor) {
                return DBVendor.query()
              },
              logs: function(DBSysLog) {
                return DBSysLog.query({RefType: 'V', Limit: 100}) 
              }
            }
          })
            .state('admin.editvendor',{
              url: '/vendor/edit/:id',
              acl: 'Admin',
              templateUrl: 'html/admin/vendor.edit.html',
              controller: 'adminEditVendorCtrl as editVendor',
              resolve: {
                vendor: function(DBVendor,$stateParams) {
                  return DBVendor.get({id: $stateParams.id})
                },
                parts: function(DBVendorPart,$stateParams) {
                	return DBVendorPart.query({id: $stateParams.id})
                },
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'vendor', id: $stateParams.id})
			      		},		      		
                logs: function(DBSysLog,$stateParams) {
                  return DBSysLog.query({
                    RefType: 'V',  
                    RefID: $stateParams.id,
                    Limit: 100})
                }
              }
            })
            .state('admin.editvendorprice',{
              url: '/vendor/editprice/:id',
              acl: 'Admin',
              templateUrl: 'html/admin/vendor.edit.price.html',
              controller: 'adminEditVendorPriceCtrl as editVendorPrice',
              resolve: {
                vendor: function(DBVendor,$stateParams) {
                  return DBVendor.get({id: $stateParams.id})
                },
                parts: function(DBPart,$stateParams) {
                	return DBPart.query()
                },
              }
            })
            .state('admin.newvendor',{
              url: '/newvendor',
              acl: 'Admin',
              templateUrl: 'html/admin/vendor.new.html',
              controller: 'adminNewVendorCtrl as newVendor',
            })
	      .state('sitemgr',{
	      	url: '/sitemgr',
	      	acl: 'Site Manager',
	      	abstract: true,
	      	templateUrl: 'html/sitemgr/sitemgr.menu.html',
	      	controller: 'sitemgrCtrl as sitemgr'
	      })
		      .state('sitemgr.dashboard',{
		      	url: '/dashboard',		
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/dashboard.html',
		      	controller: 'sitemgrDashCtrl as Dashboard',
		      })
		      .state('sitemgr.sites',{
		      	url: '/sites',
		      	acl: 'Site Manager',
		      	cache: false,
		      	templateUrl: 'html/sitemgr/site.list.html',
		      	controller: 'sitemgrSitesCtrl as Sites',
		      	resolve: {
		      		sites: function(DBSite) {
		      			return DBSite.query()
		      		}
		      	}
		      })
			      .state('sitemgr.editsite',{
			      	url: '/site/edit/:id',
			      	acl: 'Site Manager',
			      	templateUrl: 'html/sitemgr/site.edit.html',
			      	controller: 'sitemgrEditSiteCtrl as editSite',
			      	resolve: {
			      		site: function(DBSite,$stateParams) {
			      			return DBSite.get({id: $stateParams.id})
			      		},
			      		supplies: function(DBSiteSupplies,$stateParams) {
			      			return DBSiteSupplies.query({id: $stateParams.id})
			      		},
			      		users: function(DBSiteUsers,$stateParams) {
			      			return DBSiteUsers.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'site', id: $stateParams.id})
			      		},		      		
			      		machines: function(DBSiteMachines, $stateParams) {
			      			return DBSiteMachines.query({id: $stateParams.id})
			      		}
			      	}
			      })
		      .state('sitemgr.workorders',{
		      	url: '/workorders',		
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/workorder.list.html',
		      	controller: 'sitemgrWorkorderCtrl as sitemgrWorkorder',
		      })
		      .state('sitemgr.users',{
		      	url: '/users',
		      	acl: 'Site Manager',
		      	templateUrl: 'html/sitemgr/user.list.html',
		      	controller: 'sitemgrUserCtrl as Users',
		      	cache: false,
		      	resolve: {
		      		users: function(DBUser) {
		      			return DBUser.query()
		      		}
		      	}
		      })
			      .state('sitemgr.edituser',{
			      	url: '/user/edit/:id',
			      	acl: 'Site Manager',
			      	templateUrl: 'html/sitemgr/users.edit.html',
			      	controller: 'sitemgrEditUserCtrl as editUser',
			      	resolve: {
			      		user: function(DBUser,$stateParams) {
			      			return DBUser.get({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'user', id: $stateParams.id})
			      		},		      					      		
			      		skills: function(DBSkill) {
			      			return DBSkill.query()
			      		}
			      	}
			      })
		      .state('sitemgr.machines',{
		      	url: '/machines',
		      	acl: 'Site Manager',
		      	cache: false,
		      	templateUrl: 'html/sitemgr/machine.list.html',
		      	controller: 'sitemgrMachineCtrl as Machines',
		      	resolve: {
		      		machines: function(DBMachine) {
		      			return DBMachine.query()
		      		},
		      	}
		      })
			      .state('sitemgr.editmachine',{
			      	url: '/machine/edit/:id',
			      	acl: 'Site Manager',
			      	templateUrl: 'html/sitemgr/machine.edit.html',
			      	controller: 'sitemgrEditMachineCtrl as editMachine',
			      	resolve: {
			      		machine: function(DBMachine,$stateParams) {
			      			return DBMachine.get({id: $stateParams.id})
			      		},
			      		components: function(DBMachineComponents,$stateParams) {
			      			return DBMachineComponents.query({id: $stateParams.id})
			      		},
			      		events: function(DBMachineEvents,$stateParams) {
			      			return DBMachineEvents.query({id: $stateParams.id})		      			
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'machine', id: $stateParams.id})
			      		},
			      		parts: function(DBMachineParts,$stateParams) {
			      			return DBMachineParts.query({id: $stateParams.id})
			      		},
			      	}
			      })
			      .state('sitemgr.edittool',{
			      	url: '/tool/edit/:id',
			      	acl: 'Site Manager',
			      	templateUrl: 'html/sitemgr/tool.edit.html',
			      	controller: 'sitemgrEditToolCtrl as editTool',
			      	resolve: {
			      		component: function(DBComponent,$stateParams) {
			      			return DBComponent.get({id: $stateParams.id})
			      		},
			      		machine: function(DBComponentMachine,$stateParams) {
			      			return DBComponentMachine.get({id: $stateParams.id})
			      		},
			      		events: function(DBComponentEvents,$stateParams) {
			      			return DBComponentEvents.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'tool', id: $stateParams.id})
			      		},		      					      		
			      		parts: function(DBComponentParts,$stateParams) {
			      			return DBComponentParts.query({id: $stateParams.id})
			      		}
			      	}
			      })
			      .state('sitemgr.editpart',{
			      	url: '/part/edit/:id',
			      	acl: 'Site Manager',
			      	templateUrl: 'html/sitemgr/part.edit.html',
			      	controller: 'sitemgrEditPartCtrl as editPart',
			      	resolve: {
			      		part: function(DBPart,$stateParams) {
			      			return DBPart.get({id: $stateParams.id})
			      		},
			      		vendors: function(DBPartVendors,$stateParams) {
			      			return DBPartVendors.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'part', id: $stateParams.id})
			      		},		      					      		
			      		components: function(DBPartComponents,$stateParams) {
			      			return DBPartComponents.query({id: $stateParams.id})
			      		}
			      	}
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
	      	abstract: true,
	      	templateUrl: 'html/worker/worker.menu.html',
	      	controller: 'workerCtrl as worker'
	      })
					.state('worker.map', {
						url: '/map',
						acl: 'Worker',
						templateUrl: 'html/worker/map.html',
						controller: 'workerMapCtrl as Map',
						resolve: {
							sites: function(DBSite) {								
								return DBSite.query()
							}
						}
					})
		      .state('worker.machines',{
		      	url: '/machines/:id',
		      	acl: 'Worker',
		      	// cache: false,
		      	templateUrl: 'html/worker/machine.list.html',
		      	controller: 'workerMachineCtrl as Machines',
		      	resolve: {
		      		machines: function(DBSiteMachines, $stateParams) {
		      			return DBSiteMachines.query({id: $stateParams.id})
		      		},
		      		sites: function(DBSite) {
		      			return DBSite.query()
		      		}
		      	}
		      })
			      .state('worker.editmachine',{
			      	url: '/machine/edit/:id',
			      	acl: 'Worker',
			      	templateUrl: 'html/worker/machine.edit.html',
			      	controller: 'workerEditMachineCtrl as editMachine',
			      	resolve: {
			      		machine: function(DBMachine,$stateParams) {
			      			return DBMachine.get({id: $stateParams.id})
			      		},
			      		components: function(DBMachineComponents,$stateParams) {
			      			return DBMachineComponents.query({id: $stateParams.id})
			      		},
			      		events: function(DBMachineEvents,$stateParams) {
			      			return DBMachineEvents.query({id: $stateParams.id})		      			
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'machine', id: $stateParams.id})
			      		},
			      		parts: function(DBMachineParts,$stateParams) {
			      			return DBMachineParts.query({id: $stateParams.id})
			      		},
			      	}
			      })
			      .state('worker.edittool',{
			      	url: '/tool/edit/:id',
			      	acl: 'Worker',
			      	templateUrl: 'html/worker/tool.edit.html',
			      	controller: 'workerEditToolCtrl as editTool',
			      	resolve: {
			      		component: function(DBComponent,$stateParams) {
			      			return DBComponent.get({id: $stateParams.id})
			      		},
			      		machine: function(DBComponentMachine,$stateParams) {
			      			return DBComponentMachine.get({id: $stateParams.id})
			      		},
			      		events: function(DBComponentEvents,$stateParams) {
			      			return DBComponentEvents.query({id: $stateParams.id})		      			
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'tool', id: $stateParams.id})
			      		},		      					      		
			      		parts: function(DBComponentParts,$stateParams) {
			      			return DBComponentParts.query({id: $stateParams.id})
			      		}
			      	}
			      })
			      .state('worker.editpart',{
			      	url: '/part/edit/:id',
			      	acl: 'Worker',
			      	templateUrl: 'html/worker/part.edit.html',
			      	controller: 'workerEditPartCtrl as editPart',
			      	resolve: {
			      		part: function(DBPart,$stateParams) {
			      			return DBPart.get({id: $stateParams.id})
			      		},
			      		vendors: function(DBPartVendors,$stateParams) {
			      			return DBPartVendors.query({id: $stateParams.id})
			      		},
			      		docs: function(DBDocs,$stateParams) {
			      			return DBDocs.query({type: 'part', id: $stateParams.id})
			      		},		      					      		
			      		components: function(DBPartComponents,$stateParams) {
			      			return DBPartComponents.query({id: $stateParams.id})
			      		}
			      	}
			      })
		      .state('worker.reports',{
		      	url: '/reports',
		      	acl: 'Worker',
		      	templateUrl: 'html/worker/reports.html',
		      	controller: 'workerReportsCtrl as workerReports',
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

	function run($rootScope, $state, LxDialogService, LxNotificationService, Session, formlyConfig, $localStorage, $websocket, $location) {
	  FastClick.attach(document.body);

	  // Setup the websocket
		var socketUrl = 'ws://' + $location.host() + ':' + $location.port() + '/ws'
		//var socketUrl = 'ws://' + $location.host() + '/ws'
	  var ws = $websocket.$new({
	  	url: socketUrl,
	  	reconnect: true,
	  	enqueue: true,
	  })

	  ws.$on('$open', function() {
	  	console.log('Established socket connection')
	  }).$on('$close', function() {
	  	console.log('Closed socket connection')
	  })

		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
		  	var acl = toState.acl

		  	if (!Session.loggedIn && toState.name != 'home') {
					// Check first to see if we have a token in local storage before falling in a heap
					// If so, we can substitute the local storage session for the real session, 
					// and get back to running
					var token = $localStorage.token
					var sess  = $localStorage.session
					if (token != null) {
						console.log('Restart session at',toState.name,'using existing token', token, 'and sess =',sess)
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
		  		case 'Floor':
		  			switch (Session.Role) {
		  				case 'Floor':
		  					allGood = true
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

function getImageEstimate(doc) {
	console.log("getImageEstimate",doc)
	return "doc/"+doc.ID
}

function isImage(doc) {
	console.log("is this an image ?", doc)
	return true
}

