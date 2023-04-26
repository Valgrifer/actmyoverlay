;(function() {

angular.module('valgrifer.overlay.dbmanager', [
											'ngStorage'])
	.factory('userManager',
		['$localStorage', '$q',
		function userManagerFactory ($storage, $q) {
			let session = {
					encounter:{
						encdps: "0",
						duration: "00:00",
					},
					active: false
				}, isLoading
			  ;

			return {
				get: function get(key) {
					return $storage[key];
				},

				set: function set(key, value) {
					$storage[key] = value;
				},

				getSession: function getSession() {
					return session;
				},

				isUserDefined: function isUserDefined () {
					return true;
				},

				load: function() {
					if(isLoading) return $q.reject();
					return isLoading = $q.resolve().then(function () {
						isLoading = false;
					})
				}
			}

		}])

	.factory('presetManager',
		['$localStorage',
		function presetManagerFactory ($storage) {
			function uidTest (uid) {
				return function(preset) {
					return preset.__uid === uid;
				}
			}

			function findPos(preset) {
				return $storage.presets.findIndex(uidTest(preset.__uid));
			}

			return {
				get: function getPreset(uid) {
					uid = uid || $storage.preset;
					return $storage.presets.find(uidTest(uid));
				},

				set: function setPreset(preset) {
					$storage.preset = preset.__uid;
					return preset;
				},

				getAll: function getAllPreset() {
					return $storage.presets;
				},

				update: function updatePreset (preset) {
					let index = findPos(preset);
					return ~index && $storage.presets.splice(index, 1, preset) && preset;
				},

				remove: function removePreset (preset) {
					let index = findPos(preset);
					return ~index && $storage.presets.splice(index, 1)[0];
				},

				add: function addPreset (preset) {
					preset.__uid = $storage.__uid++;
					return $storage.presets.push(preset) && preset;
				},

				$getDefault: function $getDefault () {
					return {
						name:'Default',
						cols: [
							{label:  'Name',value: 'name'},
							{label:  'Dps',value: 'encdps'},
							{label:  'Dps%',value: 'damagePct'},
							{label:  'Crit%',value: 'crithitPct'},
							{label:  'Healed',value: 'healed'},
							{label:  'Healed (%)',value: 'healedPct'},
							{label:  'OverHeal (%)',value: 'OverHealPct'},
							{label:  'Deaths',value: 'deaths'},
						]
					}
				}
			}
		}])

	.run(['$localStorage', 'VERSION', 'presetManager', 'presetConfigManager',
		function update($storage, VERSION, preset, config) {
		console.log("load " + $storage.VERSION)
		
		let reset = false;
		
			if($storage.VERSION && $storage.VERSION !== VERSION) {
				try
				{
					let version = $storage.VERSION.match(/(\d+)\.(\d+)(\.(\d+)|)/);
					let major = version[1] ? parseInt(version[1]) : 0;
					let minor = version[2] ? parseInt(version[2]) : 0;
					let patch = version[4] ? parseInt(version[4]) : 0;

					let update = false;

					if(major === 1 && minor === 5 && patch < 1)
					{
						$storage.settings = config.$getDefault();
					}

					if(update)
					{
						$storage.VERSION = VERSION;
						console.log("updated " + $storage.VERSION)
					}
				}
				catch (error)
				{
					console.error(error)
					reset = true;
				}
			}
			else 
			{
				reset = true;
			}
			
			if(reset)
			{
				console.log("load & save Default " + VERSION)
				let defaultpreset = preset.$getDefault();
				defaultpreset.__uid = 1;
				$storage.$reset({
					__uid:1,
					preset: 1,
					presets: [
						defaultpreset
					],
					settings: config.$getDefault(),
					VERSION: VERSION,
				});
			}
		}])

	.run(function() {

	  if (!Array.prototype.findIndex) {
	    Array.prototype.findIndex = function(predicate) {
	      if (this == null) {
	        throw new TypeError('Array.prototype.findIndex appelé sur null ou undefined');
	      }
	      if (typeof predicate !== 'function') {
	        throw new TypeError('predicate doit être une fonction');
	      }
	      let list = Object(this);
	      let length = list.length >>> 0;
	      let thisArg = arguments[1];
	      let value;

	      for (let i = 0; i < length; i++) {
	        value = list[i];
	        if (predicate.call(thisArg, value, i, list)) {
	          return i;
	        }
	      }
	      return -1;
	    };
	  }

	  if (!Array.prototype.find) {
	    Array.prototype.find = function(predicate) {
	      if (this == null) {
	        throw new TypeError('Array.prototype.find a été appelé sur null ou undefined');
	      }
	      if (typeof predicate !== 'function') {
	        throw new TypeError('predicate doit être une fonction');
	      }
	      let list = Object(this);
	      let length = list.length >>> 0;
	      let thisArg = arguments[1];
	      let value;

	      for (let i = 0; i < length; i++) {
	        value = list[i];
	        if (predicate.call(thisArg, value, i, list)) {
	          return value;
	        }
	      }
	      return undefined;
	    };
	  }

	})

})();
