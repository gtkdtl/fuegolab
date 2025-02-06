
function scaleLog(value, minInput, maxInput, minOutput, maxOutput) {
    if (value <= 0) return minOutput;
    let logMin = Math.log10(minInput);
    let logMax = Math.log10(maxInput);
    let logValue = Math.log10(value);
    return minOutput + (logValue - logMin) * (maxOutput - minOutput) / (logMax - logMin);
}

function getColor(superficie) {
    return superficie > 5000 ? '#db0303' :  
           superficie > 1000 ? '#FF4500' :  
           superficie > 500  ? '#FF8C00' :  
           superficie > 100  ? '#FFD700' :  
           superficie > 50   ? '#7FFF00' :  
           superficie > 10   ? '#32CD32' : 
                               '#066900'; 
}

function updateInfoTable(properties) {
    const infoPanel = document.getElementById('info-panel');
    const header = document.getElementById('info-header');
    const body = document.getElementById('info-body');

    header.innerHTML = '';
    body.innerHTML = '';

    infoPanel.style.display = 'block';

    header.innerHTML = `<tr><th>Atributo</th><th>Valor</th></tr>`;

    for (let key in properties) {
        if (key !== "Link") {
            body.innerHTML += `<tr><td>${key}</td><td>${properties[key]}</td></tr>`;
        }
    }

    if (properties.Link) {
        body.innerHTML += `
            <tr>
                <td colspan="2" class="text-center">
                    <a href="${properties.Link}" target="_blank" class="btn btn-primary btn-sm">Ver en Satélite</a>
                </td>
            </tr>
        `;
    }
}

document.getElementById('close-info').addEventListener('click', function() {
    document.getElementById('info-panel').style.display = 'none';
});
