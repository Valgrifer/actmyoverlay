let blacklist = ["Monocéros"];
let tank = ["Gla", "Pld", "Mrd", "War", "Drk", "Gnb"];
let heal = ["Cnj", "Whm", "Sch", "Ast", "Sge"];
let dps = ["Pgl", "Mnk", "Lnc", "Drg", "Rog", "Nin", "Sam", "Rpr", "Vpr", "Arc", "Brd", "Mch", "Dnc", "Thm", "Blm", "Acn", "Smn", "Rdm", "Pct", "Blu"];

function isTank(job)
{
	if(typeof job != "string")
		job = job.Job;
	return tank.indexOf(job) > 0;
}
function isHeal(job)
{
	if(typeof job != "string")
		job = job.Job;
	return heal.indexOf(job) > 0;
}
function isDPS(job)
{
	if(typeof job != "string")
		job = job.Job;
	return dps.indexOf(job) > 0;
}

angular.module('valgrifer.overlay', ['ngRoute',
								  'valgrifer.overlay.dpsmeter',
								  'valgrifer.overlay.config',
								  'valgrifer.overlay.dbmanager'])

	.constant('VERSION', '1.5.1')

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				redirectTo: '/dpsmeter',
			})
			.otherwise({
				templateUrl: 'app/Debug/debug.html',
				controller: 'debugController'
			});
	}])

	.factory('sanitize',
		function sanitizeFactory() {
			return function sanitize(unsafe) {
			  	if(angular.isObject(unsafe)) {
			  		angular.forEach(unsafe, function(value, key) {
			  			unsafe[key.replace(/%/g, 'Pct')] = sanitize(value);
			  		});
				}
				return unsafe;
			}
		})

	.controller('overlayController',
		[ '$scope',
		  '$document',
		  'userManager',
		  'sanitize',
		  '$route',
		  function($scope, $document, userManager, sanitize, $route) {

		  		$scope.$on('$routeChangeStart', function($event, next) {
		  			if(!userManager.isUserDefined() && !next.$$route.isLoginManager) {
		  				$event.preventDefault();
		  				userManager.load().then($route.reload)
		  			}
		  		});

				$scope.state = { isLocked: false };

				$scope.floor = Math.floor;
				$scope.ceil = Math.ceil;
				$scope.round = Math.round;

				$document.on('onOverlayStateUpdate', stateUpdate);
				$document.on('onOverlayDataUpdate', dataUpdate);
			  	// addOverlayListener("CombatData");
			  	// startOverlayEvents();

			    function stateUpdate(e) {
			        $scope.$apply(function() {
			        	$scope.state = e.detail;
			        });
			    }

			    function dataUpdate (e) {
			    	let session = userManager.getSession();
					session.encounter = sanitize(e.detail.Encounter);
					session.combatants = sanitize(e.detail.Combatant);
					session.active = e.detail.isActive;
			    }

			    $scope.setExpandFromBottom = function(value, save) {
			    	$scope.expandFromBottom = value;
			    	if(save !== false) {
			    		userManager.set('expandFromBottom', value);
			    	}
			    }

			    $scope.getExpandFromBottom = function() {
			    	return userManager.get('expandFromBottom');
			    }
		}])

	.controller('debugController',
		['$scope', '$location',
		function($scope, $location) {
			$scope.loc = $location;
		}]);
