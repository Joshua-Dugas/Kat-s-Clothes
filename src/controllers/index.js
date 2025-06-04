//TODO this basically does nothing right now...
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();
        document.getElementById('data').innerText = JSON.stringify(data, null, 2);
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

window.onload = fetchData;
