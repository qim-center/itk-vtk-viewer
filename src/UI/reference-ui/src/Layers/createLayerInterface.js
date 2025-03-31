import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/radio/radio.js'
import {
  invisibleIconDataUri,
  boundingBoxIconDataUri,
  // downloadIconDataUri,
  visibleIconDataUri,
} from '@itk-viewer/icons'
import style from '../ItkVtkViewer.module.css'

import applyContrastSensitiveStyleToElement from '../applyContrastSensitiveStyleToElement'
import { makeHtml } from '../utils'
import './layerIcon.js'
// import { extensions } from './extensionToImageIo.js'

let dialog

// Function to create a row with a label and a button
const createButtonRow = (
  labelText,
  buttonCreator,
  context,
  mainUIColumn,
  name
) => {
  const row = document.createElement('div')
  row.setAttribute('class', style.buttonRow)

  // Create label
  const label = document.createElement('label')
  label.textContent = labelText
  label.setAttribute('class', style.descriptionLabel)

  // Create button container
  const buttonContainer = document.createElement('div')
  buttonCreator(context, buttonContainer, name) // Call function to create button(s) inside buttonContainer

  // Append label and button to the row
  row.appendChild(label)
  row.appendChild(buttonContainer)

  // Add row to the main UI column
  mainUIColumn.appendChild(row)
}

// Function to create the bounding box button
const createBoundingBoxButton = (context, buttonContainer, name) => {
  const layerBBoxButton = document.createElement('div')
  layerBBoxButton.innerHTML = `<input id="${context.id}-layerBBoxButton" type="checkbox" class="${style.toggleInput}"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Bounding Box" class="${style.toggleButton}" for="${context.id}-layerBBoxButton"><img src="${boundingBoxIconDataUri}" alt="bbox"/></label>`
  const layerBBoxButtonInput = layerBBoxButton.children[0]
  const layerBBoxLabel = layerBBoxButton.children[1]
  layerBBoxButton.style.height = '23px'
  applyContrastSensitiveStyleToElement(
    context,
    'invertibleButton',
    layerBBoxLabel
  )

  buttonContainer.appendChild(layerBBoxButton)

  layerBBoxButton.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    context.service.send({
      type: 'TOGGLE_LAYER_BBOX',
      data: {
        name: context.images.selectedName,
        layerName: name,
      },
    })
    const actorContext = context.layers.actorContext.get(name)
    layerBBoxButtonInput.checked = actorContext.bbox
  })
}

function createLayerEntry(context, name, layer) {
  const layerEntry = document.createElement('div')
  const mainUIGroup = context.uiGroups.get('main')
  // console.log('mainUIGroup in createLayerINterface', mainUIGroup)

  layerEntry.setAttribute('class', style.layerEntryCommon)
  // layerEntry.style.borderWidth = '3px';
  // layerEntry.style.paddingTop = '10px';    // Space above the content
  // layerEntry.style.paddingRight = '20px';  // Space to the right
  // layerEntry.style.paddingBottom = '10px'; // Space below
  // layerEntry.style.paddingLeft = '20px';   // Space to the left
  // layerEntry.style.margin = '0px';
  // layerEntry.style.display = 'flex';
  // layerEntry.style.flexDirection = 'column';  // Make children stack vertically
  applyContrastSensitiveStyleToElement(context, 'layerEntry', layerEntry)

  // Create a container to hold both the image name and the spinner
  const headerRow = document.createElement('div')
  headerRow.style.display = 'flex' // Use flexbox to align items horizontally
  headerRow.style.alignItems = 'center' // Vertically align items
  headerRow.style.marginBottom = '10px' // Add some space between header and bounding box
  headerRow.style.justifyContent = 'space-between'
  headerRow.style.gap = '10px' // Space between items

  const visibleButton = document.createElement('div')
  visibleButton.innerHTML = `<input id="${context.id}-visibleButton" type="checkbox" checked class="${style.toggleInput}"><label itk-vtk-tooltip itk-vtk-tooltip-top-annotations itk-vtk-tooltip-content="Visibility" class="${style.visibleButton} ${style.toggleButton}" for="${context.id}-visibleButton"><img src="${visibleIconDataUri}" alt="visible"/></label>`
  const visibleLabel = visibleButton.children[1]
  applyContrastSensitiveStyleToElement(
    context,
    'invertibleButton',
    visibleLabel
  )
  // layerEntry.appendChild(visibleButton)
  const invisibleButton = document.createElement('div')
  invisibleButton.innerHTML = `<input id="${context.id}-invisibleButton" type="checkbox" class="${style.toggleInput}"><label itk-vtk-tooltip itk-vtk-tooltip-top-annotations itk-vtk-tooltip-content="Visibility" class="${style.visibleButton} ${style.toggleButton}" for="${context.id}-invisibleButton"><img src="${invisibleIconDataUri} alt="invisible""/></label>`
  const invisibleLabel = invisibleButton.children[1]
  applyContrastSensitiveStyleToElement(
    context,
    'invertibleButton',
    invisibleLabel
  )
  // layerEntry.appendChild(invisibleButton)

  if (layer.visible) {
    visibleButton.style.display = 'flex'
    invisibleButton.style.display = 'none'
  } else {
    visibleButton.style.display = 'none'
    invisibleButton.style.display = 'flex'
  }

  visibleButton.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    context.service.send({ type: 'TOGGLE_LAYER_VISIBILITY', data: name })
    visibleButton.checked = true
  })
  invisibleButton.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    context.service.send({ type: 'TOGGLE_LAYER_VISIBILITY', data: name })
    invisibleButton.checked = false
  })

  const layerLabel = document.createElement('label') // file_name
  // layerLabel.setAttribute('class', `${style.descriptionLabel}`); // Apply descriptionLabel style to the label

  applyContrastSensitiveStyleToElement(context, 'layerLabel', layerLabel)
  layerLabel.style.display = 'flex'
  layerLabel.style.alignItems = 'center'
  layerLabel.style.gap = '10px'

  // Create the "File name" part of the label
  const fileNameText = document.createElement('span')
  fileNameText.setAttribute('class', style.descriptionLabel) // Apply filenameLabel style
  fileNameText.innerText = 'File name' // This is the static part of the label
  layerLabel.appendChild(fileNameText) // Append it to the label

  // Create the actual file name element
  const fileName = document.createElement('span')
  fileName.setAttribute('class', style.filenameLabel) // Apply filenameLabel style
  fileName.innerText = name.toLowerCase() // File name in lowercase
  layerLabel.appendChild(fileName) // Append it to the label

  const imageIcons = document.createElement('div')
  imageIcons.style.display = 'flex'
  imageIcons.setAttribute('class', `${style.iconGroup}`)
  // layerEntry.appendChild(imageIcons)

  const spinner = document.createElement('div')
  spinner.setAttribute('class', `${style.ldsRing}`)
  spinner.innerHTML = '<div></div><div></div><div></div><div></div>'
  // imageIcons.appendChild(spinner)
  // Append the image name and spinner to the headerRow container
  layer.spinner = spinner

  headerRow.appendChild(layerLabel)
  headerRow.appendChild(spinner)

  layerEntry.appendChild(headerRow)

  createButtonRow(
    'Bounding Box',
    createBoundingBoxButton,
    context,
    mainUIGroup,
    name
  )

  // const layerBBoxButton = document.createElement('div')
  // layerBBoxButton.innerHTML = `<input id="${context.id}-layerBBoxButton" type="checkbox" class="${style.toggleInput}"><label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Bounding Box" class="${style.toggleButton}" for="${context.id}-layerBBoxButton"><img src="${boundingBoxIconDataUri}" alt="bbox"/></label>`
  // const layerBBoxButtonInput = layerBBoxButton.children[0]
  // const layerBBoxLabel = layerBBoxButton.children[1]
  // layerBBoxButton.style.height = '23px'
  // applyContrastSensitiveStyleToElement(
  //   context,
  //   'invertibleButton',
  //   layerBBoxLabel
  // )
  // imageIcons.appendChild(layerBBoxButton)
  // layerBBoxButton.addEventListener('click', event => {
  //   event.preventDefault()
  //   event.stopPropagation()
  //   context.service.send({
  //     type: 'TOGGLE_LAYER_BBOX',
  //     data: {
  //       name: context.images.selectedName,
  //       layerName: name,
  //     },
  //   })
  //   const actorContext = context.layers.actorContext.get(name)
  //   layerBBoxButtonInput.checked = actorContext.bbox
  // })

  // There can only be one dialog in app?  OK/Cancel buttons don't work if multiple layers...
  // if (!dialog) {
  //   dialog = makeHtml(`
  //   <md-dialog class="${style.saveDialog}">
  //     <div slot="headline">Save file format</div>
  //     <form id="save-form" slot="content" method="dialog">
  //       ${extensions
  //         .map(
  //           (extension, i) =>
  //             `<label>
  //               <md-radio name="format" value="${extension}" ${
  //               i === 0 ? 'checked' : ''
  //             } touch-target="wrapper"></md-radio>
  //               <span aria-hidden="true">${extension}</span>
  //             </label>`
  //         )
  //         .join('')}
  //     </form>
  //     <div slot="actions">
  //       <md-text-button form="save-form" value="cancel">Cancel</md-text-button>
  //       <md-text-button form="save-form" autofocus value="ok">OK</md-text-button>
  //     </div>
  //   </md-dialog>
  // `)
  //   dialog.addEventListener('close', () => {
  //     const okClicked = dialog.returnValue === 'ok'

  //     if (okClicked) {
  //       const radios = document.querySelectorAll('md-radio[name=format]')
  //       const format = Array.from(radios).find(radio => radio.checked).value
  //       context.service.send({
  //         type: 'DOWNLOAD_IMAGE',
  //         data: {
  //           name: context.images.selectedName,
  //           format,
  //         },
  //       })
  //     }
  //   })
  //   imageIcons.appendChild(dialog)
  // }

  // const downloadImage = document.createElement('div')
  // downloadImage.innerHTML = `
  // <input type="checkbox" checked id=${context.id}-download-image" class="${style.toggleInput}" />
  // <label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Save ROI" class="${style.toggleButton}" for="${context.id}-download-image">
  //   <img style="height: 23px" src="${downloadIconDataUri}" />
  // </label>
  // `
  // const downloadImageLabel = downloadImage.children[1]
  // downloadImage.style.height = '23px'
  // applyContrastSensitiveStyleToElement(
  //   context,
  //   'invertibleButton',
  //   downloadImageLabel
  // )
  // imageIcons.appendChild(downloadImage)
  // downloadImage.addEventListener('click', event => {
  //   event.stopPropagation()
  //   dialog.show()
  // })

  const icon = makeHtml(`<layer-icon class="${style.layerIcon}"></layer-icon>`)
  icon.layer = layer
  icon.name = name
  // imageIcons.appendChild(icon)

  layerEntry.addEventListener('click', event => {
    event.preventDefault()
    context.service.send({ type: 'SELECT_LAYER', data: name })
  })

  return layerEntry
}

function createLayerInterface(context) {
  // console.log('I am in createLayerInterface');
  const name = context.layers.lastAddedData.name
  // console.log('createLayerInterface.js', context)
  const layer = context.layers.actorContext.get(name)

  const layerEntry = createLayerEntry(context, name, layer)
  context.layers.layersUIGroup.appendChild(layerEntry)

  context.layers.uiLayers.set(name, layerEntry)
}

export default createLayerInterface
