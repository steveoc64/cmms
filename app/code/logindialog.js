;(function(){
    'use strict';

angular.module('cmms')
    .controller('LxLoginDialogController', function($scope, LxDialogService,$state,$stateParams,Session)
    {
        angular.extend($scope, {
          username: '',
          passwd: '',
          login: function() {
            Session.loggedIn = true
            Session.role = 'worker'
            Session.username = this.username
            Session.role = this.passwd  // HACK for now !!

            LxDialogService.close('loginDialog', true)
            $state.go(Session.toState)
            Session.fromState = ''
            Session.toState = ''
            LxNotificationService.success('You are now Logged with Role',Session.role);

          },
          lxDialogOnclose: function()
          {
              $state.go(Session.fromState)
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
