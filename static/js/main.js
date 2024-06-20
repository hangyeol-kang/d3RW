/** 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

Copyright (c) [2024] [Hangyeol Kang]
*/

document.addEventListener('DOMContentLoaded', async event => {
    setupSettingTabClickHandlers();
    setupButtonEventListeners();
    setupSidebarToggle();
    updateTargetIP();
    handleNetworkConfig();

    await initializeApp()
});

function setupSettingTabClickHandlers() {
    document.getElementById('v-pills-playmode-tab').addEventListener('click', () => {
        $('#playmode-modal').modal('show');
    });

    document.getElementById('v-pills-network-config-tab').addEventListener('click', function () {
        var networkConfigModal = new bootstrap.Modal(document.getElementById('network-config-modal'));
        networkConfigModal.show();
    });
}

function setupButtonEventListeners() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('btn-active');
        });

        button.addEventListener('touchstart', () => {
            button.classList.toggle('btn-active');
        });
    });
}

function setupSidebarToggle() {
    const sidebarToggle = document.body.querySelector('#sidebar-toggle');
    if (sidebarToggle) {
        if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
            document.body.classList.toggle('sb-sidenav-toggled');
        }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }
}

function updateTargetIP() {
    const targetIP = document.getElementById('target-ip');
    targetIP.textContent = `${ipAddressInput.dataset.ipaddress}:${portInput.dataset.port}`;
}

async function initializeApp() {
    await getsetting()
    await populateSystemsTable();
    await populateProjectsTable();
}

async function showAlert(data) {
    let message;

    // Check if data is a string
    if (typeof data === 'string') {
        message = data;
    } else {
        // Check if the status object and its details array exist
        if (!data.status || !data.status.details || data.status.details.length === 0) {
            return;
        }
        message = data.status.details[0].message;
        // Check if message is an empty string
        if (message === "") {
            return;
        }
    }

    const alert = document.createElement('div');
    alert.classList.add('alert', 'alert-secondary', 'alert-auto-close');
    alert.textContent = message;

    document.body.appendChild(alert);

    window.setTimeout(function () {
        $(alert).fadeTo(500, 0).slideUp(500, function () {
            $(this).remove();
        });
    }, 5000);
}

async function handleNetworkConfig() {
    const networkConfigForm = document.getElementById('network-config-form');
    networkConfigForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (ipAddressInput.checkValidity() && portInput.checkValidity()) {
            ipAddressInput.dataset.ipaddress = ipAddressInput.value;
            portInput.dataset.port = portInput.value;

            var targetIP = document.getElementById('target-ip');
            targetIP.textContent = ipAddressInput.dataset.ipaddress + ':' + portInput.value;

            var networkConfigModal = bootstrap.Modal.getInstance(document.getElementById('network-config-modal'));
            networkConfigModal.hide();

            await populateSystemsTable();
            await populateProjectsTable();
            await populateMRSetsTable();
            await populateRenderstreamTable()
        }

        if (!ipAddressInput.checkValidity()) {
            ipAddressInput.classList.add('is-invalid');
        } else {
            ipAddressInput.classList.remove('is-invalid');
        }

        if (!portInput.checkValidity()) {
            portInput.classList.add('is-invalid');
        } else {
            portInput.classList.remove('is-invalid');
        }

        networkConfigForm.classList.add('was-validated');
    }, false);
}

async function getsetting() {
    try {
        const response = await fetch('/setting');
        const data = await response.json();
        setting = data;
    } catch (error) {
        console.error('Error fetching base config:', error);
        await showAlert('Error fetching base config')
    }
}

function constructApiUrl(endpoint) {
    return `http://${ipAddressInput.dataset.ipaddress}:${portInput.dataset.port}${endpoint}`;
}

async function withNetworkIndicator(fn, apiEndPoint) {
    imgIndicator.style.filter = 'hue-rotate(280deg)'; // yellow

    const data = await fn(apiEndPoint);
    if (!data) {
        imgIndicator.style.filter = 'invert(100%) hue-rotate(65deg)'; // red
        return
    } else {
        imgIndicator.style.filter = 'hue-rotate(0deg)'; // green
    }

    return data;
}


//Global variables.
let setting
let activeTransport
const portInput = document.getElementById('input-port');
const ipAddressInput = document.getElementById('input-ipaddress');
const imgIndicator = document.querySelector('.img-indicator');

