import { navToRegistration, navToDashboard } from "./modules/navigator.js";
import { checkUser } from "./modules/firebase.js";

$('.getStartedButton').click(async function() {
    if (await checkLoggin()) {
        navToDashboard();
    } else {
        navToRegistration();
    }
});

async function checkLoggin() {
    return await checkUser();
}
