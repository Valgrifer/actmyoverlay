// 1A:.{8}:(?<name>.+) gains the effect of Vulnérabilité Augmentée

;(function() {
angular.module('valgrifer.overlay.dpsmeter', ['ngRoute',
										   'ngStorage',
										   'valgrifer.overlay.dbmanager'])

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/dpsmeter', {
				templateUrl: 'app/DpsMeter/dpsmeter.html',
				controller: 'dpsmeterController'
			})
	}])

	.controller('dpsmeterController',
		['$scope', '$document', 'userManager',
		function dpsmeterController($scope, $document, userManager) {

			let session = userManager.getSession();

			$scope.setExpandFromBottom($scope.getExpandFromBottom(), false);

			$scope.encounter = session.encounter;
			$scope.combatants = session.combatants;
			$scope.active = session.active;

			$document.on('onOverlayDataUpdate', dataUpdate);

			$scope.$on('$destroy', function $destroy() {
				$scope.setExpandFromBottom(false, false);
				$document.off('onOverlayDataUpdate', dataUpdate);
			});

			function dataUpdate(e) {
				$scope.$apply(function() {
					$scope.encounter = session.encounter;
					$scope.combatants = session.combatants;
					$scope.active = session.active;
				});
			}
		}])

	.controller('EncounterController',
		['$scope',
			function EncounterController($scope) {

			}])

	.controller('CombatantsController',
		['$scope', 'presetManager',
		function CombatantsController($scope, presetManager) {

			$scope.bestdps = 0;
			$scope.combatantslength = 0;
			
			$scope.headers = presetManager.get().cols;

			$scope.$watch('combatants', function update(combatants) {

				$scope.bestdps = 0;

				let tcombatants = [];

				angular.forEach(combatants, function(combatant) {
					if(!blacklist.includes(combatant.name) && (isTank(combatant) || isHeal(combatant) || isDPS(combatant)))
					{
						tcombatants.push(combatant);

						if(parseFloat(combatant.encdps) > $scope.bestdps)
							$scope.bestdps = parseFloat(combatant.encdps);
					}
				});

				tcombatants.sort(function (c1, c2) {
					return c1.encdps - c2.encdps;
				});
				angular.forEach(combatants, function(combatant) {
					combatant.showbar = Math.min(Math.max(Math.round(parseFloat(combatant.encdps) / $scope.bestdps * 100), 0), 100);

					combatant.rdps = false;
					combatant.fdps = false;

					let index = tcombatants.indexOf(combatant);

					if(index < 0)
						return;

					if((isTank(combatant) || isHeal(combatant)) && index < tcombatants.length * (1 - 0.75))
						combatant.rdps = true;

					if(isDPS(combatant) && index >= tcombatants.length * (1 - 0.2))
						combatant.fdps = true;
				});
			});
		}])

	.controller('CombatantController',
		['$scope', 'presetManager',
		function CombatantController($scope, presetManager) {
			$scope.cols = presetManager.get().cols;

			$scope.$watch('combatant', function update(combatant) {
				let index;

				if(!combatant.Job) {
					if(~(index = combatant.name.indexOf("-Egi ("))) {
						combatant.Job = combatant.name.substring(0,index);
						combatant.isEgi = true;
					} else if(combatant.name.indexOf("Eos (") === 0) {
						combatant.Job = "Eos";
						combatant.isFairy = true;
					} else if(combatant.name.indexOf("Selene (") === 0) {
						combatant.Job = "Selene";
						combatant.isFairy = true;
					} else if(combatant.name.indexOf("Carbuncle (") === 0) {
						combatant.Job = "Carbuncle";
						combatant.isCarbuncle = true;
					} else if(~combatant.name.indexOf(" (")) {
						combatant.Job = "Choco";
						combatant.isChoco = true;
					} else if(combatant.name === "Limit Break") {
						combatant.Job = "Limit-Break";
						combatant.isLB = true;
					} else {
						combatant.Job = "Error";
					}
				}
			});
		}])

	.directive('encounter', function encounterDirective() {
		return {
			restrict: 'E',
			templateUrl:'app/DpsMeter/partials/encounter.html',
			cache:false,
			controller:'EncounterController',
			scope:{
				encounter:'=',
				active:'='
			},
		}
	})

	.directive('combatants', function combatantsDirective() {
		return {
			restrict: 'E',
			templateUrl:'app/DpsMeter/partials/combatants.html',
			cache:false,
			controller:'CombatantsController',
			scope:{
				combatants:'='
			},
		}
	})

	.directive('combatant', function combatantDirective() {
		return {
			restrict: 'A',
			templateUrl:'app/DpsMeter/partials/combatant.html',
			cache:false,
			controller:'CombatantController',
			scope:{
				combatant:'=',
				bestdps:'='
			},
			link:function(scope, element) {
				scope.$watchGroup(["combatant.rdps", "combatant.fdps"], function update(let1) {
					let [rdps, fdps] = let1;
					if(rdps !== element[0].classList.contains("Rdps"))
						if(rdps)
							element[0].classList.add("Rdps");
						else
							element[0].classList.remove("Rdps");

					if(fdps !== element[0].classList.contains("Fdps"))
						if(fdps)
							element[0].classList.add("Fdps");
						else
							element[0].classList.remove("Fdps");
				});
			}
		}
	});

})();