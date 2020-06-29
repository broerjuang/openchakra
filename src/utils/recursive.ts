import omit from 'lodash/omit'
import { generateId } from './generateId'

export const duplicateComponent = (
  componentToClone: IComponent,
  components: IComponents,
) => {
  const clonedComponents: IComponents = {}

  const cloneComponent = (component: IComponent) => {
    const newid = generateId()
    const children = component.children.map(child => {
      return cloneComponent(components[child])
    })

    clonedComponents[newid] = {
      ...component,
      id: newid,
      props: { ...component.props },
      children,
    }

    children.forEach(child => {
      clonedComponents[child].parent = newid
    })

    return newid
  }

  const newId = cloneComponent(componentToClone)

  return {
    newId,
    clonedComponents,
  }
}

export const deleteComponent = (
  component: IComponent,
  components: IComponents,
) => {
  let updatedComponents = { ...components }
  const deleteRecursive = (
    children: IComponent['children'],
    id: IComponent['id'],
  ) => {
    children.forEach(child => {
      updatedComponents[child] &&
        deleteRecursive(updatedComponents[child].children, child)
    })

    updatedComponents = omit(updatedComponents, id)
  }

  deleteRecursive(component.children, component.id)
  updatedComponents = omit(updatedComponents, component.id)
  return updatedComponents
}

export const getComponentParents = (
  component: IComponent,
  components: IComponents,
) => {
  let currentComponentId = component.id
  const parents: string[] = []

  while (currentComponentId !== 'root') {
    const parent = components[currentComponentId].parent
    parents.push(parent)
    currentComponentId = parent
  }

  return parents
}

export const detachUserComponent = (
  componentToDetach: IComponent,
  components: IComponents,
) => {
  const masterComponent = components[componentToDetach.instanceOf!]
  const parentElement = components[componentToDetach.parent]
  const { newId, clonedComponents } = duplicateComponent(
    masterComponent,
    components,
  )
  delete components[componentToDetach.id]
  components = {
    ...components,
    ...clonedComponents,
  }
  const childIdx = components[parentElement.id].children.findIndex(
    child => child === componentToDetach.id,
  )
  components[parentElement.id].children[childIdx] = newId

  return newId
}
