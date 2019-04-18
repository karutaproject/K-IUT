//----------------------------------
var application_version = "3.0";
var application_date = "2019-04-18";
//----------------------------------
var appliname = 'ftlv';
var applitype = 'FTLV';   // FTLV ou KIUT
//---------
var bckname = '-ftlv';
var serverBCK = "karuta-backend"+bckname+"/rest/api";
var serverFIL = "karuta-backend"+bckname;
var serverVER = "karuta-backend"+bckname;
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
var carte_metiers_url =  "";
var freerome = false;
var freerome_url = "";
var cas_url = "";
var message_logo = "/application/img/logo-eportfolio4.jpg";