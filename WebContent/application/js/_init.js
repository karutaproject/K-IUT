//----------------------------------
var application_version = "3.0";
var application_date = "2018-03-17";
//----------------------------------
var appliname = 'k-iut';
//---------
var bckname = '';
var serverBCK = "karuta-backend"+bckname+"/rest/api";
var serverFIL = "karuta-backend"+bckname;
var serverVER = "karuta-backend"+bckname;
//----ELGG-----
var elgg_installed = false;
var elgg_url_base = '';
var elgg_url_absolute = '';
var elgg_auth_cas = false;
var g_elgg_refreshing = 120000; // 120s 
//----------------------------------
var languages = [];
var languages_name = [];
languages [0] = 'fr';
languages_name ['fr'] = 'Français';
languages [1] = 'en';
languages_name ['en'] = 'English';
//----------------------------------
var NONMULTILANGCODE = 0;  // default language if non-multilingual
var LANGCODE = 0; //default value
var LANG = languages[LANGCODE]; //default value
//----------------------------------
var carte_metiers_url =  "https://iut2.univ-grenoble-alpes.fr/metiers/";
var freerome = false;
var freerome_url = "";
var cas_url = "";
var quizz_interculturel = false;
var message_logo = "/application/img/logo-eportfolio4.jpg";