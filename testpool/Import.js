/*
    [JavaScript V8] JS Importer library
    Coded by @DosX_Plus (Telegram)
*/

console.log("\"JS Importer library\" connected successfully!");

function Import(reference, host = "") {
    try {

        if (reference == "isAvailable") {
            return true;
        }

        if (reference.includes("://")) {
            throw `Use the second argument of Import( ... ) to indicate the source:\n    Import("script.js", "https://example.com")`;
        }

        if (host.trim()) {
            reference = `${host}/${reference}`
        } else {
            if (!document.domain) {
                throw `You are trying to upload a local file (""). The security system blocked your attempt to do so.`;
            }
        }

        let script = document.createElement("script");
        script.src = reference;

        if (reference.trim() == "") {
            throw `No data input!`;
        } else if (!reference.includes(".js")) {
            throw `"${reference}" is not a JavaScript file.`;
        }

        document.head.appendChild(script);
        return true;
    } catch (exc) {
        console.error(`Exception: ${exc}`);
        return false;
    }
}