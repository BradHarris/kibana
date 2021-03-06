/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { get } from 'lodash/fp';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import {
  deleteAllQuery,
  setAbsoluteRangeDatePicker,
  setDuration,
  setInspectionParameter,
  setQuery,
  setRelativeRangeDatePicker,
  setTimelineRangeDatePicker,
  startAutoReload,
  stopAutoReload,
  toggleTimelineLinkTo,
  removeTimelineLinkTo,
  removeGlobalLinkTo,
  addGlobalLinkTo,
  addTimelineLinkTo,
  deleteOneQuery,
} from './actions';
import {
  setIsInspected,
  toggleLockTimeline,
  updateInputTimerange,
  upsertQuery,
  removeGlobalLink,
  addGlobalLink,
  removeTimelineLink,
  addTimelineLink,
  deleteOneQuery as helperDeleteOneQuery,
} from './helpers';
import { InputsModel, TimeRange } from './model';
import {
  getDefaultFromValue,
  getDefaultToValue,
  getDefaultFromString,
  getDefaultToString,
  getDefaultIntervalKind,
  getDefaultIntervalDuration,
} from '../../utils/default_date_settings';

export type InputsState = InputsModel;

export const initialInputsState: InputsState = {
  global: {
    timerange: {
      kind: 'relative',
      fromStr: getDefaultFromString(),
      toStr: getDefaultToString(),
      from: getDefaultFromValue(),
      to: getDefaultToValue(),
    },
    query: [],
    policy: {
      kind: getDefaultIntervalKind(),
      duration: getDefaultIntervalDuration(),
    },
    linkTo: ['timeline'],
  },
  timeline: {
    timerange: {
      kind: 'relative',
      fromStr: getDefaultFromString(),
      toStr: getDefaultToString(),
      from: getDefaultFromValue(),
      to: getDefaultToValue(),
    },
    query: [],
    policy: {
      kind: getDefaultIntervalKind(),
      duration: getDefaultIntervalDuration(),
    },
    linkTo: ['global'],
  },
};

export const inputsReducer = reducerWithInitialState(initialInputsState)
  .case(setTimelineRangeDatePicker, (state, { from, to }) => {
    return {
      ...state,
      global: {
        ...state.global,
        linkTo: [],
      },
      timeline: {
        ...state.timeline,
        timerange: {
          kind: 'absolute',
          fromStr: undefined,
          toStr: undefined,
          from,
          to,
        },
        linkTo: [],
      },
    };
  })
  .case(setAbsoluteRangeDatePicker, (state, { id, from, to }) => {
    const timerange: TimeRange = {
      kind: 'absolute',
      fromStr: undefined,
      toStr: undefined,
      from,
      to,
    };
    return updateInputTimerange(id, timerange, state);
  })
  .case(setRelativeRangeDatePicker, (state, { id, fromStr, from, to, toStr }) => {
    const timerange: TimeRange = {
      kind: 'relative',
      fromStr,
      toStr,
      from,
      to,
    };
    return updateInputTimerange(id, timerange, state);
  })
  .case(deleteAllQuery, (state, { id }) => ({
    ...state,
    [id]: {
      ...get(id, state),
      query: state.global.query.slice(state.global.query.length),
    },
  }))
  .case(setQuery, (state, { inputId, id, inspect, loading, refetch }) =>
    upsertQuery({ inputId, id, inspect, loading, refetch, state })
  )
  .case(deleteOneQuery, (state, { inputId, id }) => helperDeleteOneQuery({ inputId, id, state }))
  .case(setDuration, (state, { id, duration }) => ({
    ...state,
    [id]: {
      ...get(id, state),
      policy: {
        ...get(`${id}.policy`, state),
        duration,
      },
    },
  }))
  .case(startAutoReload, (state, { id }) => ({
    ...state,
    [id]: {
      ...get(id, state),
      policy: {
        ...get(`${id}.policy`, state),
        kind: 'interval',
      },
    },
  }))
  .case(stopAutoReload, (state, { id }) => ({
    ...state,
    [id]: {
      ...get(id, state),
      policy: {
        ...get(`${id}.policy`, state),
        kind: 'manual',
      },
    },
  }))
  .case(toggleTimelineLinkTo, (state, { linkToId }) => toggleLockTimeline(linkToId, state))
  .case(setInspectionParameter, (state, { id, inputId, isInspected, selectedInspectIndex }) =>
    setIsInspected({ id, inputId, isInspected, selectedInspectIndex, state })
  )
  .case(removeGlobalLinkTo, state => removeGlobalLink(state))
  .case(addGlobalLinkTo, (state, { linkToId }) => addGlobalLink(linkToId, state))
  .case(removeTimelineLinkTo, state => removeTimelineLink(state))
  .case(addTimelineLinkTo, (state, { linkToId }) => addTimelineLink(linkToId, state))
  .build();
