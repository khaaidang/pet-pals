// Event Listeners



// Functions
async function getPetInfo() {
    let url = `/api/pets/${this.id}`;
    let response = await fetch(url);
    let data = await response.json();
    
}