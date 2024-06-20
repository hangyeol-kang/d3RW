/** 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

Copyright (c) [2024] [Hangyeol Kang]

COLOUR API
https://developer.disguise.one/api/session/colour/
*/

document.addEventListener("DOMContentLoaded", () => {
    setupColourTabClickHandler();
    addButtonRefreshCDLsClickHandler();
});

function setupColourTabClickHandler() {
    document.getElementById('v-pills-colour-tab').addEventListener('click', () => {
        populateCDLsTableBody()
    });
}

function addButtonRefreshCDLsClickHandler() {
    document.getElementById('refreshCDLs').addEventListener('click', () =>
        populateCDLsTableBody()
    );
}

async function fetchGetColour(apiEndPoint) {
    try {
        const apiUrl = constructApiUrl(`/api/session/colour/${apiEndPoint}`);
        const response = await fetch(apiUrl);

        const data = await response.json();
        await showAlert(data)

        return data.result;
    } catch (error) {
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable or if d3 is running.')
    }
}

async function fetchPostColour(selectedRow) {
    try {
        const requestBody = {
            cdl: {
                uid: selectedRow.dataset.uid,
                name: selectedRow.innerText,
                slope: {
                    x: parseFloat(document.querySelector('.input-slope-x').value),
                    y: parseFloat(document.querySelector('.input-slope-y').value),
                    z: parseFloat(document.querySelector('.input-slope-z').value)
                },
                offset: {
                    x: parseFloat(document.querySelector('.input-offset-x').value),
                    y: parseFloat(document.querySelector('.input-offset-y').value),
                    z: parseFloat(document.querySelector('.input-offset-z').value)
                },
                power: {
                    x: parseFloat(document.querySelector('.input-power-x').value),
                    y: parseFloat(document.querySelector('.input-power-y').value),
                    z: parseFloat(document.querySelector('.input-power-z').value)
                },
                saturation: parseFloat(document.querySelector('.input-saturation').value)
            }
        };

        const apiUrl = constructApiUrl('/api/session/colour/cdl')
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        await showAlert(data)
    } catch (error) {
        console.error('Error:', error.message);
        await showAlert('Request failed. Check if the network connection is stable.')
    }
}

// Function to clear the details table.
function clearCDLsDetailsTable() {
    const cdlDetailsContainer = document.getElementById('table-cdl-details');
    cdlDetailsContainer.innerHTML = '';
}

// Function to clear the CDLs table body.
function clearCDLsTableBody() {
    const tableBody = document.getElementById('table-cdl').querySelector('tbody');
    tableBody.innerHTML = '';
}

// Function to update the CDL details table.
function updateCDLDetailsTable(cdlDetailsTable) {
    const cdlDetailsContainer = document.getElementById('table-cdl-details');
    cdlDetailsContainer.innerHTML = '';
    cdlDetailsContainer.appendChild(cdlDetailsTable);
}

// Function to populate the table body with CDL names.
async function populateCDLsTableBody() {
    const cdlsData = await fetchGetColour('cdls');
    if (!cdlsData) return;

    clearCDLsDetailsTable()
    clearCDLsTableBody()
    createCDLsTableBodyContents(cdlsData)
}

function handleCDLsRowSelection(row) {
    const selectedRows = document.querySelector('#table-cdl tbody tr.selected');
    if (selectedRows) {
        selectedRows.classList.remove('selected');
        clearCDLsDetailsTable();
    }
    row.classList.toggle('selected')
    populateCDLsDetailsTable()
}

// Function to creat the CDLs table body contents.
function createCDLsTableBodyContents(cdlsData) {
    const tableBody = document.getElementById('table-cdl').querySelector('tbody');

    // Loop through each CDL and create a new row in the table
    cdlsData.forEach(cdl => {
        const row = document.createElement('tr');
        row.dataset.uid = cdl.uid;
        row.innerHTML = `<td>${cdl.name}</td>`;
        row.addEventListener('click', function () {
            handleCDLsRowSelection(row)
        });
        tableBody.appendChild(row);
    });
}

// Function to update the range value and posts color data when the input value changes.
async function updateRangeAndPostColourFromInput(inputElement) {
    const inputWrapper = inputElement.closest('.input-wrapper');
    const rangeInput = inputWrapper.querySelector('.slider-colour');
    rangeInput.value = inputElement.value;
    await fetchPostColour(document.querySelector('#table-cdl tr.selected'));
}

// Function to update the input value and posts color data when the range value changes.
async function updateInputAndPostColourFromRange(rangeElement) {
    const inputWrapper = rangeElement.closest('.input-wrapper');
    const numberInput = inputWrapper.querySelector('.input-colour');
    numberInput.value = rangeElement.value;
    await fetchPostColour(document.querySelector('#table-cdl tr.selected'));
}

// Function to populate the details table with CDL details.
async function populateCDLsDetailsTable() {
    const cdlsData = await fetchGetColour('cdls')
    if (!cdlsData) return;


    await createCDLsDetailsTableBodyContents(cdlsData)

    // Update range value when input value changes.
    document.querySelectorAll('.input-colour').forEach(input => {
        input.addEventListener('input', async function () {
            await updateRangeAndPostColourFromInput(this);
        });
    });

    // Update input value when range value changes.
    document.querySelectorAll('.slider-colour').forEach(input => {
        input.addEventListener('input', async function () {
            await updateInputAndPostColourFromRange(this)
        });
    });
}

// Function to create the CDLs details table body contents.
async function createCDLsDetailsTableBodyContents(cdlsData) {
    const selectedRow = document.getElementById('table-cdl').querySelector('tr.selected');
    const selectedIndex = selectedRow.rowIndex;

    const cdl = cdlsData[selectedIndex - 1];
    const cdlDetailsTable = document.createElement('table');
    cdlDetailsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>&nbsp;</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Z</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Slope</td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-slope-x" type="number" value="${cdl.slope.x}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.slope.x}" step="0.01">
                            </div>
                        </td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-slope-y" type="number" value="${cdl.slope.y}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.slope.y}" step="0.01">
                            </div>
                        </td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-slope-z" type="number" value="${cdl.slope.z}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.slope.z}" step="0.01">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Power</td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour  input-power-x" type="number" value="${cdl.power.x}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.power.x}" step="0.01">
                            </div>
                        </td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-power-y" type="number" value="${cdl.power.y}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.power.y}" step="0.01">
                            </div>
                        </td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-power-z" type="number" value="${cdl.power.z}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.power.z}" step="0.01">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Offset</td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-offset-x" type="number" value="${cdl.offset.x}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.offset.x}" step="0.01">
                            </div>
                        </td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-offset-y" type="number" value="${cdl.offset.y}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.offset.y}" step="0.01">
                            </div>
                        </td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-offset-z" type="number" value="${cdl.offset.z}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.offset.z}" step="0.01">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Saturation</td>
                        <td>
                            <div class="input-wrapper">
                                <input class="input-colour input-saturation" type="number" value="${cdl.saturation}" />
                                <input type="range" class="slider-colour" min="${setting.minValue}" max="${setting.maxValue}" value="${cdl.saturation}" step="0.01">
                            </div>
                        <td>
                        <td>
                        <td>                   
                    </tr>
                </tbody>
            `;

    updateCDLDetailsTable(cdlDetailsTable)
}