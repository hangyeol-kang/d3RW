# **d3RW**

<p align="center"><img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/96043d07-a388-4899-b248-5a91486355cb" width="80%" height="80%"></p>

d3RW is a remote web application designed to control the d3 Designer using the d3 API v2. With d3RW, you can remotely manage your d3 Designer to enhance your overall productivity.

⚠ **d3RW is in development and is not recommended for production use.**

## Prerequisites

Before using d3RW, ensure the following prerequisites are met:

- **Set the API HTTP Port**: Ensure that the same API HTTP port (default: 80) is configured in the d3 Manager across all machines. After setting the port, restart the machines to apply the changes.

  <img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/8313a534-7e11-4157-8fdd-67f9cc12b79b" width="50%" height="50%">
    
- **Access for Remote Mobile Device**: Ensure that the remote mobile device has access to the Ethernet network.

## Quick Start

1. **Download the Latest Version:**
    - Download the latest version of d3RW from the releases page.

2. **Extract the Files:**
    - Extract the files from the downloaded ZIP file.

3. **Configure Settings:**
    - Open the command prompt and type `ipconfig` to find your IP address.
  
      <img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/569a3282-512c-4498-bfb6-73aeabd7a1aa" width="50%" height="50%">

    - Set the host with the IP address obtained in step 1 and the port number in the `setting.ini` file. The application will not run if the host and port are not configured properly.

      <img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/72e63870-c958-472d-8bc9-8452751b974c" width="50%" height="50%">

4. **Run the Application:**
    - Run the d3RW.exe executable on a **director** or **mobile editor**.
    - Click "Allow access" to communicate on the networks.
      
      <img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/8995f65c-3721-4b72-a97e-1063f94d1d3b" width="50%" height="50%">
      
    - If the application runs successfully, the remote web will be accessible via the configured URL.
      
      <img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/b92cecec-9365-457d-a653-1aa0ab9148aa" width="50%" height="50%">

    - **⚠ If the Command Prompt hangs, provide keyboard input or disable `Quick Edit mode`. To disable Quick Edit mode, right-click the title bar of the command window, click `Defaults`, go to `Options`, and uncheck `Quick Edit mode`.**
    
5. **Access the Remote Web:**
    - To access the remote web, use the same URL configured in the `setting.ini` file.

## Overview

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/f7765f07-70cc-416d-bc5d-657c790811c4" width="80%" height="80%">

**Target Host**: The host to which requests are sent. Indicators turning into yellow, red, and green:

- Yellow: Waiting for the response from the target host.
- Red: Request failed.
- Green: Received response successfully.

**Engage Transport Button**: Engage the active transport.

**Master Outputs**: Controls for master brightness and volume.

**Notifications**: Notifications returned from the target host.

**Annotations**: Annotations, including notes, TC, and MIDI tags.

**Transport Control Buttons**: Buttons for controlling transport, functioning the same as in d3 Designer.

### Project

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/e4013545-6a39-47c3-8e4c-b735864c7bc2" width="80%" height="80%">

- The project list is returned from the target host.
- Click on the desired project and host in the list to select them.
- Select the project and host from the list to initiate the selected project on the selected hosts.
- Click the corresponding button to send a request to the selected hosts.

### Mixed Reality

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/8eaf4ca9-212b-464b-828c-56cb936f8c5e" width="80%" height="80%">

- Click on the desired MR Set in the list to select it. This action will trigger a request to fetch and display the associated observations.
- Select the MR Set and observation in the list to send the request.
- Click the corresponding button to send a request for the selected MR Set.

### RenderStream

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/0fd92253-1293-46cc-bbea-2d0887afd18f" width="80%" height="80%">

- Click on the desired Renderstream layer in the list to select it.
- Click the corresponding button to send a request for the selected layers.
- If the selected layers are running, you can check the current status of the layers.
- **⚠ Toggle the monitoring mode to monitor the status of the layers in real-time. Turn it off if you don't need to check the status in real-time to prevent unnecessary requests.**

### Colour

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/2a36c9dc-6967-44c2-ba67-3ddd0afadb97" width="80%" height="80%">

- Click on the desired CDL from the list to select it. This will trigger a request to fetch and display the CDL details.
- Use the input sliders provided to adjust the CDL values for slope, offset, power, and saturation.
- Dragging the slider will automatically update the corresponding CDL value and send a request to the target host to apply the change.

### Transport

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/906f61de-2c94-412b-a7f0-c13b43f19b82" width="80%" height="80%">

- Click 'engage' to enable control of the timeline, notifications, master outputs, and annotations.
- **⚠ Only the TC or MIDI tag supports global jump.**

### Network Configuration

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/4002857a-2e63-4d2c-b0c1-1bd6ac2764b2" width="80%" height="80%">

- Modify the IP address and port for the target host.
- The content is automatically refreshed after submitting changes.
- **⚠ Ensure that the port number is the same as configured in the d3 Manager.**

### Playmode

<img src="https://github.com/hangyeol-kang/d3RW/assets/172173003/14a42494-3299-4b1f-be8b-334a1e70f5a9" width="80%" height="80%">

- This feature provides a specialized user interface for timeline control.
