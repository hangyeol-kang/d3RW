/** 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

Copyright (c) [2024] [Hangyeol Kang]

TRNASPORT API
https://developer.disguise.one/api/session/transport/
*/

document.addEventListener("DOMContentLoaded", () => {
    addDropdownMenuListeners();
    addCuelistClickListener();
    addNotificationEventListenser();
    addButtonGroupTransportClickListener();
    addButtonPlaymodeModalClickListener();
    addEnageTransportClickListner();
    addSliderEventListener('volume')
    addSliderEventListener('brightness')
});

function addDropdownMenuListeners() {
    document.getElementById('dropdown-menu-cuelist').addEventListener('click', preventDropdownMenuClose);
    document.getElementById('dropdown-menu-notifications').addEventListener('click', preventDropdownMenuClose);
    document.getElementById('layoutSidenav_content').addEventListener('click', preventDropdownMenuClose);
}

function addEnageTransportClickListner() {
    const btnEngageTransport = document.getElementById("btn-engage-transport");
    btnEngageTransport.addEventListener('click', () =>
        toogleEngageTransport());
}

function addCuelistClickListener() {
    document.getElementById('cue-list').addEventListener('click', () =>
        handleCueListClick());
}

function addNotificationEventListenser() {
    const notification = document.getElementById('notification')
    notification.addEventListener('shown.bs.dropdown', () =>
        handleNotifications(false));

    notification.addEventListener('hidden.bs.dropdown', () =>
        handleNotifications(true));
}

function addButtonGroupTransportClickListener() {
    const transportButtons = document.querySelectorAll("#transport-button-group button");
    transportButtons.forEach(button => {
        if (button.id !== 'cue-list') {
            button.addEventListener("click", () => {
                const buttonId = button.id;
                handleTransportButtonClick(buttonId);
            });
        }
    });
}

function addButtonPlaymodeModalClickListener() {
    const modalButtons = document.querySelectorAll("#playmode-modal .modal-body button");
    modalButtons.forEach(button => {
        button.addEventListener("click", () => {
            const buttonId = button.id;
            handleTransportButtonClick(buttonId);
        });
    });
}

function addSliderEventListener(type) {
    // Get the slider element
    const slider = document.getElementById(type);

    // Add event listener to the slider
    slider.addEventListener('input', () => {
        updateMasterOutput(type, slider.value);
        updateRangeColor(slider)
    });
}

async function fetchGetTransport(apiEndPoint) {
    try {
        const apiUrl = constructApiUrl(`/api/session/transport/${apiEndPoint}`)
        const response = await fetch(apiUrl);
        const data = await response.json();
        await showAlert(data)

        return data.result
    } catch (error) {
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable or if d3 is running.')
    }
}

async function fetchGetStatus(apiEndPoint) {
    try {
        const apiUrl = constructApiUrl(`/api/session/status/${apiEndPoint}`)
        const response = await fetch(apiUrl);

        const data = await response.json();
        await showAlert(data)

        return data.result
    } catch (error) {
        console.error('Error:', error);
        await showAlert('Request failed. Check if the network connection is stable or if d3 is running.')
    }
}

async function fetchPostTransport(apiEndPoint, requestBody) {
    try {
        const apiUrl = constructApiUrl(`/api/session/transport/${apiEndPoint}`)
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


// Function to upadte the active transport.
async function updateActiveTransport() {
    const activeTransportData = await fetchGetTransport('activetransport')
    if (!activeTransportData) {
        showAlert("Check if d3 is running.")
        return;
    }


    activeTransport = activeTransportData[0]
    updateActiveTrackDisplay()
}

// Function to clear the notifications.
function clearNotifications() {
    const badge = document.querySelector('.badge-notification');
    badge.textContent = '';
    const dropdownMenu = document.querySelector('.dropdown-menu');
    dropdownMenu.innerHTML = '';

    const cuelist = document.getElementById("dropdown-menu-cuelist");
    cuelist.innerHTML = '';
}

// Function to toogle the engage transport button.
async function toogleEngageTransport() {
    await updateActiveTransport();
    if (!activeTransport) return;

    const btnEngageTransport = document.getElementById("btn-engage-transport");
    btnEngageTransport.classList.toggle("activated-background");

    if (btnEngageTransport.classList.contains("activated-background")) {
        await handleNotifications(true)
    } else {
        await handleNotifications(false)
        clearNotifications()
        activeTransport = null
    }
}


// Function to update the active track display.
function updateActiveTrackDisplay() {
    const activeTrack = document.querySelector('#playmode-modal-label');
    activeTrack.textContent = `Playmode - Active Track : ${activeTransport.currentTrack.name}`;
}

// Function to handle the transport button click. 
async function handleTransportButtonClick(buttonId) {
    if (!activeTransport) {
        showAlert("Check if the transport is engaged or if d3 is running.")
        return;
    }

    const requestBody = {
        transports: [{ "uid": activeTransport.uid, "name": activeTransport.name }]
    };
    await fetchPostTransport(buttonId, requestBody);

    if (buttonId.includes('track')) {
        setTimeout(() => {
            updateActiveTransport();
        }, 100);  // 0.1 second delay.
    }
}

// Function to handle the cue list click.
async function handleCueListClick() {
    if (!activeTransport) {
        showAlert("Check if the transport is engaged or if d3 is running.")
        return;
    }
    await updateActiveTransport()

    const dropdownMenu = document.querySelector('#dropdown-menu-cuelist');
    dropdownMenu.innerHTML = '';

    const tracksData = await fetchGetTransport('tracks');

    if (!tracksData) return;


    for (const track of tracksData) {
        const trackUid = track.uid;
        const trackName = track.name;

        const apiEndPoint = `annotations?uid=${trackUid}&name=${trackName}`

        const annotationsData = await fetchGetTransport(apiEndPoint);

        await populateAnnotationsTable(annotationsData, trackName, trackUid);
    }
}

// Function to populate the annotations table. 
async function populateAnnotationsTable(annotationsData, trackName, trackUid) {
    // Check if the response contains the expected format.
    if (!annotationsData || !annotationsData.annotations) return;

    await createAnnotationsTableContents(annotationsData, trackName, trackUid)
}

// Function to create the table head.
function createAnnotationsTableHead() {
    const tableHead = document.createElement('thead');
    const headRow = document.createElement('tr');

    // Create the first th for the "Go" button.
    const headCell1 = document.createElement('th');
    headRow.appendChild(headCell1);

    // Create the second th for "Note".
    const headCell2 = document.createElement('th');
    headCell2.textContent = 'Note';
    headRow.appendChild(headCell2);

    // Create the third th for "Tag".
    const headCell3 = document.createElement('th');
    headCell3.textContent = 'Tag';
    headRow.appendChild(headCell3);

    tableHead.appendChild(headRow);

    return tableHead;
}

// Function to create the table body.
async function createAnnotationsTableBody(annotationsData) {
    const tableBody = document.createElement('tbody');

    // Extract notes and tags from the response.
    const notes = annotationsData.annotations.notes || [];
    const tags = annotationsData.annotations.tags || [];

    // Combine notes and tags and sort them by time.
    const combined = notes.concat(tags);
    combined.sort((a, b) => a.time - b.time);

    createAnnotationsTableBodyContents(combined, tableBody);

    return tableBody;
}

// Function to remove the activated-background class from the dividers.
function removeDividerAtivatedBackground() {
    const allDividers = document.querySelectorAll('#dropdown-menu-cuelist .divider-cuelist');
    allDividers.forEach(div => {
        div.classList.remove('activated-background');
    });
}

// Function to handle the track divider click. 
async function handleTrackDividerClick(trackName, trackUid, divider) {
    const requestBody = {
        "transports": [{
            "transport": {
                "uid": activeTransport.uid,
                "name": activeTransport.name
            },
            "track": {
                "name": trackName,
                "uid": trackUid
            },
            "playmode": "NotSet"
        }]
    };
    const apiEndPoint = 'gototrack';
    await fetchPostTransport(apiEndPoint, requestBody);
    removeDividerAtivatedBackground()
    divider.classList.toggle('activated-background');
}

// Function to create the annotations table.
async function createAnnotationsTableContents(annotationsData, trackName, trackUid) {
    const dropdownMenu = document.querySelector('#dropdown-menu-cuelist');

    const divider = document.createElement('div');
    divider.classList.add('divider-cuelist');
    divider.textContent = trackName;
    divider.dataset.uid = trackUid;

    if (trackUid === activeTransport.currentTrack.uid) {
        divider.classList.toggle('activated-background');
    }

    divider.addEventListener('click', () => {
        handleTrackDividerClick(trackName, trackUid, divider);
    });

    const table = document.createElement('table');
    const tableHead = createAnnotationsTableHead();
    const tableBody = await createAnnotationsTableBody(annotationsData);

    table.appendChild(tableHead);
    table.appendChild(tableBody);
    dropdownMenu.appendChild(divider);
    dropdownMenu.appendChild(table);
}


// Function to create annotations table body contents. 
function createAnnotationsTableBodyContents(tableBodyData, tableBody) {
    // Iterate through the combined array and create table rows
    tableBodyData.forEach(function (item) {
        const time = item.time;
        const noteText = item.text;
        const tagValue = item.value;
        const itemType = item.type;

        const newRow = document.createElement('tr');

        newRow.dataset.type = itemType;

        // Create the first td with a button having id "GO" and text "GO"
        const firstTd = document.createElement('td');
        const button = document.createElement('button');
        button.id = 'go';
        button.classList.add('btn', 'btn-dark', 'w-100');
        button.textContent = 'GO';
        firstTd.appendChild(button);
        newRow.appendChild(firstTd);
        button.addEventListener('click', handleGoButtonClick)

        // Create the second td containing the note text, or leave it empty if there is no note
        const secondTd = document.createElement('td');
        secondTd.textContent = noteText || '';
        newRow.appendChild(secondTd);

        // Create the third td containing the tag value, or leave it empty if there is no tag
        const thirdTd = document.createElement('td');
        thirdTd.textContent = tagValue || '';
        newRow.appendChild(thirdTd);

        tableBody.appendChild(newRow);
    });
}

// Function to set the activated background on the current track in the divider cuelist.
function setDividerActivatedBackground() {
    removeDividerAtivatedBackground()
    const allDividers = document.querySelectorAll('#dropdown-menu-cuelist .divider-cuelist');
    allDividers.forEach(divider => {
        if (divider.dataset.uid === activeTransport.currentTrack.uid) {
            divider.classList.add("activated-background")
        }
    });
}

// Function to handle the 'go' button click. 
async function handleGoButtonClick(event) {

    if (event.target && event.target.id === 'go') {

        event.preventDefault();
        event.stopPropagation();

        const tr = event.target.closest('tr');
        if (!tr) return;
        const noteText = tr.children[1].textContent.trim();
        const tagValue = tr.children[2].textContent.trim();
        const itemType = tr.dataset.type; // Get the dataset.type of the row.
        const requestBody = {
            "transports": [{
                "transport": {
                    "uid": activeTransport.uid,
                    "name": activeTransport.name
                },
                "note": noteText,
                "type": itemType,
                "value": tagValue,
                "allowGlobalJump": true,
                "playmode": "NotSet"
            }]
        };

        const apiEndPoint = noteText ? 'gotonote' : 'gototag';
        await fetchPostTransport(apiEndPoint, requestBody);
        // Delay before updating the active transport to ensure the server has processed the request.
        setTimeout(async () => {
            await updateActiveTransport();
            setDividerActivatedBackground();
        }, 100);  // 0.1 second delay.
    }
}



// Function to update the transport based on slider input.
async function updateMasterOutput(property, value) {
    if (!activeTransport) {
        showAlert("Check if the transport is engaged or if d3 is running.")
        return;
    }
    // Determine the button ID based on the property.
    const sliderID = property === 'brightness' ? 'brightness' : 'volume';

    const requestBody = {
        transports: [
            {
                transport: {
                    uid: activeTransport.uid,
                    name: activeTransport.name
                }
            }
        ]
    };

    // Set the property in the request body.
    requestBody.transports[0][property] = value;

    const apiEndPoint = `${sliderID}`
    await fetchPostTransport(apiEndPoint, requestBody)
}


// Function to update the color of the range track based on the current value.
function updateRangeColor(range) {
    const value = range.value; // Get the current value
    const percentage = (value / (parseInt(range.max) - parseInt(range.min))) * 100; // Calculate the percentage.

    // Set the color of the track based on the percentage.
    range.style.background = `linear-gradient(to right, rgba(255, 255, 255, 0.2) ${percentage}%, rgba(33, 33, 33, 1) ${percentage}%)`;
}

// Function to get notifications. 
async function populateNotifications() {
    const outerDropdownMenu = document.querySelector('.dropdown-menu');
    outerDropdownMenu.innerHTML = '';

    const notificationData = await withNetworkIndicator(fetchGetStatus, 'notifications')
    if (notificationData.length == 0) return;

    const totalNotifications = createNotificationsDropdownItem(notificationData)
    // Set the badge text content to the total number of notifications.
    const badge = document.querySelector('.badge-notification');
    badge.textContent = totalNotifications;
}

// Function to create the outer dropdown item for machine name.
function createMachineDropdownItem(machineName) {
    const machineListItem = document.createElement('li');
    machineListItem.classList.add('dropdown-item');
    machineListItem.addEventListener('click', showMachineNotification);
    machineListItem.textContent = machineName;
    return machineListItem;
}

// Function to create the inner dropdown menu for machine notifications.
function createMachineDropdownMenu(machineNotifications) {
    const machineDropdownMenu = document.createElement('ul');
    machineDropdownMenu.classList.add('dropdown-menu');

    machineNotifications.forEach(notification => {
        const notificationListItem = createNotificationListItem(notification);
        machineDropdownMenu.appendChild(notificationListItem);
    });

    return machineDropdownMenu;
}

// Function to create the dropdown item with notification details.
function createNotificationListItem(notification) {
    const notificationListItem = document.createElement('li');
    notificationListItem.innerHTML = `
        <a class="dropdown-item" style="font-size: 12px"><strong>${notification.summary}</strong></a>
        <a class="dropdown-item" style="font-size: 8px">${notification.detail}</a>
    `;
    return notificationListItem;
}

// Function to create the notifications dropdown item.
function createNotificationsDropdownItem(notificationData) {
    const outerDropdownMenu = document.querySelector('.dropdown-menu');
    let totalNotifications = 0;

    notificationData.forEach(machineData => {
        const machineName = machineData.machine.name;
        const machineNotifications = machineData.notifications;

        if (machineNotifications.length === 0) return;

        const machineListItem = createMachineDropdownItem(machineName);
        const machineDropdownMenu = createMachineDropdownMenu(machineNotifications);

        machineListItem.appendChild(machineDropdownMenu);
        outerDropdownMenu.appendChild(machineListItem);

        totalNotifications += machineNotifications.length;
    });

    return totalNotifications;
}

// Function to show the machine notifications. 
function showMachineNotification() {
    // Toggle visibility of the dropdown menu.
    const dropdownMenu = this.querySelector('.dropdown-menu');
    dropdownMenu.classList.toggle('show');

    const isExpanded = this.classList.contains('dropdown-item-expanded');
    if (isExpanded) {
        this.style.height = `fit-content`;
        this.style.width = 'fit-content';
    } else {
        const dropdownMenuHeight = window.getComputedStyle(dropdownMenu).height;
        const dropdownMenuHeightNumeric = parseFloat(dropdownMenuHeight);
        const newHeight = dropdownMenuHeightNumeric + 30;
        this.style.height = `${newHeight}px`;
        this.style.width = '450px';
    }
    this.classList.toggle('dropdown-item-expanded');
}

// Function to handle the notifications. 
async function handleNotifications(flag) {
    if (flag) {
        handleNotifications.notificationInterval = setInterval(populateNotifications, 5000);
    } else {
        clearInterval(handleNotifications.notificationInterval);
    }
}

// Function to prevent the dropdown menu from closing. 
function preventDropdownMenuClose(event) {
    if (event.target && event.target.matches('button')) return;

    event.preventDefault();
    event.stopPropagation();
}


