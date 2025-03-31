import { boundingBoxIconDataUri } from '@itk-viewer/icons'
import style from '../ItkVtkViewer.module.css'
import applyContrastSensitiveStyleToElement from '../applyContrastSensitiveStyleToElement'

function createBoundingBoxButton(context, mainUIRow) {
  // Get the layer's name from context (this was part of createLayerInterface)
  // const name = context.layers.lastAddedData.name;
  // console.log('createBoundingBoxButton - Layer Name:', name);
  console.log('createBoundingBoxButton - Layer Name: BBfilee', context)
  console.log('context.layers: BBfilee', context.layers) // Check if context.layers exists
  console.log(
    'context.layers.lastAddedData:  BBfile',
    context.layers.lastAddedData
  ) // Check if context.layers.lastAddedData exists

  // Create the button container
  const buttonContainer = document.createElement('div')

  // Button HTML structure for bounding box
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
        layerName: name, // You can modify this to target the appropriate layer name
      },
    })
    const actorContext = context.layers.actorContext.get(name)
    layerBBoxButtonInput.checked = actorContext.bbox
  })

  // Append the button container to the main UI row
  mainUIRow.appendChild(buttonContainer)
}

export default createBoundingBoxButton
