import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import { makeHtml } from '../utils.js'
import style from '../ItkVtkViewer.module.css'
import { downloadIconDataUri } from '@itk-viewer/icons'
import applyContrastSensitiveStyleToElement from '../applyContrastSensitiveStyleToElement.js'
import { extensions } from '../Layers/extensionToImageIo.js'

let dialog

function createDownloadROIButton(context, mainUIRow) {
  // Ensure the dialog is only created once
  if (!dialog) {
    dialog = makeHtml(`
      <md-dialog class="${style.saveDialog}">
        <div slot="headline">Save file format</div>
        <form id="save-form" slot="content" method="dialog">
          ${extensions
            .map(
              (extension, i) =>
                `<label>
                  <md-radio name="format" value="${extension}" ${
                  i === 0 ? 'checked' : ''
                } touch-target="wrapper"></md-radio>
                  <span aria-hidden="true">${extension}</span>
                </label>`
            )
            .join('')}
        </form>
        <div slot="actions">
          <md-text-button form="save-form" value="cancel">Cancel</md-text-button>
          <md-text-button form="save-form" autofocus value="ok">OK</md-text-button>
        </div>
      </md-dialog>
    `)
    dialog.addEventListener('close', () => {
      const okClicked = dialog.returnValue === 'ok'

      if (okClicked) {
        const radios = document.querySelectorAll('md-radio[name=format]')
        const format = Array.from(radios).find(radio => radio.checked).value
        context.service.send({
          type: 'DOWNLOAD_IMAGE',
          data: {
            name: context.images.selectedName,
            format,
          },
        })
      }
    })
    document.body.appendChild(dialog) // Attach dialog to body to avoid UI layout issues
  }

  // Create the button
  const downloadROIButton = document.createElement('div')
  downloadROIButton.innerHTML = `
    <input type="checkbox" id="${context.id}-download-roi" class="${style.toggleInput}" />
    <label itk-vtk-tooltip itk-vtk-tooltip-top itk-vtk-tooltip-content="Save ROI" class="${style.toggleButton}" for="${context.id}-download-roi">
      <img style="height: 23px" src="${downloadIconDataUri}" />
    </label>
  `
  const downloadROIButtonLabel = downloadROIButton.children[1]
  downloadROIButton.style.height = '23px'
  applyContrastSensitiveStyleToElement(
    context,
    'invertibleButton',
    downloadROIButtonLabel
  )

  // Append to the main UI row instead of the container
  mainUIRow.appendChild(downloadROIButton)

  // Add event listener to show dialog when button is clicked
  downloadROIButton.addEventListener('click', event => {
    event.stopPropagation()
    dialog.show()
  })

  return downloadROIButton
}

export default createDownloadROIButton
