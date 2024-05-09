const moment = require('moment');

type PapaDaysData = { name: string; start: Date, end: Date }[];
let papaDays: PapaDaysData = [];
type holidayData = { start: string, end: string }[];
let holidaysList: holidayData = [];

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

function yearData(): [boolean, number, number] {
    const previousYear: number = new Date().getFullYear()-1;
    const currentYear: number = new Date().getFullYear();
    const isCurrentYearEven: boolean = currentYear % 2 === 0;
    return [isCurrentYearEven, previousYear, currentYear];
}

function getHolidays(): Promise<PapaDaysData> {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?limit=20&refine=zones%3A"Zone%20B"&refine=location%3A"Nancy-Metz"&refine=population%3A"Élèves"&refine=population%3A"-"&refine=annee_scolaire:"${yearData()[1]}-${yearData()[2]}"`);
            const json = await response.json() as JsonData;
    
            const startDates = json.results.map((item) => item.start_date);
            let middleDates: string[] = [];
            const endDates = json.results.map((item) => item.end_date);
            for (let i = 0; i < startDates.length; i++) {
                if (i != 2) {
                    holidaysList.push({ start: startDates[i], end: endDates[i] });
                }
            }
            
            for (const dateString of startDates) {
                const date = new Date(dateString);
                const middleDate = new Date(date);
                if (middleDates.length === 5) {
                    middleDate.setDate(date.getDate() + 28);
                } else {
                    middleDate.setDate(date.getDate() + 7);
                }
                middleDates.push(middleDate.toISOString());
            }

            let isPapa = yearData();
            const splittedHolidays: PapaDaysData = [
                { name: "Toussaint", start: isPapa ? new Date(middleDates[3]) : new Date(startDates[3]), end: isPapa ? new Date(endDates[3]): new Date(middleDates[3]) },
                { name: "Noel", start: isPapa ? new Date(middleDates[0]) : new Date(startDates[0]), end: isPapa ? new Date(endDates[0]) : new Date(middleDates[0]) },
                { name: "Hiver", start: isPapa ? new Date(startDates[1]) : new Date(middleDates[1]), end: isPapa ? new Date(middleDates[1]): new Date(endDates[1]) },
                { name: "Printemps", start: isPapa ? new Date(startDates[4]) : new Date(middleDates[4]), end: isPapa ? new Date(middleDates[4]): new Date(endDates[4]) },
                { name: "Ete", start: isPapa ? new Date(startDates[5]) : new Date(middleDates[5]), end: isPapa ? new Date(middleDates[5]): new Date(endDates[5]) },
              ];
    
            resolve(splittedHolidays);
        } catch (error) {
            reject(error);
        }
    });
}

function isOverlapping(newStart: Date, newEnd: Date): boolean {
    for (let i = 0; i < holidaysList.length; i++) {
        if (newStart >= new Date(holidaysList[i].start) && newEnd <= new Date(holidaysList[i].end)) {
            return true;
        }
    }
    return false;
}

function getWeekends() {
    let papa: string[] = [];
    let weekNum: number = 0;
    let fridayList: Date[] = [];
    let sundayList: Date[] = [];

    while (weekNum < 1000) {
        weekNum++;
        if (weekNum%2 === 0) {
            papa.push(weekNum.toString());
        }
    }

    for (let i in papa) {
        const friday = moment().isoWeek(papa[i]).add(1, 'days').toDate();
        const sunday = moment().isoWeek(papa[i]).add(3, 'days').toDate();
        fridayList.push(new Date(friday));
        sundayList.push(new Date(sunday));
    }

    for (let i = 0; i < papa.length; i++) {
        const newStart = fridayList[i];
        const newEnd = sundayList[i];
        if (!isOverlapping(newStart, newEnd)) {
            papaDays.push({ name: (i+1).toString(), start: newStart, end: newEnd });
        }
    }
}

getHolidays().then(holidays => {
    papaDays = [...papaDays, ...holidays];
    getWeekends()
}).catch(error => {
    console.error('Error fetching holidays:', error);
});

export { papaDays };