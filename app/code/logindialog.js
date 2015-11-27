;(function(){
    'use strict';

angular.module('cmms')
    .controller('LxLoginDialogController', function(
      $scope, 
      LxDialogService, 
      $http, 
      $state,
      $stateParams,
      Session,
      LxNotificationService,
      localStorageService,
      DBLogin)
    {
        angular.extend($scope, {
          username: '',
          passwd: '',
          focusValue: false,
          login: function() {
            // First, get login creds from login service
            var vm = this
            DBLogin.login({
              username: this.username,
              passwd: this.passwd
            },function(retval,r){
              //console.log('login from dialog OK', retval)
              Session.loggedIn = true
              Session.ID = retval.ID
              Session.Username = retval.Username
              Session.Role = retval.Role
              Session.Token = retval.Token
              Session.Site = retval.Site
              Session.SiteName = retval.SiteName.String
              LxDialogService.close('loginDialog', true)  
               vm.username = ''
               vm.password = ''    // clear it out, so its no longer visible in the browser memory

              if (Session.toState != '') {
                //console.log('Change state from dialog to',Session.toState,Session)
                $state.go(Session.toState)
              }
              Session.toState = Session.fromState = ''

              // Save the token in localstorage, along with other info on the session
              localStorageService.set('token',retval.Token)
              localStorageService.set('session',Session)

            },function(){
              LxNotificationService.warning('Login Failed ...')
            })
          },
          lxDialogOnclose: function()
          {
            if (Session.fromState) {
              $state.go(Session.fromState)              
            }
          }
        })

        this.init = function(element, id)
        {
            $scope.lxDialogIsOpened = false;
            $scope.lxDialogElement = element;
            $scope.lxDialogParent = element.parent();         

            LxDialogService.registerScope(id, $scope);
        };
    })
    .directive('lxLoginDialog', function()
    {
        return {
            restrict: 'E',
            controller: 'LxLoginDialogController',
            scope: true,
            template: '<div><div ng-if="lxDialogIsOpened" ng-transclude="child"></div></div>',
            replace: true,
            transclude: true,
            link: function(scope, element, attrs, ctrl)
            {
                attrs.$observe('id', function(newId)
                {
                    if (newId)
                    {
                        ctrl.init(element, newId);
                    }
                });

                attrs.$observe('autoClose', function(newValue)
                {
                    scope.lxDialogAutoClose = newValue;
                });

                attrs.$observe('escapeClose', function(newValue)
                {
                    scope.lxDialogEscapeClose = newValue;
                });

                attrs.$observe('beforeClose', function(newValue)
                {
                    scope.lxDialogBeforeClose = function()
                    {
                        return scope.$eval(newValue);
                    };
                });

                attrs.$observe('onclose', function(newValue)
                {
                    scope.lxDialogOnclose = function()
                    {
                        return scope.$eval(newValue);
                    };
                });

                attrs.$observe('onscrollend', function(newValue)
                {
                    scope.lxDialogOnscrollend = function()
                    {
                        return scope.$eval(newValue);
                    };
                });
            }
        };
    })
    .directive('lxLoginDialogClose', ['LxDialogService', function(LxDialogService)
    {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs)
            {
                attrs.$observe('lxDialogClose', function(newValue)
                {
                    scope.lxDialogCloseSkipBefore = newValue;
                });

                element.on('click', function()
                {
                    LxDialogService.close(element.parents('.dialog').attr('id'), scope.lxDialogCloseSkipBefore);
                });
            }
        };
    }])
    .directive('lxEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });

})();
