import Immutable from 'seamless-immutable';
import { Toast } from 'native-base';
import { REHYDRATE } from 'redux-persist';
import { LOGOUT } from '../actions/constants';
import {
    START_TRACKING,
    STOP_TRACKING,
    TRACKING_ERROR,
    POSITION
} from '../actions/constants';

const defaultPosition = Immutable({
    latitude: null,
    longitude: null,
    altitude: null,
    speed: null,
    heading: null,
    accuracy: null,
    timestamp: null
});

const INITIAL_STATE = Immutable({
    isTracking: false,
    position: defaultPosition,
    error: null
});

const tracking = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case REHYDRATE:
            return state;
        case LOGOUT:
            return state;
        case START_TRACKING:
            Toast.show({
                text: 'Tracking started',
                type: 'success'
            });
            return Immutable.merge(state, { isTracking: true, error: null });
        case STOP_TRACKING:
            Toast.show({
                text: 'Tracking stopped'
            });
            return Immutable.merge(state, { isTracking: false, error: null });
        case TRACKING_ERROR:
            Toast.show({
                text: `Tracking error: ${action.error}`,
                type: 'danger',
                duration: 10000
            });
            return Immutable.merge(state, { error: action.error });
        case POSITION:
            const { position: { coords, timestamp } } = action;
            const position = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                altitude: coords.altitude,
                speed: coords.speed,
                heading: coords.heading,
                accuracy: coords.accuracy,
                timestamp: timestamp
            };
            return Immutable.merge(state, { position, error: null });
        default:
            return state;
    }
};

export default tracking;
