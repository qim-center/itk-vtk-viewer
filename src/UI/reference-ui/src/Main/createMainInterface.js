import style from '../ItkVtkViewer.module.css'

import createScreenshotButton from './createScreenshotButton'
import createFullscreenButton from './createFullscreenButton'
import createRotateButton from './createRotateButton'
import createAnnotationsButton from './createAnnotationsButton'
import createAxesButton from './createAxesButton'
import createViewPlanesToggle from './createViewPlanesToggle'
import createPlaneSliders from './createPlaneSliders'
import createBackgroundColorButton from './createBackgroundColorButton'
import createCroppingButtons from './createCroppingButtons'
import createViewModeButtons from './createViewModeButtons'
import createResetCameraButton from './createResetCameraButton'
import createDownloadROIButton from './createDownloadROIButton';
import createBoundingBoxButton from './createBoundingBoxButton';


function createMainInterface(context) {
  const mainUIGroup = document.createElement('div');
  mainUIGroup.setAttribute('class', style.uiGroup);
  context.uiGroups.set('main', mainUIGroup);

  // Create a column container instead of rows
  const mainUIColumn = document.createElement('div');
  mainUIColumn.setAttribute('class', style.mainUIColumn);
  mainUIGroup.appendChild(mainUIColumn);

  // Function to create a row with a label and a button
  const createButtonRow = (labelText, buttonCreator) => {
    const row = document.createElement('div');
    row.setAttribute('class', style.buttonRow);

    // Create label
    const label = document.createElement('label');
    label.textContent = labelText;
    label.setAttribute('class', style.descriptionLabel);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonCreator(context, buttonContainer); // Call function to create button(s) inside buttonContainer

    // Append label and button to the row
    row.appendChild(label);
    row.appendChild(buttonContainer);

    // Add row to the main UI column
    mainUIColumn.appendChild(row);
  };

  // Add each button/group with its label
  createButtonRow('Download ROI', createDownloadROIButton);
  createButtonRow('Screenshot', createScreenshotButton);
  // createButtonRow('Fullscreen', createFullscreenButton);
  if (!context.use2D) {
    createButtonRow('Rotate', createRotateButton);
  }
  // createButtonRow('Annotations', createAnnotationsButton);
  // createButtonRow('Axes', createAxesButton);
  createButtonRow('View Planes', createViewPlanesToggle);
  createPlaneSliders(context)
  createButtonRow('Background Color', createBackgroundColorButton);
  // createButtonRow('Bounding Box', createBoundingBoxButton);
  createButtonRow('View Mode', createViewModeButtons);
  createButtonRow('Cropping', createCroppingButtons);
  createButtonRow('Reset Camera', createResetCameraButton);

  context.uiContainer.appendChild(mainUIGroup);
}

export default createMainInterface;




