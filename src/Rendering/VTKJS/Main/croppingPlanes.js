import { mat4, vec3, quat, vec4 } from 'gl-matrix'
import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData'
import { transformVec3 } from 'vtk.js/Sources/Widgets/Widgets3D/ImageCroppingWidget/helpers'
import vtkMath from 'vtk.js/Sources/Common/Core/Math'
import vtkPlane from 'vtk.js/Sources/Common/DataModel/Plane'
import vtkBoundingBox from 'vtk.js/Sources/Common/DataModel/BoundingBox'

import toggleCroppingPlanes from './toggleCroppingPlanes'
import HandlesInPixelsImageCroppingWidget from '../Widgets/HandlesInPixelsImageCroppingWidget'
import { transformBounds } from '../../../transformBounds'
import { arraysEqual, makeIndexToWorld } from '../../../internalUtils'

export function getCropWidgetBounds(context, bounds = []) {
  const { croppingWidget } = context.main

  vtkBoundingBox.reset(bounds)
  croppingWidget
    .getWidgetState()
    .getStatesWithLabel('faces')
    .map(h => h.getOrigin())
    .forEach(point => vtkBoundingBox.addPoint(bounds, ...point))
  return bounds
}

export function getBoundsOfFullImage({ images, actorName }) {
  const imageActorContext = images.actorContext.get(actorName)
  if (!imageActorContext || imageActorContext.loadedScale === null)
    return [...vtkBoundingBox.INIT_BOUNDS]

  const { compare } = imageActorContext
  const compareEnabled = compare?.method !== 'disabled'
  const fixedImage = compareEnabled
    ? images.actorContext.get(compare.fixedImageName)?.image
    : undefined

  const multiScale =
    fixedImage ?? imageActorContext.image ?? imageActorContext.labelImage
  return multiScale.getWorldBounds(imageActorContext.loadedScale)
}

export function createCropping(context) {
  const croppingWidget = HandlesInPixelsImageCroppingWidget.newInstance()
  context.main.croppingWidget = croppingWidget
  context.main.widgetCroppingPlanes = Array.from({ length: 6 }, () =>
    vtkPlane.newInstance()
  )
  context.itkVtkView.addCroppingWidget(croppingWidget)

  croppingWidget
    .getWidgetState()
    .getStatesWithLabel('handles')
    .forEach(h => h.setScale1(22))
  croppingWidget.setFaceHandlesEnabled(true)
  croppingWidget.setCornerHandlesEnabled(false)
  croppingWidget.setEdgeHandlesEnabled(false)

  // These are helper objects to bridge datasets in the scene, images,
  // geometry, and points sets, the croppingPlanes, and the
  // ImageCroppingWidget.
  //
  // The croppingVirtualImage is used to set the worldToIndex transform and
  // indexToWorld transform with imageCroppingWidget.copyImageDataDescription.
  //
  // The Direction of the virtual image is set to the Direction of the
  // imagesMachineContext.selectedName's Direction.
  //
  // The Origin of the virtual image is set to the lower left of the
  // croppingBoundingBox
  //
  // The Spacing of the virtual image is set to the spacing of the selected
  // image, if one exists, otherwise the extent of the croppingBoundingBox /
  // 1000 (is there a better approach for this?).

  context.main.croppingVirtualImage = vtkImageData.newInstance()

  const cropState = croppingWidget.getWidgetState().getCroppingPlanes()
  cropState.onModified(() => {
    const { croppingWidget } = context.main

    // updates bounds for camera clipping planes
    const widgetBounds = getCropWidgetBounds(
      context,
      croppingWidget.getWidgetState().getBounds()
    )
    croppingWidget.placeWidget(widgetBounds)

    const prop = context.itkVtkView.getWidgetProp(croppingWidget)
    if (
      prop &&
      prop.getEnabled() &&
      croppingWidget
        .getWidgetState()
        .getStatesWithLabel('handles')
        .some(h => h.getActive())
    ) {
      const indexes = cropState.getPlanes()

      const indexToWorld = context.main.croppingVirtualImage.getIndexToWorld()
      const direction = context.main.croppingVirtualImage.getDirection()
      const croppingPlanes = [
        {
          origin: Array.from(
            transformVec3([indexes[0], indexes[2], indexes[4]], indexToWorld)
          ),
          normal: Array.from(direction.slice(0, 3)),
        },
        {
          origin: Array.from(
            transformVec3([indexes[1], indexes[3], indexes[5]], indexToWorld)
          ),
          normal: vtkMath.multiplyScalar(Array.from(direction.slice(0, 3)), -1),
        },
        {
          origin: Array.from(
            transformVec3([indexes[0], indexes[2], indexes[4]], indexToWorld)
          ),
          normal: Array.from(direction.slice(3, 6)),
        },
        {
          origin: Array.from(
            transformVec3([indexes[1], indexes[3], indexes[5]], indexToWorld)
          ),
          normal: vtkMath.multiplyScalar(Array.from(direction.slice(3, 6)), -1),
        },
        {
          origin: Array.from(
            transformVec3([indexes[0], indexes[2], indexes[4]], indexToWorld)
          ),
          normal: Array.from(direction.slice(6, 9)),
        },
        {
          origin: Array.from(
            transformVec3([indexes[1], indexes[3], indexes[5]], indexToWorld)
          ),
          normal: vtkMath.multiplyScalar(Array.from(direction.slice(6, 9)), -1),
        },
      ]

      // Don't reset planes after user input
      context.main.areCroppingPlanesTouched = true

      context.service.send({
        type: 'CROPPING_PLANES_CHANGED',
        data: croppingPlanes,
      })

      context.service.send({
        type: 'CROPPING_PLANES_CHANGED_BY_USER',
      })
    }
  })
  context.itkVtkView.setWidgetManagerInitializedCallback(() => {
    // Turn cropping ON so the widget is added
    toggleCroppingPlanes(context)

    // Grab the *proxy* for our cropping-widget
    const widgetProp = context.itkVtkView.getWidgetProp(
      context.main.croppingWidget
    )
    if (!widgetProp) {
      console.warn('Cropping widget proxy not found!')
      return
    }

    // Recolor every actor in every representation to bright red
    widgetProp.getRepresentations().forEach((rep, repIndex) => {
      rep.getActors().forEach((actor, actorIndex) => {
        const prop = actor.getProperty()
        prop.setColor(0.0, 1.0, 0.0) // “face” color
        prop.setEdgeColor(0.0, 1.0, 0.0) // line/edge color
        // optionally tweak line width:
        prop.setLineWidth(2)
        console.log(`Recolored rep[${repIndex}] actor[${actorIndex}] to green`)
      })
    })

    // Force a re-render so you see it immediately
    context.itkVtkView.render()
  })
}

export function updateCroppingParameters(context) {
  const { croppingVirtualImage, croppingWidget } = context.main

  // croppingBoundingBox is an axis-aligned bounding box that encapsulates all
  // objects in the scene.
  const croppingBoundingBox = [...vtkBoundingBox.INIT_BOUNDS]
  context.itkVtkView
    .getRepresentations()
    .filter(r => r.getClassName() !== 'vtkVolumeRepresentationProxy') // filter out possibly outdated images which may change in size across scales
    .map(r => r.getBounds())
    .concat([getBoundsOfFullImage(context)]) // include latest image
    .forEach(bounds => {
      vtkBoundingBox.addBounds(croppingBoundingBox, ...bounds)
    })
  const uninitialized = arraysEqual(
    croppingBoundingBox,
    vtkBoundingBox.INIT_BOUNDS
  )

  if (uninitialized) return

  // Put global bounds in image oriented space

  const worldToImageDirection = makeIndexToWorld({
    direction: croppingVirtualImage.getDirection(),
    origin: [0, 0, 0],
    spacing: [1, 1, 1],
  })

  const orientedBox = transformBounds(
    worldToImageDirection,
    croppingBoundingBox
  )

  const originWorldSpace = vec3.transformMat4(
    croppingVirtualImage.getOrigin(),
    [orientedBox[0], orientedBox[2], orientedBox[4]],
    worldToImageDirection
  )
  croppingVirtualImage.setOrigin(originWorldSpace)

  const spacing = croppingVirtualImage.getSpacing()
  croppingVirtualImage.setDimensions([
    (orientedBox[1] - orientedBox[0]) / spacing[0],
    (orientedBox[3] - orientedBox[2]) / spacing[1],
    (orientedBox[5] - orientedBox[4]) / spacing[2],
  ])

  const widgetState = croppingWidget.getWidgetState()
  widgetState.setIndexToWorldT(...croppingVirtualImage.getIndexToWorld())
  widgetState.setWorldToIndexT(...croppingVirtualImage.getWorldToIndex())

  if (!context.main.areCroppingPlanesTouched) {
    // fit new actor if planes not changed by user
    context.service.send('RESET_CROPPING_PLANES')
  } else {
    // update widget transforms
    context.service.send({
      type: 'CROPPING_PLANES_CHANGED',
      data: context.main.croppingPlanes,
    })
  }
}

export function updateCroppingParametersFromImage(context, image) {
  const { croppingVirtualImage } = context.main
  croppingVirtualImage.setSpacing(image.getSpacing())
  croppingVirtualImage.setDirection(image.getDirection())

  updateCroppingParameters(context, image)
}

export function addCroppingPlanes(context, actor) {
  const { widgetCroppingPlanes } = context.main
  const mapper = actor.getMapper()
  widgetCroppingPlanes.forEach(plane => {
    mapper.addClippingPlane(plane)
  })
}

export function makeCroppable(context, representationProxy) {
  // allows for grabbing crop handles on the other side of volume
  representationProxy.getVolumes().forEach(v => v.setPickable(false))
  addCroppingPlanes(context, representationProxy)
}
