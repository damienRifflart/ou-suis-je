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

            console.log(middleDates)

            let isPapa = yearData();
            const splittedHolidays = [
                {"Noel": [startDates[0], `<-- ${isPapa ? "maman" : "papa"} -->`, middleDates[0], `<-- ${isPapa ? "papa" : "maman"} -->`, endDates[0]]},
                {"Hiver": [startDates[1], `<-- ${isPapa ? "papa" : "maman"} -->`, middleDates[1], `<-- ${isPapa ? "maman" : "papa"} -->`, endDates[1]]},
                {"Toussaint": [startDates[3], `<-- ${isPapa ? "papa" : "maman"} -->`, middleDates[3], `<-- ${isPapa ? "maman" : "papa"} -->`, endDates[3]]},
                {"Printemps": [startDates[4], `<-- ${isPapa ? "papa" : "maman"} -->`, middleDates[4], `<-- ${isPapa ? "maman" : "papa"} -->`, endDates[4]]},
                {"Ete": [startDates[5], `<-- ${isPapa ? "papa" : "maman"} -->`, middleDates[5], `<-- ${isPapa ? "maman" : "papa"} -->`, endDates[5]]}
            ];
    
            resolve(splittedHolidays);
        } catch (error) {
            reject(error);
        }
    });
}

getHolidays().then(holidays => {
    console.log(holidays);
}).catch(error => {
    console.error('Error fetching holidays:', error);
});