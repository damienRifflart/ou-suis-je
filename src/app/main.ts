const moment = require('moment');

interface ApiParameter {
    description: string;
    population: string;
    start_date: string;
    end_date: string;
    location: string;
    zones: string;
    annee_scolaire: string;
}

interface JsonData {
    total_count: number;
    results: ApiParameter[];
}

function yearData() {
    const previousYear: number = new Date().getFullYear()-1;
    const currentYear: number = new Date().getFullYear();
    const isCurrentYearEven: boolean = currentYear % 2 === 0;
    return [isCurrentYearEven, previousYear, currentYear];
}

function getHolidays() {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?limit=20&refine=zones%3A"Zone%20B"&refine=location%3A"Nancy-Metz"&refine=population%3A"Élèves"&refine=population%3A"-"&refine=annee_scolaire%3A"${yearData()[1]}-${yearData()[2]}"`);
            const json = await response.json() as JsonData;
    
            const startDates = json.results.map((item) => item.start_date);
            let middleDates: string[] = [];
            const endDates = json.results.map((item) => item.end_date);
            
            for (const dateString of startDates) {
                const date = new Date(dateString);
                const middleDate = new Date(date);
                if (middleDates.length === 5) {
                    middleDate.setDate(date.getDate() + 29);
                } else {
                    middleDate.setDate(date.getDate() + 8);
                }
                middleDates.push(middleDate.toISOString());
            }

            let isPapa = yearData();
            const splittedHolidays = [
                {"Noel": [startDates[0], `${isPapa ? "0" : "1"}`, middleDates[0], `${isPapa ? "1" : "0"}`, endDates[0]]},
                {"Hiver": [startDates[1], `<-- ${isPapa ? "1" : "0"}`, middleDates[1], `${isPapa ? "0" : "1"}`, endDates[1]]},
                {"Toussaint": [startDates[3], `<-- ${isPapa ? "1" : "0"}`, middleDates[3], `${isPapa ? "0" : "1"}`, endDates[3]]},
                {"Printemps": [startDates[4], `<-- ${isPapa ? "1" : "0"}`, middleDates[4], `${isPapa ? "0" : "1"}`, endDates[4]]},
                {"Ete": [startDates[5], `<-- ${isPapa ? "1" : "0"}`, middleDates[5], `${isPapa ? "0" : "1"}`, endDates[5]]}
            ];
    
            resolve(splittedHolidays);
        } catch (error) {
            reject(error);
        }
    });
}

function getWeekends() {
    let papa: string[] = [];
    let maman: string[] = []; 
    let weekNum: number = 0;
    let fridayList: Date[] = [];
    let sundayList: Date[] = [];

    while (weekNum < 152) {
        weekNum++;
        if (weekNum%2 === 0) {
            papa.push(weekNum.toString());
        } else {
            maman.push(weekNum.toString());
        }
    }

    for (let i in papa) {
        const friday = moment().isoWeek(papa[i]).add(2, 'days').toDate();
        const sunday = moment().isoWeek(papa[i]).add(4, 'days').toDate();
        fridayList.push(friday);
        sundayList.push(sunday);
    }

    return [fridayList, sundayList];
}
 
getHolidays().then(holidays => {
    console.log(holidays);
    console.log(getWeekends());
}).catch(error => {
    console.error('Error fetching holidays:', error);
});