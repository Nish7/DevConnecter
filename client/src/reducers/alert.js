/* eslint-disable import/no-anonymous-default-export */
import { SET_ALERT, REMOVE_ALERT } from '../actions/types';
const intialState = [];

export default function (state = intialState, action) {
	switch (action.type) {
		case SET_ALERT:
			return [...state, action.payload];
		case REMOVE_ALERT:
			return state.filter((state) => state.id !== action.payload);
		default:
			return state;
	}
}
