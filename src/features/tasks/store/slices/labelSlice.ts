import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ILabel, ITaskLabelsState } from '../../types/taskTypes'

//#region state
const initialState: ITaskLabelsState = {
  items: [
    {
      id: 'label-bug',
      name: 'Bug',
      color: 'rose',
    },
    {
      id: 'label-feature',
      name: 'Feature',
      color: 'blue',
    },
    {
      id: 'label-design',
      name: 'Design',
      color: 'violet',
    },
    {
      id: 'label-research',
      name: 'Research',
      color: 'amber',
    },
  ],
}
//#endregion state

//#region slice
const labelSlice = createSlice({
  name: 'taskLabels',
  initialState,
  reducers: {
    addLabel(state, action: PayloadAction<ILabel>) {
      const nextLabel = action.payload

      const alreadyExists = state.items.some((label) => label.id === nextLabel.id)

      if (alreadyExists) {
        return
      }

      state.items.push(nextLabel)
    },

    updateLabel(
      state,
      action: PayloadAction<{
        id: string
        changes: Partial<Omit<ILabel, 'id'>>
      }>,
    ) {
      const { id, changes } = action.payload
      const existingLabel = state.items.find((label) => label.id === id)

      if (!existingLabel) {
        return
      }

      Object.assign(existingLabel, changes)
    },

    deleteLabel(state, action: PayloadAction<string>) {
      state.items = state.items.filter((label) => label.id !== action.payload)
    },

    hydrateTaskLabels(state, action: PayloadAction<ILabel[]>) {
      state.items = action.payload?.length ? action.payload : initialState.items
    },
  },
})
//#endregion slice

//#region exports
export const { addLabel, updateLabel, deleteLabel, hydrateTaskLabels } =
  labelSlice.actions

export default labelSlice.reducer
//#endregion exports
