/*
 COPYRIGHT LICENSE: This information contains sample code provided in source
 code form. You may copy, modify, and distribute these sample programs in any
 form without payment to IBM for the purposes of developing, using, marketing
 or distributing application programs conforming to the application programming
 interface for the operating platform for which the sample code is written.

 Notwithstanding anything to the contrary, IBM PROVIDES THE SAMPLE SOURCE CODE
 ON AN "AS IS" BASIS AND IBM DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING,
 BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY,
 SATISFACTORY QUALITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND ANY WARRANTY OR
 CONDITION OF NON-INFRINGEMENT. IBM SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR
 OPERATION OF THE SAMPLE SOURCE CODE. IBM HAS NO OBLIGATION TO PROVIDE
 MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS OR MODIFICATIONS TO THE SAMPLE
 SOURCE CODE.

 (C) Copyright IBM Corp. 2015.

All Rights Reserved. Licensed Materials - Property of IBM.
*/
/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

var env = require('../env-config.json');

// anonymous function expression, to be evaluated immediately:
(function(document) {
    'use strict';

    // Grab a reference to our auto-binding template
    // and give it some initial binding values
    // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
    var app = document.querySelector('#app');
    var locationSocket;
    var appuser;
    var longitudePrev = 0;
    var latitudePrev = 0;
                
    app.displayInstalledToast = function() {
        // Check to make sure caching is actually enabled—it won't be in the dev environment.
        if (!document.querySelector('platinum-sw-cache').disabled) {
            document.querySelector('#caching-complete').show();
        }
    };

    // Listen for template bound event to know when bindings
    // have resolved and content has been stamped to the page
    app.addEventListener('dom-change', function() {
        console.log('Bluetag app.js, adding dom-change event listeners...');
	
	    document.querySelector('get-username').addEventListener('kick', function(e) {
            document.querySelector('#searchinput').disabled = false;
	        console.log('App user is ' + e.detail.q);
	        appuser = e.detail.q;
	
	        //create the location service webSocket
            app.openLocationSocket();
	        // locationSocket = new WebSocket(env.location + 'wsLocationResource');
	        // locationSocket.onopen = function(msg) {console.log('Location service webSocket Open: ' + JSON.stringify(msg));};
	        // locationSocket.onmessage = function(msg) {console.log('Location service webSocket onMessage: ' + JSON.stringify(msg));};
         //    locationSocket.onclose = function(msg) {console.log('Location service websocket onclose: ' + JSON.stringify(msg));};
	var locationTimer = setInterval(app.locationTimer, 60000);
	        document.querySelector('my-map').addEventListener('locupdate', function(e) {
	            console.log('Location changed: ' + 'lat: ' + e.detail.lat + ' lon: ' + e.detail.lon);
		
    	        if (appuser !== null) {
    		        var userloc = {
    						_id: appuser,
    						longitude: e.detail.lon,
    						latitude: e.detail.lat };
                    var userlocJSON = JSON.stringify(userloc)

    		        console.log('Sending location update over socket: ' + userlocJSON );
    		        //TODO - this socket will timeout if location data is not flowing - need to add error checking
                    if (locationSocket.readyState === 1){
                        console.log('my-map.locupdate event handler, sending loc update over websocket');
                        locationSocket.send(userlocJSON);
                    } else {
                        setTimeout( function () {
                            console.log('my-map.locupdate event handler, open websocket, wait 500ms');
                            app.openLocationSocket();
                        }, 1000);
                        console.log('my-map.locupdate event handler, sending loc update over websocket');
                        locationSocket.send(userlocJSON);
                    }				  
    	        }
            }); // end querySelector('my-map').addEventListener
	    

        //Geolocation functions and callbacks.   See https://developer.mozilla.org/en-US/docs/Web/API/Geolocation

        function getCurrentPositionSuccess(pos) {
            var crd = pos.coords;

            console.log('one time, getCurrentPosition callback: current position is:');
            console.log('Latitude : ' + crd.latitude);
            console.log('Longitude: ' + crd.longitude);
            console.log('Altitude: '  + crd.altitude);
            console.log('More or less ' + crd.accuracy + ' meters.');
            var singleLat = crd.latitude;
            var singleLon = crd.longitude;

            //console.log('geting single position to center map once: ' + singleLat + ' , ' + singleLon);
            //TODO why g-mark AND markitlat?
            document.querySelector('#latdiv').innerHTML = singleLat;
                document.querySelector('#londiv').innerHTML = singleLon;
            document.querySelector('#g-map').latitude = singleLat;
            document.querySelector('#g-map').longitude = singleLon;

            document.querySelector('#g-mark').latitude = singleLat;
            document.querySelector('#g-mark').longitude = singleLon;

            document.querySelector('#markitlat').innerHTML = singleLat;
            document.querySelector('#markitlon').innerHTML = singleLon;
        };

        function getCurrentPositionError(err) {
          console.warn('ERROR(getCurrentPosition callback: ' + err.code + '): ' + err.message);
        };

        function getWatchPositionSucess(pos) {
            var crd = pos.coords;
            console.log('getWatchPosition callback: current position is lat,lon,alt,accuracy(meters): ' + crd.latitude + ',' + crd.longitude + ',' + crd.altitude + ',' + crd.accuracy);
            //TODO if onlyupdateonpress is set we do not send loc updates to the service.  Saves data during debug
            //TODO enable the setting on the UI
            if (!(document.querySelector('#onlyupdateonpress').active)) {
                var longitude = crd.longitude;
                var latitude = crd.latitude;
                var d = getDistanceFromLatLonInKm(latitude,longitude, latitudePrev, longitudePrev)
                 
                console.log('distance moved: ' + d);

                longitudePrev = crd.longitude;
                latitudePrev = crd.latitude;

                //document.querySelector('#location').innerHTML = latitude + "," + longitude;
                //console.log('app.js watchpos: ' + latitude + ',' + longitude );
                document.querySelector('#latdiv').innerHTML = latitude;
                document.querySelector('#londiv').innerHTML = longitude;
                document.querySelector('#distdiv').innerHTML = d;
                var updatemap = document.querySelector('#locupdate-center').getAttribute('value');
                console.log('Location changed - recenter map?: ' + updatemap);
                if (updatemap === "true") {
                    document.querySelector('#g-map').latitude = latitude;
                    document.querySelector('#g-map').longitude = longitude;
                                    
                    document.querySelector('#g-mark').latitude = latitude;
                    document.querySelector('#g-mark').longitude = longitude;
                }
                document.querySelector('#markitlat').innerHTML = latitude;
                document.querySelector('#markitlon').innerHTML = longitude;

                if(appuser !== null) {
                    var userloc = {
                        _id: appuser,
                        longitude: longitude,
                        latitude: latitude}; 
                    var userlocJSON = JSON.stringify(userloc);
                    console.log('userlocJSON'+userlocJSON);                                                                       
                    try {   
                        console.log('Trying to send location update over websocket: ' + userlocJSON);

                        //readyState means socket is open and ready to communicate. If state is 2 (Closing) or 3 (Closed) try to re-open
                        //the socket before sending location again
                        if(locationSocket.readyState === 1){
                            console.log('getWatchPosition callback, sending loc update over websocket');
                            locationSocket.send(userlocJSON);
                        } else {
                            console.log('getWatchPosition callback, setTimeout');
                            setTimeout( function () {
                                console.log('getWatchPosition callback, create new websocket and wait 1s...');
                                app.openLocationSocket();
                            }, 1000);
                            console.log('getWatchPosition callback, sending loc update over websocket');
                            locationSocket.send(userlocJSON);
                        }
                    } catch(err) {
                        console.log('getWatchPosition callback websocket request failed because: ' + err.message);
                    }
                    document.getElementById('taggable').generateRequest();
                }
            }
        }
        function getWatchPositionError(error) {
            console.warn('ERROR getWatchPosition callback: ' + error.code + ': ' + error.message);
        }
        
        var options={enableHighAccuracy: true, timeout: 60000, maximumAge: 10000};

        //added getCurrentPosition so map centers once around current location - then only marker will be updated to show marker
        //moving on stationary map. Limits data usage on every map load for testing - to have map re-center on each update comment out
        //getCurrentPosition call and update #g-map in watchPosition call.
          
        navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, getCurrentPositionError, options);
            
        var watchID = navigator.geolocation.watchPosition(getWatchPositionSucess, getWatchPositionError, options);                    
        }); //end querySelector('get-username').addEventListener
        console.log('Bluetag is ready to rock!');
    });  //end addEventListener('dom-change' function
 
    // See https://github.com/Polymer/polymer/issues/1381
    window.addEventListener('WebComponentsReady', function() {
	    console.log('webcomponents ready');
	    app.route = 'splash';
	    document.querySelector('#paperDrawerPanel').closeDrawer();
	    // imports are loaded and elements have been registered

	    
        //setup all microservice URLs based on env-config.json values
        document.querySelector('#meta-config').setAttribute('value', JSON.stringify(env));
	    var urls = document.querySelector('#meta-config').getAttribute('value');
	    
	    document.querySelector('get-username').url = JSON.parse(urls).register + 'api/register/';
	    document.querySelector('get-taggable').url = JSON.parse(urls).engine;
	    document.querySelector('get-taggable').tagUrl = JSON.parse(urls).tag + 'api/tag/';
        document.querySelector('get-tagged').untagUrl = JSON.parse(urls).tag + 'api/untag/';
	    document.querySelector('get-tagged').url = JSON.parse(urls).tag;
        document.querySelector('get-tagged').findPlayerUrl = (JSON.parse(urls).location + 'api/getlocation/').replace('ws', 'http');
	    document.querySelector('mark-it').urlAddMark = JSON.parse(urls).tag + 'api/markit/newmark/';
        document.querySelector('my-places').urlDeleteMark = JSON.parse(urls).tag + 'api/markit/removemark/';
	    document.querySelector('my-places').url = JSON.parse(urls).tag + 'api/markit/marked/';
	    document.querySelector('bt-search').url = JSON.parse(urls).search + 'SearchWS/';
        document.querySelector('bt-search').tagUrl = JSON.parse(urls).tag + 'api/tag/';

	    document.querySelector('ws-element').open(); //TODO opening search socket after url is known - need to change this to work within bt-search

    document.querySelector('google-map').addEventListener('google-map-dragstart', function(e){
        console.log('[app-js] - map dragged, disabling automatic map recenter');
        document.querySelector('#locupdate-center').setAttribute('value', 'false');
    });

    });

    // Main area's paper-scroll-header-panel custom condensing transformation of
	// the appName in the middle-container and the bottom title in the bottom-container.
	// The appName is moved to top and shrunk on condensing. The bottom sub title
	// is shrunk to nothing on condensing.
	addEventListener('paper-header-transform', function(e) {
	    var appName = document.querySelector('#mainToolbar .app-name');
	    var middleContainer = document.querySelector('#mainToolbar .middle-container');
	    var bottomContainer = document.querySelector('#mainToolbar .bottom-container');
	    var detail = e.detail;
	    var heightDiff = detail.height - detail.condensedHeight;
	    var yRatio = Math.min(1, detail.y / heightDiff);
	    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
	    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
	    var scaleBottom = 1 - yRatio;

	    // Move/translate middleContainer
	    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

	    // Scale bottomContainer and bottom sub title to nothing and back
	    //Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

	    // Scale middleContainer appName
	    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onDataRouteClick = function() {
        var drawerPanel = document.querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

    //TODO do we need this one and the above getCurrentPosition?
    app.singleUpdateLocation = function() {
  	        console.log('Single location update');

            navigator.geolocation.getCurrentPosition( function(singlePos) {

                var singleLat = singlePos.coords.latitude;
                var singleLon = singlePos.coords.longitude;

                console.log('getting single position to center map once: ' + singleLat + ' , ' + singleLon);
                document.querySelector('#latdiv').innerHTML = singleLat;
                document.querySelector('#londiv').innerHTML = singleLon;
                document.querySelector('#g-map').latitude = singleLat;
                document.querySelector('#g-map').longitude = singleLon;

                document.querySelector('#g-mark').latitude = singleLat;
                document.querySelector('#g-mark').longitude = singleLon;

                document.querySelector('#markitlat').innerHTML = singleLat;
                document.querySelector('#markitlon').innerHTML = singleLon;

                if(appuser != null) {
                    console.log(appuser);

                    var userloc = {
                        _id: appuser,
                        longitude: singleLon,
                        latitude: singleLat };
                
                    try {
                        console.log('Trying to send through socket: ' + JSON.stringify(userloc));
                        if(locationSocket.readyState === 1){
                        locationSocket.send(JSON.stringify(userloc));
                        } else {
                            app.openLocationSocket();
                        }
                        } catch(err) {
                        console.log('Failed because: ' + err.message);
                    }
                    document.getElementById('taggable').generateRequest();
                }
            },
            function (error) {
                console.warn('ERROR getWatchPosition callback: ' + error.code + ': ' + error.message);
            }
            ); //end navigator.geolocation.getCurrentPosition

        };

    app.showSearchMenu = function() {
        console.log('Show the search menu');
        document.querySelector('#search-dropdown').open();
    };

    app.openLocationSocket = function () {
        locationSocket = new WebSocket(env.location + 'wsLocationResource');
            locationSocket.onopen = function(msg) {
                app.singleUpdateLocation();
                console.log('Location service webSocket Open: ' + JSON.stringify(msg));

            };
            locationSocket.onmessage = function(msg) {console.log('Location service webSocket onMessage: ' + JSON.stringify(msg));};
            locationSocket.onclose = function(msg) {

                console.log('Location service websocket onclose: ' + JSON.stringify(msg));
                setTimeout(app.openLocationSocket, 5000);
            };

    };

    app.locationTimer = function() {
        console.log('ping location socket');
        locationSocket.send('---ping---');
    };

    // Scroll page to top and expand header
    app.scrollPageToTop = function() {
        document.getElementById('mainContainer').scrollTop = 0;
    };

    app.goBackToMap = function() {
        app.route = 'home'
    };

    app.addContactTooltip = function() {
        app.route = 'contact';
    }

	function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	    //var R = 6371; // Radius of the earth in km
	    var R = 6371000; // Radius of the earth in m
	    var dLat = deg2rad(lat2-lat1);  // deg2rad below
	    var dLon = deg2rad(lon2-lon1); 
	    var a = 
	        Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	        Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	    //var d = R * c; // Distance in km
	    var d = Math.round(R * c *100) / 100; // Distance in m rounded to 2 decimals
	    return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

})(document);
