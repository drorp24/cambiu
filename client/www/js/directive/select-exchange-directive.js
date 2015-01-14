function selectExchange($rootScope) {
  return {
    require: 'ngModel',
    scope: {
      selectAction: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      function setSelectedExchange() {
        var selectAction = $rootScope.$eval(attrs.selectAction);

        //console.log(scope.selectAction({id: ctrl.$modelValue.id}));
        selectAction(ctrl.$modelValue.id);
      }

      element.on('click', setSelectedExchange);

      scope.$on('$destroy', function() {
        element.off('click', setSelectedExchange);
      });
    }
  };
}
