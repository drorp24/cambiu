function selectExchange() {
  return {
    scope: {
      selectAction: '&'
    },
    link: function(scope, element, attrs) {
      function setSelectedExchange() {
        console.log('3333333333');
        scope.selectAction({id: 5});
      }

      element.on('click', setSelectedExchange);

      scope.$on('$destroy', function() {
        element.off('click', setSelectedExchange);
      });
    }
  };
}
