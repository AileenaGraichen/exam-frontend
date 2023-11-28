import { handleHttpErrors, makeOptions } from "../../utils.js";
import { API_URL } from "../../settings.js";

export function initCleanplan(){

    document.getElementById("view-switcher").addEventListener("click", () => {
        let isChecked = document.getElementById("view-switcher").checked; //Kan checke switchen når der trykkes. .checked returnere true eller false. Starter som standard på false. 
        console.log(isChecked)
    })
    setupCleanplanData()
}

async function setupCleanplanData(){
    //Setup 1 div/box whatever for hver rengøringspersonale. Vis om de har en clean plan forbundet. 
    //Sorter så dem der har en plan vises først, og sorteres efter dag, så planer for idag vises først.
    //Vis datoer hvor de har planer, i små underkasser så de kan se hvornår hvert rengøringspersonale er "optaget" med arbejde eller hvor man måske kan tilføje rengøring til en eksisterende plan.

    //  Giv mulig for at switche view? Så enten viser den alle units, og man kan se dem der ikke har planlagt rengøring, hvor status er "ikke rengjort" eller lignende. 
    //^^^En radiobutton eller swtich måske ^^^
    //Ellers viser den alt rengøringspersonale, og de datoer de har planlagte rengøringsplaner. 
    //Selvfølgelig mulighed for at add rengøringsplaner på denne side, og så edit/delete ved at clicke ind på en cleaning plan. 

    //fetchUnits giver også hver units rengøring med. 

    //fetchCleaningStaff henter alle deres cleaning plans forbundet til dem. 

    //Tror ikke Get metoder i cleaningplanService er nødvendige. Vi får alt datoer sammen med de andre ting her. Skal nok bruge "GetOne" metoden til hver modal når der trykkes på en cleaning plan.
}
