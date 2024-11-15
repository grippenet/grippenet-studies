import { Expression } from "survey-engine/data_types";
import {  ItemBuilder, _T,questionPools, SurveyBuilder } from "../../../common"
import { vaccinationSurveyKey } from "../../constants";
import { GrippenetFlags } from "../../flags";
import { lastSubmissionQuestion } from "../../questions/lastSubmission";
import * as vaccination from "./questions";
import { ResponseRef } from "../../types";
import ResponseEncoding from "./responses";
import { sign } from "crypto";

const pool = questionPools.vaccination;

export class VaccinationDef extends SurveyBuilder {

    items: ItemBuilder[];

    preventionResponses: ResponseRef[]

    constructor(meta:Map<string,string>) {
        super({
            surveyKey: vaccinationSurveyKey,
            name: _T( "vaccination.name.0", "Vaccination questionnaire"),
            description: _T(
                "vaccination.description.0",
                 "The purpose of the vaccination questionnaire is to find out more about protection given by the vaccine and monitor vaccination uptake in Italy.",
            ),
            durationText: _T(
                "vaccination.typicalDuration.0", "Duration 5-10 minutes"
            ),
            metadata: meta,
        });

        this.items = [];
        this.preventionResponses = [];

        const rootKey = this.key

        const Prelude = new vaccination.SurveyPrelude({parentKey: rootKey}, 'P0');
        this.items.push(Prelude);

        const QLastSubmit = new lastSubmissionQuestion({parentKey: rootKey, itemKey:'submission', flagKey: GrippenetFlags.lastVaccination.key, trans:'weekly.lastsubmission'});
        this.items.push(QLastSubmit);

        const vaccGroup = this.buildVaccGroup(rootKey);

        this.items.push(...vaccGroup);
        
        const QSurveyEnd = new pool.FinalText({parentKey: rootKey});
        this.items.push(QSurveyEnd);
    }

    buildVaccGroup(rootKey: string): ItemBuilder[] {

        /**
         * "SurveyPrelude": "vaccination.P0",
        "lastSubmissionQuestion": "vaccination.submission",
        "FluVaccinationVoucher": "vaccination.Q18",
        "FluVaccineThisSeason": "vaccination.Q10",
        "FluVaccineThisSeasonWhen": "vaccination.Q10b",
        "FluVaccinationByWhom": "vaccination.Q10e",
        "FluVaccineThisSeasonReasonFor": "vaccination.Q10c",
        "FluVaccineThisSeasonReasonAgainst": "vaccination.Q10d",
        "FluVaccineLastSeason": "vaccination.Q9",
        "CovidVac": "vaccination.Q35",
        "CovidDateLastVaccine": "vaccination.Q35j",
        "CovidVaccineAgainstReasons": "vaccination.Q35m",
        "LastCovid19Infection": "vaccination.Q37",
        "FinalText": "vaccination.surveyEnd"
         */

        const items : ItemBuilder[] = [];

        // Q18
        const Q_flu_vaccin_voucher = new vaccination.FluVaccinationVoucher({parentKey:rootKey, isRequired:true});
        items.push(Q_flu_vaccin_voucher);
        
        //Q10
        const Q_flu_vaccine_this_season = new pool.FluVaccineThisSeason({parentKey:rootKey, isRequired:true});
        items.push(Q_flu_vaccine_this_season);

        this.preventionResponses.push({'itemKey': Q_flu_vaccine_this_season.key, 'responses': [ResponseEncoding.flu_vaccine_season.yes], 'type': 'single'})
        
        // Q10b
        const Q_flu_vaccine_this_season_when = new pool.FluVaccineThisSeasonWhen({parentKey:rootKey, keyFluVaccineThisSeason:Q_flu_vaccine_this_season.key, isRequired:false});
        items.push(Q_flu_vaccine_this_season_when);

        // Q10e
        const Q_flu_vaccin_by_whom = new vaccination.FluVaccinationByWhom({parentKey: rootKey, isRequired: false});
        Q_flu_vaccin_by_whom.setCondition(Q_flu_vaccine_this_season.createIsVaccinatedCondition());
        items.push(Q_flu_vaccin_by_whom);

        // Q10c
        const Q_flu_vaccine_this_season_reasons_for = new vaccination.FluVaccineThisSeasonReasonFor({parentKey:rootKey, keyFluVaccineThisSeason:Q_flu_vaccine_this_season.key, isRequired:false});
        items.push(Q_flu_vaccine_this_season_reasons_for);

        this.preventionResponses.push({
            'itemKey': Q_flu_vaccine_this_season_reasons_for.key, 
            'responses': [ResponseEncoding.flu_vac_reason.voucher, ResponseEncoding.flu_vac_reason.riskgroup], 
            'type': 'multiple'
        });
 
        // Q10d
        const Q_flu_vaccine_this_season_reasons_against = new vaccination.FluVaccineThisSeasonReasonAgainst({parentKey:rootKey, keyFluVaccineThisSeason: Q_flu_vaccine_this_season.key, isRequired:false});
        items.push(Q_flu_vaccine_this_season_reasons_against);

        // Q9
        const Q_flu_vaccine_last_season = new pool.FluVaccineLastSeason({parentKey:rootKey, isRequired:true});
        items.push(Q_flu_vaccine_last_season);

        // Q35v2 (replaces Q35)
        const Q_covidVac = new vaccination.CovidVacThisSeason({parentKey:rootKey, isRequired:true});
        items.push(Q_covidVac);

        // Q35n
        const Q_lastCovidVac= new vaccination.LastCovidVaccine({parentKey: rootKey, isRequired: true});
        items.push(Q_lastCovidVac);

        /*
        const Q_vaccineBrand = new pool.CovidVaccineBrand({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_vaccineBrand.get());

        const Q_vaccineShots = new pool.CovidVaccineShots({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_vaccineShots.get());
        */

        
        /** removed 2024
        // Q35j
        const Q_dateLastVaccine = new pool.CovidDateLastVaccine({parentKey:rootKey, keyVac:Q_covidVac.key, isRequired:false});
        items.push(Q_dateLastVaccine);
        */

        /*
        const Q_secondShotPlan = new pool.CovidSecondShotPlan({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, keyVaccineShots: Q_vaccineShots.key, isRequired:true});
        items.push(Q_secondShotPlan.get());

        const Q_secondShotContra = new pool.CovidSecondShotAgainstReason({parentKey:hasVaccineGroupKey, keyVac: Q_covidVac.key, keyVaccineShots:Q_secondShotPlan.key, isRequired:true});
        items.push(Q_secondShotContra.get());

        const Q_vaccinePro = new pool.CovidVaccineProReasons({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_vaccinePro.get());
        */

        // Q35m
        const Q_vaccineContra = new vaccination.CovidVaccineAgainstReasons({parentKey:rootKey, keyVac:Q_covidVac.key, isRequired:false});
        items.push(Q_vaccineContra);
        
        /** removed 2024
        // Q37
        const Q_lastCovidInfection = new vaccination.LastCovid19Infection({parentKey: rootKey, isRequired: false});
        items.push(Q_lastCovidInfection);
         */
        return items;
    }

    buildSurvey() {
        for (const item of this.items) {
            this.addItem(item.get());
        }
    }

    getInfluenzaPreventionResponses(): ResponseRef[] {
        return this.preventionResponses;
    }

    
}
