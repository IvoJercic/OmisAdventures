var app = angular.module('routeApp', ['ngRoute']);

//OVO SU POSTAVKE ROUTINGA, OVISNO O URL-U PRIKAŽI TEMPLATE I POSTAVI TAJ CONTROLLER AKO GA IMA
app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'main.html'
        })
        .when('/canyoning', {
            templateUrl: 'canyoning.html'
        })
        .when('/rock-climbing', {
            templateUrl: 'rock-climbing.html'
        })
        .when('/kayaking', {
            templateUrl: 'kayaking.html'
        })
        .when('/hiking', {
            templateUrl: 'hiking.html'
        })
        .when('/obrazac', {
            templateUrl: 'obrazac.html',
            controller: 'formCtrl'
        })
        .when('/info', {
            templateUrl: 'info.html',
            controller: 'infoCtrl'
        })
        .when('/contact-page', {
            templateUrl: 'contact-page.html',
            controller: 'contactCtrl'
        })
        .when('/user', {
            templateUrl: 'user.html'
        })
        .otherwise({
            redirectTo: '/'
        });

        /*ovo je samo da se riješi problem sa URL-om, kad se klikne na link npr /obrazac
         -> / se encodira u %2F*/
        $locationProvider.hashPrefix('');
}]);


//CONTROLLER ZA OBRAZAC
app.controller('formCtrl', ["$scope", "$interval", function ($scope, $interval) {
    //za prvu formu
    $scope.brLjudi = 2;
    $scope.datum = new Date();
    $scope.danasnjiDatum = new Date();
    $scope.mail = '';
    $scope.vrijeme = '9:00 h';
    $scope.izlet = 'Canyoning';
    $scope.pleasewait = false;

    //za drugu formu
    $scope.ime = '';
    $scope.prezime = '';
    $scope.rodendan = new Date(1996, 1, 1);
    $scope.granicaGod = new Date(2008, 1, 1).getFullYear();
    $scope.drzava = 'Croatia';
    $scope.spol = 'M';

    $scope.prikazForme = true;

    //varijable za provjere
    $scope.trenutniGosti = [];
    $scope.slobodno = 2;
    $scope.zauzeto = 0;
    $scope.obavijest = ''; //ovo se ispisuje u div ovisno o rezultatu upita na bazu npr pun termin
    $scope.trenutniUnos = 1; //da znamo kojeg gosta unosimo i koliko puta prikazati formu za unos
    $scope.gost = {}; //spremamo gosta


    $scope.checkInput = function (a, b, c) {
        if (a == true || b == true || c == undefined)
            return true;

        if (c.getMonth() < $scope.danasnjiDatum.getMonth() || c.getFullYear() < $scope.danasnjiDatum.getFullYear())
            return true;
    };

    $scope.checkInput2 = function (a, b) {
        if (a == true || b == true)
            return true;
        if ($scope.rodendan.getFullYear() >= $scope.granicaGod)
            return true;
    };

    $scope.formatirajDatum = function (datum) {
        datum = datum.getDate()+'-'+(datum.getMonth()+1)+'-'+datum.getFullYear();
        return datum;
    };

    $scope.brojLjudiUTerminu = function (slobodno) {
        db = firebase.database();
        var gostiRef = db.ref('gosti');
        $scope.pleasewait = true;
        $scope.zauzeto = 0;

        //Pretraga po izabranom terminu
        gostiRef.orderByChild('Vrijeme').equalTo($scope.vrijeme).on('child_added', function (snapshot) {
            if (snapshot.val().Datum == $scope.formatirajDatum($scope.datum) && snapshot.val().Vrijeme == $scope.vrijeme && snapshot.val().Izlet == $scope.izlet) {
                $scope.zauzeto += 1;
            }
        });

        /*ovde se koristi $scope.$apply metoda jer se radi o setTimeout funckiji koja je čisti JS, pa
        AngularJS ne zna o tome ništa i ako mijenjamo njegovu varijablu unutra on neće to skužit pa moramo
        mi to pozvat sa $apply metodom*/
        setTimeout(function () { 
            if (($scope.slobodno - $scope.zauzeto - $scope.brLjudi) < 0) {
                $scope.$apply(function() {
                    $scope.obavijest = 'We\'re sorry but on day: ' + $scope.formatirajDatum($scope.datum) + ' at: ' + $scope.vrijeme + ' places are full. Please choose another date!';
                    $scope.pleasewait = false;
                });
            }
            else {
                $scope.$apply(function() {
                    $('#forma2').show('2000');
                    $scope.prikazForme = false;
                    $scope.obavijest = '';
                });      
            }  
        }, 2000); 
    };

    $scope.unos = function () {
            $scope.gost = {
                'Ime': $scope.ime,
                'Prezime': $scope.prezime,
                'Rodenje': $scope.formatirajDatum($scope.rodendan),
                'Izlet': $scope.izlet,
                'Datum': $scope.formatirajDatum($scope.datum),
                'Vrijeme': $scope.vrijeme,
                'Mail': $scope.mail,
                'Drzava': $scope.drzava,
                'Spol': $scope.spol
            };

            $scope.trenutniGosti.push($scope.gost);
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.status == 200 && request.readyState == 4) {
                    console.log("Podaci spremljeni");
                }
            };
            request.open("POST", "https://adventure-omis.firebaseio.com/gosti.json", true);
            request.send(JSON.stringify($scope.gost));
         
            if ($scope.trenutniUnos == $scope.brLjudi) {
                $scope.obavijest = 'You\'ve successfully registered all the adventurers. Thank you!';
                setTimeout(function () {
                    window.location = 'index.html';
                }, 2000);
            }
            else{
                $scope.trenutniUnos += 1;
                $("#forma2").hide();
                $("#forma2").show(2000);
                $scope.ocistiInpute();
            }       
    };

    $scope.ocistiInpute = function () {
        $scope.ime = '';
        $scope.prezime = '';
        $scope.rodendan = new Date(1996, 1, 1);
        $scope.drzava = 'Croatia';
    };

}]);

//CONTROLLER ZA CONTACT PAGE, PROVEJRAVA JESU LI UNOSI ISPRAVNI I JEL OMOGUĆENO SLANJE
app.controller('contactCtrl', ['$scope', function($scope) {
    //ZA CONTACT-PAGE
    $scope.name = '';
    $scope.email = '';

    $scope.pleasewait = true;

    $scope.validate = function (a, b) {
        if (a == true || b == true)
            return true;
    };

    $scope.clicked = function () {
        $scope.pleasewait = false;
    };
}]);

//CONTROLLER ZA LINKOVE NA NAVIGACIJI, ON RADI UVIK KAKO BI OZNAČIO NA KOJOJ SMO STRANICI
app.controller('linkCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
        var active = (viewLocation === $location.path());
        return active;
    };
}]);

//CONTROLLER ZA MAPU, ON SE UČITAVA KADA JE NA INFO.HTML
app.controller('infoCtrl', ['$scope', function($scope) {
    $scope.geoSirina = 0;
    $scope.geoDuzina = 0;

    $scope.directionsService = 0;
    $scope.directionsDisplay = 0;

    //varijable za kontrolu prikaza gumbova za ucitatMapu, pronacRutu ...
    $scope.prikaziNaslov = false;
    $scope.prikaziUcitajMapu = true;
    $scope.prikaziPronadjiRutu = false;

    //varijabla koja kontrolira prikaz informacija o korisnikovoj poziciji i poruku uspjeha/neuspjeha
    $scope.infoAboutRoute = false;
    $scope.locationText = "";
    $scope.error = false;

    $scope.initMap = function() {
        $scope.directionsService = new google.maps.DirectionsService;
        $scope.directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 8,
            center: { lat: 43.4460654, lng: 16.6892128 }
        });
        var uluru = { lat: 43.4460654, lng: 16.6892128 };

        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
        $scope.directionsDisplay.setMap(map);

        $scope.prikaziNaslov = true;
        $scope.prikaziUcitajMapu = false;
    };

    $scope.pronadiUredaj = function() {
        var opcije = { enableHighAccuracy: false };
        navigator.geolocation.getCurrentPosition($scope.uspjeh, $scope.neuspjeh, opcije);
    };

    $scope.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
        var waypts = [];
        directionsService.route({
            origin: $scope.geoSirina + "," + $scope.geoDuzina,
            destination: "43.4460654,16.6892128",
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);

            } else {
                $scope.locationText = "We're sorry we couldn't find the route";
                $scope.error = true;
            }
        });
    };

    $scope.uspjeh = function(rezultat) {
        $scope.geoSirina = rezultat.coords.latitude;
        $scope.geoDuzina = rezultat.coords.longitude;
        $scope.infoAboutRoute = true;
        $scope.prikaziPronadiRutu = true;
    };

    $scope.neuspjeh = function(err) {
        $scope.locationText = "We're sorry we couldn't find your location";
        $scope.error = true;
    };
}]);