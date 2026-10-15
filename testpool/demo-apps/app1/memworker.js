class unsafe {
    constructor() {
        this.value = 0x0;
    }
}

const outputContainer = document.body;

function sendAnswer(data = null) {
    outputContainer.innerText = data;
}

let request = new unsafe();
sendAnswer(request.value);