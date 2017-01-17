angular.module('sensorsWebApp')
    .directive('heroBlock', function() {
        return {
            templateUrl: '/app/components/home/views/heroBlockView.html'
        };
    })
    .directive('subSection', function() {
        return {
            templateUrl: '/app/components/home/views/subsectionView.html'
        };
    });