import macro from '@kitware/vtk.js/macro'

import style from '../ItkVtkViewer.module.css'
import applyContrastSensitiveStyleToElement from '../applyContrastSensitiveStyleToElement'

import { gradientIconDataUri } from '@itk-viewer/icons'

function createGradientOpacitySlider(context, uiContainer) {
  const sliderEntry = document.createElement('div')
  sliderEntry.setAttribute('class', style.sliderEntry)
  sliderEntry.innerHTML = `
    <!-- Remove slider
        <div itk-vtk-tooltip itk-vtk-tooltip-top-fullscreen itk-vtk-tooltip-content="Gradient opacity scale" class="${style.gradientOpacitySlider}">
          <img src="${gradientIconDataUri}" alt="gradient opacity"/>
        </div>
        <div class="${style.gradientOpacityScale}" style="display: none;">
          <input type="range" min="0" max="0.99" value="0.5" step="0.01" id="${context.id}-gradientOpacityScaleSlider" />
        </div>
    -->
    <label for="${context.id}-gradientOpacitySlider" class="${style.descriptionLabel}">
      Opacity
    </label>
    <input type="range" min="0" max="1" value="0.2" step="0.01" orient="vertical"
      id="${context.id}-gradientOpacitySlider"
      class="${style.slider}" />`

  // const sliderEntryDiv = sliderEntry.children[0]  // Icon Button
  // const gradientOpacityScaleDiv = sliderEntry.children[1] // Hidden scale container
  // const gradientOpacityScaleSlider = gradientOpacityScaleDiv.children[0] // the slider inside the hidden scale container
  // const gradientOpacitySlider = sliderEntry.children[2] // Vertical gradient opacity slider
  // context.images.sliderEntryDiv = sliderEntryDiv
  // applyContrastSensitiveStyleToElement( // To make sure that the icon/button is styled correctly
  //   context,
  //   'invertibleButton',
  //   sliderEntryDiv
  // )
  // context.images.gradientOpacitySlider = gradientOpacitySlider
  // context.images.gradientOpacityScaleSlider = gradientOpacityScaleSlider

  const gradientOpacitySlider = sliderEntry.querySelector(`#${context.id}-gradientOpacitySlider`);
  context.images.gradientOpacitySlider = gradientOpacitySlider

  applyContrastSensitiveStyleToElement(context, 'invertibleButton', sliderEntry)


  // sliderEntryDiv.addEventListener('click', event => { // Toggle the display of the hidden scale container
  //   if (gradientOpacityScaleDiv.style.display === 'none') {
  //     gradientOpacityScaleDiv.style.display = 'block'
  //   } else {
  //     gradientOpacityScaleDiv.style.display = 'none'
  //   }
  // })

  gradientOpacitySlider.addEventListener('input', event => {
    event.preventDefault()
    event.stopPropagation()
    context.service.send({
      type: 'IMAGE_GRADIENT_OPACITY_CHANGED',
      data: {
        name: context.images.selectedName,
        gradientOpacity: Number(gradientOpacitySlider.value),
      },
    })
  })

  // gradientOpacityScaleSlider.addEventListener('input', event => {
  //   event.preventDefault()
  //   event.stopPropagation()
  //   context.service.send({
  //     type: 'IMAGE_GRADIENT_OPACITY_SCALE_CHANGED',
  //     data: {
  //       name: context.images.selectedName,
  //       gradientOpacityScale: Number(gradientOpacityScaleSlider.value),
  //     },
  //   })
  // })

  uiContainer.appendChild(sliderEntry)
}

export default createGradientOpacitySlider
