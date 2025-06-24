async function API_State() {
    try {
        const VERSION = 1,
            NAME = 2,
            CONFIG = 3;
        const SP = "/";
        const HOST = "https://devs.cf:443";
        const STYLES = {
            PARAM: "background-color: white; color: black;",
            NUM: "background-color: black; color: white;",
            VALUE: ""
        }
        let Response = (await (await fetch(`${HOST}/libs/packages/libsc-in-v3.txt`, {
            headers: {
                'Authorization': `Basic ${btoa('guest:')}`
            }
        })).text()).split("|");

        console.log(`
%c 1 %c  PARENT %c ${document.URL}
%c 2 %c  DOMAIN %c ${Response[CONFIG].split(SP)[Response[CONFIG].split(SP).length - 2].split("@")[1].split(":")[0]}
%c 3 %c    PORT %c ${Response[CONFIG].split(SP)[Response[CONFIG].split(SP).length - 2].split(":")[1]}
%c 4 %c    USER %c ${Response[CONFIG].split(SP)[Response[CONFIG].split(SP).length - 2].split("@")[0]}
%c 5 %c  CONFIG %c ${Response[CONFIG].split(SP)[Response[CONFIG].split(SP).length - 1]}
%c 6 %c VERSION %c ${Response[VERSION]}
%c 7 %c    NAME %c ${Response[NAME]}\n`,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE,
            STYLES.NUM, STYLES.PARAM, STYLES.VALUE)
    } catch (ec) {
        console.error("No API response")
    }
    return null;
}
