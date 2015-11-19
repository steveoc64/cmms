;(function(){
    'use strict';

angular.module('cmms')
    .controller('LxLoginDialogController', function($scope, LxDialogService,Session,$state,$stateParams)
    {
        angular.extend($scope, {
          username: '',
          passwd: '',
          Session: Session,
          state: $state,
          params: $stateParams,
          login: function() {
            console.log('Clicked login')
            console.log('username=', $scope.username)
            console.log('passwd=', $scope.passwd)
            console.log('Session=', Session)
            console.log('$state=', $state)
            console.log('$stateParams=', $stateParams)
          },
          lxDialogOnclose: function()
          {
              console.log('Closing login screen - revert to previous state ?', $state, $stateParams)
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
    }]);

})();
