import { LanguageHelpers } from "../../common";

import intake from "./intake.json";
//import weekly from "./weekly.json";
//import vaccination from "./vaccination.json";
import common from "./common.json";

const languageId = "fr";

LanguageHelpers.addLanguage(languageId, common, 'common');
LanguageHelpers.addLanguage(languageId, intake, 'intake');
//LanguageHelpers.addLanguage(languageId, weekly, 'weekly');
//LanguageHelpers.addLanguage(languageId, vaccination, 'vaccination');
