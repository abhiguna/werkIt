import React, { Component } from 'react';
import { View, ScrollView, Modal, Text, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import TextBox from '../components/TextBox';
import Button from '../components/Button';
import ExerciseLabel from '../components/ExerciseLabel';
import ExerciseEditor from './ExerciseEditor';

import * as serverMethods from '../ServerMethods';
import light from '../light';
import dark from '../dark';
import { duplicateExerciseError, missingNameError, missingExerciseError, workoutTypeError, duplicateExerciseTypeError, duplicateWorkoutTypeError } from '../components/Alerts';

export default class WorkoutEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: this.props.route.params.workout === undefined ? '' : this.props.route.params.workout,
            exercises: /*this.props.route.params?.workout.exercises ?? []*/ [],
            savedExercises: /*[{name: 'Bench', sets: true, reps: true}, {name: 'Squats', sets: true, reps: true}]*/ [],
            type: '',
            savedTypes: /*[{label: 'Lifting', value: 'lifting'}, {label: 'Running', value: 'running'}]*/ [{label: 'Add workout type', value: 'add'}],
            currKey: -1,
            currExercise: '',
            numExercises: 0,
            newType: '',
            modalVisible: false,
            editorVisible: false,
            workoutTypeVisible: false,
            edit: this.props.route.params.edit
        };

        this.addExercise = this.addExercise.bind(this);
        this.deleteExercise = this.deleteExercise.bind(this);
        this.editExercise = this.editExercise.bind(this);
    }

    componentDidMount() {
        //console.log('didMount')
        //server call to get workout information if the user decided to edit a workout
        // server call to get previously saved types
        serverMethods.getUserWorkoutTypes(this.props.route.params.username)
            .then(response => response.json())
            .then(response => {
                //console.log(response)
                let array = this.state.savedTypes;
                response.map((type) => array.unshift({label: type, value: type}));
                this.setState({ savedTypes: array });
            });
        if (this.state.name !== '') {
            serverMethods.getWorkout(this.props.route.params.username, this.state.name)
                .then(response => response.json())
                .then(response => {
                    console.log(response);
                    response.exercises.map((exercise) => {
                        this.addExercise(true, { name: exercise.name, sets: exercise.data[0].sets, reps: exercise.data[0].reps, weight: exercise.data[0].weight, duration: exercise.data[0].duration, distance: exercise.data[0].distance, pace: exercise.data[0].pace, incline: exercise.data[0].incline, laps: exercise.data[0].laps });
                    });
                    this.setState({ type: response.type }, () => {
                        serverMethods.getExercises(this.props.route.params.username, response.type)
                        .then(response => response.json())
                        .then(response => {
                            //console.log(response)
                            this.setState({ savedExercises: response })
                        });
                    });//funny logic needed here
                });
        }
    }

    addExercise(edit, exercise) {
        //console.log('add exercise');
        console.log(exercise);
        let duplicate = false;
        let newArray = this.state.exercises.map(exercise => exercise);
        for (let i = 0; i < newArray.length; i++) {
            if (newArray[i].name === exercise.name) {
                duplicateExerciseError();
                duplicate = true;
            }
        }
        if (!duplicate) {
            let key = this.state.numExercises;
            newArray.push({ key: key++, name: exercise.name, sets: exercise.sets, reps: exercise.reps, weight: exercise.weight, duration: exercise.duration, distance: exercise.distance, pace: exercise.pace, incline: exercise.incline, laps: exercise.laps });

            // if (!edit) {
                 this.setState({ numExercises: key, exercises: newArray, modalVisible: false, editorVisible: false });
            // } else {
            //    this.setState({ numExercises: key, exercises: newArray });
            //}
        }
    }

    deleteExercise(exercise) {
        let newArray = this.state.exercises;

        for (let i = 0; i < newArray.length; i++) {
            if (exercise == newArray[i].name) {
                newArray.splice(i, 1);
            }
        }

        this.setState({ exercises: newArray });
        this.setState({ currExercise: '' });
    }

    editExercise(name, field, val) {
        for (let i = 0; i < this.state.exercises.length; i++) {
            if (name === this.state.exercises[i].name) {
                //this.setState({ currKey: this.state.exercises[i].key });
                let array = this.state.exercises.slice();
                switch(field) {
                    case 'Sets':
                        array[i].sets = val;
                        break;
                    case 'Reps':
                        array[i].reps = val;
                        break;
                    case 'Weight':
                        array[i].weight = val;
                        break;
                    case 'Duration':
                        array[i].duration = val;
                        break;
                    case 'Distance':
                        array[i].distance = val;
                        break;
                    case 'Pace':
                        array[i].pace = val;
                        break;
                    case 'Incline':
                        array[i].incline = val;
                        break;
                    case 'Laps':
                        array[i].laps = val;
                        break;
                }
                //array[i] = { key: this.state.exercises[i].key, name: exercise.name, sets: exercise.sets, reps: exercise.reps, weight: exercise.weight, duration: exercise.duration, distance: exercise.distance, pace: exercise.pace, incline: exercise.incline };
                this.setState({ exercises: array });
            }
        }

        //this.setState({ currExercise: exercise });
    }

    createExerciseList() {
        //console.log('exerciselist')
        let exerciseList = [];
        for (let i = 0; i < this.state.exercises.length; i++) {
            let exercise = this.state.exercises[i];
            exerciseList.push(
                <ExerciseLabel
                    key={i}
                    name={exercise.name}
                    sets={exercise.sets}
                    reps={exercise.reps}
                    weight={exercise.weight}
                    duration={exercise.duration}
                    distance={exercise.distance}
                    pace={exercise.pace}
                    incline={exercise.incline}
                    laps={exercise.laps}
                    edit={(field, val) => this.editExercise(exercise.name, field, val)}
                    delete={(exercise) => this.deleteExercise(exercise)}
                    modalVisible={(exercise.sets || exercise.reps || exercise.weight || exercise.duration || exercise.distance || exercise.pace || exercise.incline || exercise.laps)}
                />
            );
        }

        return exerciseList;
    }

    createButtonList() {
        //console.log('buttonlist')
        console.log(this.state.savedExercises)
        let buttonList = [];
        for (let i = 0; i < this.state.savedExercises.length; i++) {
            let exercise = this.state.savedExercises[i];
            console.log(exercise.name)
            buttonList.push(
                <Button
                    key={i}
                    buttonText={exercise.name}
                    onPress={() => this.addExercise(false, { name: exercise.name, sets: exercise.data.sets, reps: exercise.data.reps, weight: exercise.data.weight, duration: exercise.data.duration, distance: exercise.data.distance, pace: exercise.data.pace, incline: exercise.data.incline, laps: exercise.data.laps })}
                    style={{width: '80%', margin: 5}}
                    darkmode={this.props.darkmode}
                    orange={true}
                />
            );
        }
        buttonList.push(
            <Button
                key={this.state.savedExercises.length}
                buttonText='Create a new exercise'
                onPress={() => {
                    this.setState({ modalVisible: false, editorVisible: true });
                }}
                style={{width: '80%', margin: 5}}
                darkmode={this.props.darkmode}
                gray={true}
            />
        );
        buttonList.push(
            <Button
                key={this.state.savedExercises.length + 1}
                buttonText='Cancel'
                onPress={() => {
                    this.setState({ modalVisible: false });
                }}
                style={{width: '80%', margin: 5}}
                darkmode={this.props.darkmode}
                gray={true}
            />
        );

        return buttonList;
    }

    render() {
        //console.log('render')  
        console.log('workout name is: ' + this.state.name)    
        let exerciseList = this.createExerciseList();

        let buttonList = this.createButtonList();

        return(
            //add a dropdown menu populated with previously added exercises
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={this.props.darkmode ? dark.workoutEditorContainer : light.workoutEditorContainer}>
                    {/* <Text style={{marginTop: 15, fontSize: 20}}>{this.state.workoutName}</Text> */}
                    <TextBox
                        placeholder='Workout Name'
                        onChangeText={(text) => this.setState({ name: text })}
                        style={{marginTop: 20, alignItems: 'center'}}
                        darkmode={this.props.darkmode}
                        value={this.state.name}
                    />
                    <DropDownPicker
                        items={this.state.savedTypes}
                        defaultValue={this.state.type}
                        placeholder='Select a workout type'
                        containerStyle={{height: 40, width: '75%'}}
                        style={{backgroundColor: this.props.darkmode ? '#6E6E6E' : '#FAFAFA'}}
                        itemStyle={{justifyContent: 'flex-start'}}
                        labelStyle={{color: this.props.darkmode ? '#FFFFFF' : '#000000'}}
                        dropDownStyle={{backgroundColor: this.props.darkmode ? '#6E6E6E' : '#FAFAFA'}}
                        onChangeItem={(item) => {
                            if (item.value === 'add') {
                                // show a text box, and then submit
                                //console.log(this.state.savedTypes[this.state.savedTypes.length - 1])
                                this.setState({ workoutTypeVisible: true })
                                // add error checking
                            } else {
                                this.setState({ type: item.value });
                                serverMethods.getExercises(this.props.route.params.username, item.value)
                                    .then(response => response.json())
                                    .then(response => {
                                        //console.log(response)
                                        this.setState({ savedExercises: response })
                                    });
                            }
                        }}
                    />
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={this.state.workoutTypeVisible}
                    >
                        <View>
                            <View style={this.props.darkmode ? dark.workoutType : light.workoutType}>
                                <TextBox
                                    placeholder='Workout type'
                                    onChangeText={(text) => this.setState({ newType: text })}
                                    darkmode={this.props.darkmode}
                                    value={this.state.newType}
                                />
                                <View style={{flexDirection: 'row'}}>
                                    <Button
                                        buttonText='Cancel'
                                        onPress={() => this.setState({ newType: '', workoutTypeVisible: false })}
                                        style={{marginRight: 30}}
                                        darkmode={this.props.darkmode}
                                        gray={true}
                                    />
                                    <Button
                                        buttonText='Submit'
                                        onPress={() => {
                                            if (this.state.newType === '') {
                                                missingNameError();
                                            } else {
                                                serverMethods.createWorkoutType(this.props.route.params.username, { name: this.state.newType, exercises: [] })
                                                    .then(response => {
                                                        if (response.status === 200) {
                                                            let array = this.state.savedTypes;
                                                            array.unshift({ label: this.state.newType, value: this.state.newType });
                                                            this.setState({ savedTypes: array, workoutTypeVisible: false });
                                                        } else {
                                                            duplicateWorkoutTypeError();
                                                        }
                                                    });
                                                // check workout type to make sure name doesn't already exist
                                            }
                                        }}
                                        darkmode={this.props.darkmode}
                                        orange={true}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <ScrollView style={this.props.darkmode ? dark.exerciseList : light.exerciseList} contentContainerStyle={{alignItems: 'center'}}>
                        {exerciseList}
                        <Modal
                            animationType='slide'
                            transparent={true}
                            visible={this.state.modalVisible}
                            onRequestClose={() => {
                                Alert.alert("Modal has been closed.");
                                this.setState({ modalVisible: !this.state.modalVisible});
                            }}
                            >
                            <View style={this.props.darkmode ? dark.centeredView : light.centeredView}>
                                <View style={this.props.darkmode ? dark.modalView : light.modalView}>
                                    {buttonList}
                                </View>
                            </View>
                        </Modal>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={this.state.editorVisible}
                            onRequestClose={() => {
                                Alert.alert("Modal has been closed.");
                                this.setState({ editorVisible: !this.state.editorVisible});
                            }}
                            >
                            <View style={this.props.darkmode ? dark.centeredView : light.centeredView}>
                                <View style={this.props.darkmode ? dark.modalView : light.modalView}>
                                    <ExerciseEditor
                                        type={this.state.type}
                                        dismiss={() => this.setState({ editorVisible: false, modalVisible: false })}
                                        createExercise={(exercise) => {
                                            console.log('wtf is going on')
                                            let obj = {name: exercise.name, data: { sets: exercise.sets, reps: exercise.reps, weight: exercise.weight, duration: exercise.duration, distance: exercise.distance, pace: exercise.pace, incline: exercise.incline, laps: exercise.laps }};
                                            serverMethods.createExercise(this.props.route.params.username, this.state.type, obj)
                                                .then(response => {
                                                    if (response.status === 200) {
                                                        let array = this.state.savedExercises;
                                                        array.push(obj);;
                                                        this.setState({ savedExercises: array });
                                                        this.addExercise(exercise);
                                                    } else {
                                                        duplicateExerciseTypeError();
                                                    }
                                                });
                                        }}
                                    />
                                </View>
                            </View>
                        </Modal>
                        <Button
                            buttonText='Add exercise'
                            style={{width: 225}}
                            onPress={() => {
                                //add a check to make sure workout type has been set
                                if (this.state.type === '') {
                                    workoutTypeError();
                                } else {
                                    this.setState({ modalVisible: true });
                                }
                            }}
                            darkmode={this.props.darkmode}
                            orange={true}
                        />
                    </ScrollView>
                    <View style={{flexDirection: 'row', marginBottom: 20}}>
                        <Button
                            buttonText='Cancel'
                            onPress={() => this.props.navigation.navigate('Workouts')}
                            style={{marginRight: 40}}
                            darkmode={this.props.darkmode}
                            orange={true}
                        />
                        <Button
                            buttonText='Delete'
                            onPress={() => {
                                //this.props.deleteExercise(this.state);
                                console.log('time to delete');
                                serverMethods.deleteWorkout(this.props.route.params.username, this.state.name);
                                this.props.navigation.navigate('Workouts');
                            }}
                            style={{marginRight: 40}}
                            darkmode={this.props.darkmode}
                            orange={true}
                        />
                        <Button
                            buttonText='Submit'
                            onPress={() => {
                                if (this.state.name === '') {
                                    missingNameError();
                                } else if (this.state.exercises.length === 0) {
                                    missingExerciseError();
                                } else {
                                    if (this.state.edit) {
                                        console.log('edit')
                                        serverMethods.editWorkout(this.props.route.params.username, { name: this.state.name, type: this.state.type, exercises: this.state.exercises });
                                    } else {
                                        console.log('create')
                                        console.log({ name: this.state.name, type: this.state.type, exercises: this.state.exercises })
                                        serverMethods.createWorkout(this.props.route.params.username, { name: this.state.name, type: this.state.type, exercises: this.state.exercises });
                                    }
                                    this.props.navigation.navigate('Workouts');
                                }
                            }}
                            darkmode={this.props.darkmode}
                            orange={true}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}