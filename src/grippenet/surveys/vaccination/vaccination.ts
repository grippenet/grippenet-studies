import {  ItemBuilder, _T,questionPools, SurveyBuilder } from "../../../common"
import * as vaccination from "./questions";

const pool = questionPools.vaccination;

export class VaccinationDef extends SurveyBuilder {

    items: ItemBuilder[];

    constructor(meta:Map<string,string>) {
        super({
            surveyKey: 'vaccination',
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

        const rootKey = this.key

        const Prelude = new vaccination.SurveyPrelude({parentKey: rootKey}, 'P0');
        this.items.push(Prelude);

        const vaccGroup = this.buildVaccGroup(rootKey);

        this.items.push(...vaccGroup);
        
        const QSurveyEnd = new pool.FinalText({parentKey: rootKey});
        this.items.push(QSurveyEnd);
    }

    buildVaccGroup(rootKey: string): ItemBuilder[] {

        const items : ItemBuilder[] = [];

        const Q_flu_vaccin_voucher = new vaccination.FluVaccinationVoucher({parentKey:rootKey, isRequired:true});
        items.push(Q_flu_vaccin_voucher);
        
        const Q_flu_vaccine_this_season = new pool.FluVaccineThisSeason({parentKey:rootKey, isRequired:false});
        items.push(Q_flu_vaccine_this_season);
        
        const Q_flu_vaccine_this_season_when = new pool.FluVaccineThisSeasonWhen({parentKey:rootKey, keyFluVaccineThisSeason:Q_flu_vaccine_this_season.key, isRequired:false});
        items.push(Q_flu_vaccine_this_season_when);

        const Q_flu_vaccin_by_whom = new vaccination.FluVaccinationByWhom({parentKey: rootKey, isRequired: true});
        Q_flu_vaccin_by_whom.setCondition(Q_flu_vaccine_this_season.createIsVaccinatedCondition());
        items.push(Q_flu_vaccin_by_whom);

        const Q_flu_vaccine_this_season_reasons_for = new vaccination.FluVaccineThisSeasonReasonFor({parentKey:rootKey, keyFluVaccineThisSeason:Q_flu_vaccine_this_season.key, isRequired:true});
        items.push(Q_flu_vaccine_this_season_reasons_for);

        const Q_flu_vaccine_this_season_reasons_against = new vaccination.FluVaccineThisSeasonReasonAgainst({parentKey:rootKey, keyFluVaccineThisSeason: Q_flu_vaccine_this_season.key, isRequired:false});
        items.push(Q_flu_vaccine_this_season_reasons_against);

        const Q_flu_vaccine_last_season = new pool.FluVaccineLastSeason({parentKey:rootKey, isRequired:true});
        items.push(Q_flu_vaccine_last_season);

        const Q_covidVac = new pool.CovidVac({parentKey:rootKey, isRequired:true});
        items.push(Q_covidVac);

        /*
        const Q_vaccineBrand = new pool.CovidVaccineBrand({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_vaccineBrand.get());

        const Q_vaccineShots = new pool.CovidVaccineShots({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_vaccineShots.get());
        */

        const Q_dateLastVaccine = new pool.CovidDateLastVaccine({parentKey:rootKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_dateLastVaccine);

        /*
        const Q_secondShotPlan = new pool.CovidSecondShotPlan({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, keyVaccineShots: Q_vaccineShots.key, isRequired:true});
        items.push(Q_secondShotPlan.get());

        const Q_secondShotContra = new pool.CovidSecondShotAgainstReason({parentKey:hasVaccineGroupKey, keyVac: Q_covidVac.key, keyVaccineShots:Q_secondShotPlan.key, isRequired:true});
        items.push(Q_secondShotContra.get());

        const Q_vaccinePro = new pool.CovidVaccineProReasons({parentKey:hasVaccineGroupKey, keyVac:Q_covidVac.key, isRequired:true});
        items.push(Q_vaccinePro.get());
        */

        const Q_vaccineContra = new vaccination.CovidVaccineAgainstReasons({parentKey:rootKey, keyVac:Q_covidVac.key, isRequired:false});
        items.push(Q_vaccineContra);
        
        const Q_lastCovidInfection = new vaccination.LastCovid19Infection({parentKey: rootKey});
        items.push(Q_lastCovidInfection);

        return items;
    }

    buildSurvey() {
        for (const item of this.items) {
            this.addItem(item.get());
        }
    }
}
