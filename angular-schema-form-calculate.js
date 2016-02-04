/**
 * I calculate a field value based on a provided mathematical string
 *  
 * @example
 * {
 *   "type":"calculate",
 *   "key":"my.result",
 *   "watch":["product.license.basic","product.license.unified"],
 *   "calculate":"model.product.license.basic + model.product.license.basic / 2 * ( model.product.license.unified / 2)"
 * }
 */
angular
  .module('schemaForm')
  .run(function($templateCache) {
    // A template to use
    $templateCache.put('calculated-fields.html','<span class="calculate" model="model" form="form"></span>');
  })
  .directive('calculate', ['$compile', '$http', 'sfBuilder', 'sfSelect', '$interpolate', 'schemaFormDecorators', 
    function($compile, $http, sfBuilder, sfSelect, $interpolate, schemaFormDecoratorsProvider) {
      return {
        restrict: 'C',
        scope: {
          form: '=',
          model: '='
        },
        link: function(scope, element, attrs) {
          var watchKeys = scope.form.watch,
              key,
              i;

          scope.form.format = scope.form.format || 'number';

          for (i=0; i < watchKeys.length; i++) {
            key = watchKeys[i];

            scope.$watch('model.'+key, function (val, old) {
              var newValue = $interpolate('{{'+scope.form.calculate+'}}', false, null, true)(scope.model);

              if(scope.form.lookup) {
                scope.model.calculated = encodeURIComponent(newValue);
                var lookup = $interpolate(scope.form.lookup, false, null, true)(scope.model);
                $http.get(lookup, { responseType: 'json' })
                  .success(function(response, status) {
                    if(response.data) update(response.data);
                  })
                  .error(function(data, status) {
                    scope.form.options = [];
                    scope.form.selectedOption = '';
                  });
              }
              else {
                update(newValue);
              };

              function update(value) {
                if(scope.form.format == 'number') value = Number(value);
                sfSelect(scope.form.key, scope.model, value);
              };
            });
          }
        }
      };
    }
  ])
  .config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
    function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {
      schemaFormDecoratorsProvider.addMapping(
        'materialDecorator',
        'calculate',
        'calculated-fields.html'
      );
      schemaFormDecoratorsProvider.createDirective(
        'calculate',
        'calculated-fields.html'
      );
    }
  ]);