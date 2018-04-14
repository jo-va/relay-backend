import React from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    Alert
} from 'react-native';
import { Query } from 'react-apollo';
import { Actions } from 'react-native-router-flux';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
import {
    Button,
    Container,
    Spinner
} from '../components';
import storage from '../services/storage';
import PARTICIPANT_QUERY from '../graphql/participant.query';

class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        const authToken = await storage.get('auth_token');

        BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: 10,
            notificationTitle: 'Background tracking',
            notificationText: 'enabled',
            debug: true,
            startOnBoot: false,
            stopOnTerminate: false,
            locationProvider: BackgroundGeolocation.RAW_PROVIDER,
            interval: 5000,
            fastestInterval: 5000,
            activitiesInterval: 10000,
            stopOnStillActivity: false,
            url: 'http://192.168.0.183:3000/graphql',
            httpHeaders: {
                'authorization': `Bearer ${authToken}`
            },
            postTemplate: {
                query: 'mutation { updatePosition(latitude: @latitude, longitude: @longitude) }'
            }
        });

        console.log('componentDidMount');
        BackgroundGeolocation.on('location', location => {
            console.log(location);
            // handle your locations here
            // to perform long running operation on iOS
            // you need to create background task
            BackgroundGeolocation.startTask(taskKey => {
                // execute long running task
                // eg. ajax post location
                // IMPORTANT: task has to be ended by endTask
                BackgroundGeolocation.endTask(taskKey);
            });
        });

        BackgroundGeolocation.on('stationary', stationaryLocation => {
            console.log(stationaryLocation);
        });

        BackgroundGeolocation.on('error', error => {
            console.log('[ERROR] BackgroundGeolocation error:', error);
        });

        BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });

        BackgroundGeolocation.on('stop', () => {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
        });

        BackgroundGeolocation.on('authorization', status => {
            console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
            if (status !== BackgroundGeolocation.AUTHORIZED) {
                Alert.alert('Location services are disabled', 'Would you like to open location settings?', [
                    { text: 'Yes', onPress: () => BackgroundGeolocation.showLocationSettings() },
                    { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                ]);
            }
        });

        BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
        });

        BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
        });

        BackgroundGeolocation.checkStatus(status => {
            console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
            console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
            console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

            // you don't need to check status before start (this is just the example)
            if (!status.isRunning) {
                BackgroundGeolocation.start(); //triggers start on start event
            }
        });
    }

    componentWillUnmount() {
        // unregister all event listeners
        BackgroundGeolocation.events.forEach(event => BackgroundGeolocation.removeAllListeners(event));
    }

    async logout() {
        console.log(await storage.get('auth_token'));
        storage.remove('auth_token');
        Actions.reset('auth');
    }

    render() {
        return (
            <Query
                query={PARTICIPANT_QUERY}
            >
                {({ loading, data: { participant } }) => {
                    if (loading) {
                        return <Spinner />;
                    }
                    return (
                        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContainer}>
                            <Text>Welcome {participant && participant.username}</Text>
                            <Container>
                                <Button
                                    label='Logout'
                                    styles={{button: styles.primaryButton, label: styles.buttonWhiteText}}
                                    onPress={this.logout.bind(this)}
                                />
                            </Container>
                        </ScrollView>
                    );
                }}
            </Query>
        );
    }
}

const styles = StyleSheet.create({
    scroll: {
        padding: 30,
        flexDirection: 'column'
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center'
    },	
    primaryButton: {
        backgroundColor: '#34a853'
    },
    buttonWhiteText: {
        fontSize: 20,
        color: '#fff'
    }
});

export default Dashboard;