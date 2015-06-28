var app = angular.module('ioplayground', ["ui.router", "ui.bootstrap"]).run(function($rootScope) {
	$rootScope.$on("$stateChangeError", console.log.bind(console));
});


app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});


app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
		.state('home', {
			url: '/',
			templateUrl: 'views/home/home.html'
		});

	// .state('home', {
	// 	url: '/',
	// 	templateUrl: 'html/home.html',
	// 	controller: function($scope){
	// 		$scope.welcome = "Welcome to the IO Playground";
	// 		console.log('Welcome Home');
	// 	},
	// 	// views: {
	// 	// 	"viewA": { template: "form" },
	// 	// }
	// }) // Close HOME state
	//
	// .state('home.form', {
	// 	url: '/form',
	// 	templateUrl: 'html/form.html',
	// 	controller: function($scope){
	// 		console.log('Youre @ Form-state');
	// 	},
	// }) // Close FORM state

});

// angular.module('myApp.controllers', []);

// app.controller('masterCtrl', function ($scope, $q, $state) {

// }); // close MasterCtrl

app.controller('FormController', function ($scope, $http) {

	$scope.items = [
        { file: '123456.json', name: 'original-string' },
        { file: '789012.json', name: 'sliced-string' }
    ];

	$scope.master = {};

	$scope.scriptwriter = function(transpo){
		$http.get('/api/scriptwriter', {
		    params: transpo
	    })
	}

	$scope.update = function(transpo) {
		$scope.master = angular.copy(transpo);
	};

	$scope.reset = function() {
		$scope.transpo = angular.copy($scope.master);
	};

	$scope.reset();
});

/*
app.controller('FormController', ['$scope', function($scope, $http) {
$scope.master = {};

$scope.scriptwriter = function(transpo){
	$http.get('/api/spotify', {
	    params: transpo
    })
}

$scope.update = function(transpo) {
	$scope.master = angular.copy(transpo);
};

$scope.reset = function() {
	$scope.transpo = angular.copy($scope.master);
};

$scope.reset();
}]);
*/
