/** 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

Copyright (c) [2024] [Hangyeol Kang]

MIXEDREALITY API
https://developer.disguise.one/api/session/mixedreality/
*/

document.addEventListener("DOMContentLoaded", () => {
    setupMixedrealityTabClickHandler();
    addButtonGroupMixedRealityClickListener();

});

function setupMixedrealityTabClickHandler() {
    document.getElementById('v-pills-mixedreality-tab').addEventListener('click', async () => {
        await fetchGetMixedReality('cameras');
        await populateMRSetsTable();
    });
}

function addButtonGroupMixedRealityClickListener() {
    document.getElementById('button-group-mrset').addEventListener('click', async (event) =>
        await handleMixedRealityButtonClick(event.target.id)
    );
}

async function fetchGetMixedReality(apiEndPoint) {
    try {
        const apiUrl = constructApiUrl(`/api/session/mixedreality/${apiEndPoint}`)
        const response = await fetch(apiUrl);

        const data = await response.json();
        await showAlert(data)

        return data.result
    } catch (error) {
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable or if d3 is running.')
    }
}

async function fetchPostMixedReality(apiEndPoint, requestBody) {
    try {
        const apiUrl = constructApiUrl(`/api/session/mixedreality/${apiEndPoint}`)
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
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable.')
    }
}

// Function to the populate MR sets table.
async function populateMRSetsTable() {
    // Clear existing table rows.
    const mrSetsTableBody = document.querySelector('#v-pills-mixedreality #table-mrset tbody');
    mrSetsTableBody.innerHTML = '';

    const observationTableBody = document.querySelector('#v-pills-mixedreality #table-observation tbody');
    observationTableBody.innerHTML = '';

    const mrsetsData = await fetchGetMixedReality('mrsets')
    const camerasData = await fetchGetMixedReality('cameras')

    if (!mrsetsData || !camerasData) return;

    createMRsetsTableBodyContents(mrsetsData, camerasData, mrSetsTableBody)
    const mrSetsfirstRow = mrSetsTableBody.querySelector('tr');
    clickRow(mrSetsfirstRow)
}

// Function to create the MR sets table body contents.
function createMRsetsTableBodyContents(mrsetsData, camerasData, mrSetsTableBody) {
    // Loop through the MR sets data and create table rows.
    mrsetsData.forEach(mrSet => {
        // Create a new table row
        const row = document.createElement('tr');

        row.dataset.mrSetUid = mrSet.uid;
        row.dataset.mrSetName = mrSet.name;
        row.dataset.currentCamera = mrSet.currentCamera;
        row.dataset.currentCameraUid = mrSet.currentCamera.uid;
        row.dataset.currentCameraName = mrSet.currentCamera.name;

        // Create table cells for each column.
        const mrSetNameCell = document.createElement('td');
        mrSetNameCell.textContent = mrSet.name || 'None';
        row.appendChild(mrSetNameCell);

        const currentCameraCell = document.createElement('td');
        currentCameraCell.textContent = mrSet.currentCamera ? mrSet.currentCamera.name : 'None';
        row.appendChild(currentCameraCell);

        row.addEventListener('click', () => handleMrsetsTableRowSelection(row));


        // Create a select element for overriding camera.
        const overridingCameraCell = document.createElement('td');
        const overridingCameraSelect = document.createElement('select');

        // Add default option with placeholder text.
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select Camera';
        defaultOption.value = ''; // Set an empty value.
        defaultOption.disabled = true;
        defaultOption.selected = true;
        overridingCameraSelect.appendChild(defaultOption);

        // Populate select options with cameras data.
        camerasData.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.uid;
            option.textContent = camera.name;
            overridingCameraSelect.appendChild(option);
        });

        overridingCameraCell.appendChild(overridingCameraSelect);
        row.appendChild(overridingCameraCell);

        mrSetsTableBody.appendChild(row);
    });
}

// Function to the populate observation table.
async function populateObservationTable(currentCameraName) {
    const observationTableBody = document.querySelector('#v-pills-mixedreality #table-observation tbody');
    observationTableBody.innerHTML = '';

    const spatialCalibrationData = await fetchGetMixedReality('spatialcalibrations')
    const camerasData = await fetchGetMixedReality('cameras');

    if (!spatialCalibrationData || !camerasData) return;

    createObservationTableBodyContents(spatialCalibrationData, camerasData, currentCameraName, observationTableBody)
}

// Function to create the single observation table row.
function createObservationRow(observation, index) {
    const rmsError = observation.rmsError.toString().slice(0, 7);
    const row = document.createElement('tr');
    row.addEventListener('click', () => handleObservationTableRowSelection(row));

    row.dataset.observationUid = observation.uid;
    row.innerHTML = `
        <td>${observation.isEnabled}</td>
        <td>${index + 1}</td>
        <td>${observation.trackedPose.position.x},${observation.trackedPose.position.y},${observation.trackedPose.position.z}</td>
        <td>${observation.zoom}x</td>
        <td>${observation.focus}</td> 
        <td>${rmsError}</td>
        <td>${observation.type}</td>
    `;
    return row;
}

// Function to create the observation table body contents.
function createObservationTableBodyContents(spatialCalibrationData, camerasData, currentCameraName, observationTableBody) {
    const selectedCamera = camerasData.find(camera => camera.name === currentCameraName);
    if (!selectedCamera) return;

    const selectedSpatialCalibrationUid = selectedCamera.spatialCalibration.uid;
    const selectedSpatialCalibrationName = selectedCamera.spatialCalibration.name;

    spatialCalibrationData.forEach(item => {
        // Check if the spatial calibration matches the selected camera.
        if (item.uid === selectedSpatialCalibrationUid) {

            item.observations.forEach((observation, index) => {
                const row = createObservationRow(observation, index);
                observationTableBody.appendChild(row);
            });
        }
    });

    // Set dataset properties for selected spatial calibration.
    observationTableBody.dataset.selectedSpatialCalibrationUid = selectedSpatialCalibrationUid;
    observationTableBody.selectedSpatialCalibrationName = selectedSpatialCalibrationName;
}

// Function to update the divider text.
function updateDividerText(currentcameraName) {
    const dividerCalibration = document.querySelector('.divider-calibration');
    dividerCalibration.textContent = currentcameraName;
}

// Function to handle the Mr Sets table row selection.
async function handleMrsetsTableRowSelection(row) {
    const selectedRows = document.querySelector('#table-mrset tbody tr.selected');
    if (selectedRows) {
        selectedRows.classList.remove('selected');
    }

    row.classList.toggle('selected');

    const currentcameraName = row.cells[1].textContent;
    await populateObservationTable(currentcameraName);
    updateDividerText(currentcameraName)
}

// Function to click the row. 
async function clickRow(row) {
    row.click()
}

// Function to handle the observation table row selection.
function handleObservationTableRowSelection(row) {
    const selectedRows = document.querySelector('#table-observation tbody tr.selected');
    if (selectedRows) {
        selectedRows.classList.remove('selected');
    }
    row.classList.toggle('selected');
}

// Function to wait for capture completion.
async function waitForCaptureCompletion() {
    const modal = createCaptureInProgressModal()
    while (true) {
        const captureProgressData = await fetchGetMixedReality('captureprogress')
        if (captureProgressData === false) {
            // Close the modal window.
            modal.style.display = 'none';
            const selectedMrSetsTableRow = document.querySelector('#table-mrset tbody tr.selected')
            clickRow(selectedMrSetsTableRow)

            window.focus();

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            break;
        } else {
            // Capture is still in progress, wait for some time before checking again.
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second.
        }
    }
}

// Function to create the capture in progress modal.
function createCaptureInProgressModal() {
    // Create modal element.
    const modal = document.createElement('div');
    modal.id = 'captureInProgressModal';
    modal.classList.add('modal');

    // Create modal content.
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content', 'modal-content-capture-inprogress');

    // Create spinner element.
    const spinner = document.createElement('div');
    spinner.classList.add('spinner-border');
    spinner.setAttribute('role', 'status');

    // Create visually hidden text for accessibility.
    const visuallyHiddenText = document.createElement('span');
    visuallyHiddenText.classList.add('visually-hidden');
    visuallyHiddenText.textContent = 'Loading...';

    // Create text element.
    const modalText = document.createElement('p');
    modalText.textContent = 'Capture In Progress...';

    // Append elements to modal content.
    modalContent.appendChild(spinner);
    modalContent.appendChild(modalText);
    spinner.appendChild(visuallyHiddenText);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    modal.style.display = 'block';
    return modal
}

// Function to handle the Mixed Reality buttons click
async function handleMixedRealityButtonClick(buttonId) {
    const selectedObservationTableRow = document.querySelector('#table-observation tbody tr.selected')
    const selectedMrSetsTableRow = document.querySelector('#table-mrset tbody tr.selected')

    const observationTableBody = document.querySelector('#v-pills-mixedreality #table-observation tbody');

    switch (buttonId) {
        case 'captureobservation':
            const captureRequestBody = {
                camera: {
                    uid: selectedMrSetsTableRow.dataset.currentCameraUid,
                    name: selectedMrSetsTableRow.dataset.currentCameraName
                },
                spatialCalibration: {
                    uid: observationTableBody.dataset.selectedSpatialCalibrationUid,
                    name: observationTableBody.selectedSpatialCalibrationName
                }
            };
            await fetchPostMixedReality(buttonId, captureRequestBody);
            await waitForCaptureCompletion();
            break;
        case 'enableobservations':
            const enableObservationRequestBody = {
                observations: [{
                    uid: selectedObservationTableRow.dataset.observationUid,
                    enable: true
                }]
            };
            await fetchPostMixedReality(buttonId, enableObservationRequestBody);
            clickRow(selectedMrSetsTableRow);
            break;
        case 'disableobservations':
            const apiEndPoint = buttonId.replace('disableobservations', 'enableobservations');
            const disableObservationRequestBody = {
                observations: [{
                    uid: selectedObservationTableRow.dataset.observationUid,
                    enable: false
                }]
            };
            await fetchPostMixedReality(apiEndPoint, disableObservationRequestBody);
            clickRow(selectedMrSetsTableRow);
            break;
        case 'deleteobservations':
            const deleteObservationRequestBody = {
                observations: [selectedObservationTableRow.dataset.observationUid]
            };
            await fetchPostMixedReality(buttonId, deleteObservationRequestBody);
            clickRow(selectedMrSetsTableRow);
            break;
        case 'deleteallobservations':
            const deleteAllRequestBody = {
                spatialCalibration: {
                    uid: observationTableBody.dataset.selectedSpatialCalibrationUid,
                    name: observationTableBody.selectedSpatialCalibrationName
                }
            };
            await fetchPostMixedReality(buttonId, deleteAllRequestBody);
            clickRow(selectedMrSetsTableRow);
            break;
        case 'selectcamera':
            const overridingCameraSelect = selectedMrSetsTableRow.querySelector('select');
            const selectedOverridingCameraOption = overridingCameraSelect.options[overridingCameraSelect.selectedIndex];
            const selectCameraRequestBody = {
                mrSet: {
                    uid: selectedMrSetsTableRow.dataset.mrSetUid,
                    name: selectedMrSetsTableRow.dataset.mrSetName
                },
                cameraOverride: {
                    uid: selectedOverridingCameraOption.value,
                    name: selectedOverridingCameraOption.text
                }
            };
            await fetchPostMixedReality(buttonId, selectCameraRequestBody);
            await populateMRSetsTable();
            break;
        case 'refresh-mixedreality':
            await populateMRSetsTable();
            break;
        default:
            break;
    }
}

