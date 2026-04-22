import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/store'

import type { ILabel } from '../../types/taskTypes'

//#region constants
const EMPTY_LABELS: ILabel[] = []
//#endregion constants

//#region base selectors
export const selectTaskLabelsState = (state: RootState) => state.taskLabels

export const selectLabelItems = (state: RootState) => state.taskLabels.items
//#endregion base selectors

//#region derived selectors
export const selectLabelMap = createSelector([selectLabelItems], (labels) =>
  labels.reduce<Record<string, ILabel>>((accumulator, label) => {
    accumulator[label.id] = label
    return accumulator
  }, {}),
)

export const selectLabelOptions = createSelector([selectLabelItems], (labels) =>
  labels.map((label) => ({
    value: label.id,
    label: label.name,
    color: label.color,
  })),
)

export const selectLabelById = createSelector(
  [selectLabelItems, (_state: RootState, labelId: string | null) => labelId],
  (labels, labelId): ILabel | null => {
    if (!labelId) {
      return null
    }

    return labels.find((label) => label.id === labelId) ?? null
  },
)

export const selectLabelsByIds = createSelector(
  [selectLabelItems, (_state: RootState, labelIds: string[] | undefined) => labelIds],
  (labels, labelIds): ILabel[] => {
    if (!labelIds?.length) {
      return EMPTY_LABELS
    }

    return labels.filter((label) => labelIds.includes(label.id))
  },
)
//#endregion derived selectors
