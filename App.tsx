import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
// 1. 앱 재실행시, 마지막 상태의 Work 또는 Travel 기억하기
// 2. Todo에 완료 기능 추가하기
// 3. Todo에 수정 기능 추가하기
interface Todo {
    text: string;
    working: boolean;
    completed: boolean;
    editStatus: boolean;
}
const STORAGE_KEY = "@toDos";
const WORKING_STATE = "@working";

export default function App() {
    const [working, setWorking] = useState(true);
    const [text, setText] = useState("");
    const [completed, setCompleted] = useState(false);
    const [editStatus, setEditStatus] = useState(false);
    const [editText, setEditText] = useState("");
    const [todos, setTodos] = useState<Record<string, Todo>>({});

    useEffect(() => {
        loadWorkingState();
        loadTodos();
    }, []);
    useEffect(() => {
        saveWorkingState();
    }, [working]);
    const work = () => setWorking(true);
    const travel = () => setWorking(false);
    const saveTodos = async (newTodos: Record<string, Todo>) => {
        try {
            const jsonValue = JSON.stringify(newTodos);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
            alert("Failed to save todo");
        }
    };
    const loadTodos = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            if (jsonValue !== null) {
                setTodos(JSON.parse(jsonValue));
            }
        } catch (e) {
            alert("Failed to load todos. Try later");
        }
    };

    const onChangeText = (payload: any) => setText(payload);
    const addTodo = async () => {
        if (text === "") return;
        // 입력한 텍스트를 투두에 추가
        const newTodos = { ...todos, [Date.now()]: { text, working, completed, editStatus } };
        setTodos(newTodos);
        await saveTodos(newTodos);
        setText("");
    };
    const deleteTodo = (key: string) => {
        Alert.alert("Delete To do", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "I'm sure",
                onPress: () => {
                    const newTodos = { ...todos };
                    delete newTodos[key];
                    setTodos(newTodos);
                    saveTodos(newTodos);
                },
                style: "destructive",
            },
        ]);
    };
    const saveWorkingState = async () => {
        await AsyncStorage.setItem(WORKING_STATE, JSON.stringify(working));
    };
    const loadWorkingState = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(WORKING_STATE);
            if (jsonValue !== null) {
                setWorking(JSON.parse(jsonValue));
            }
        } catch (e) {
            console.log("Failed to load working state");
        }
    };
    const completedTodo = (key: string) => {
        const newTodo = { ...todos };
        newTodo[key] = { ...newTodo[key], completed: !newTodo[key].completed };
        setTodos(newTodo);
        saveTodos(newTodo);
    };
    const updateEditStatus = (key: string) => {
        const newTodo = { ...todos };
        newTodo[key] = { ...newTodo[key], editStatus: !newTodo[key].editStatus };
        setTodos(newTodo);
        setEditText(newTodo[key].text);
    };
    const onChangeTodoText = (payload: string) => setEditText(payload);
    const updateTodos = (key: string) => {
        editText
            ? Alert.alert("Update To do", "Are you sure?", [
                  { text: "Cancel" },
                  {
                      text: "I'm sure",
                      onPress: () => {
                          const newTodos = { ...todos };
                          newTodos[key].text = editText;
                          newTodos[key].editStatus = false;
                          setTodos(newTodos);
                          saveTodos(newTodos);
                          setEditText("");
                      },
                  },
              ])
            : Alert.alert("Alert", "Please write some todo");
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <StatusBar style="light" />
                <TouchableOpacity onPress={work}>
                    <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={travel}>
                    <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                value={text}
                returnKeyType="done"
                onChangeText={onChangeText}
                onSubmitEditing={addTodo}
                placeholder={working ? "Add things to do" : "Where do you want to go?"}
                style={styles.input}
            />
            <ScrollView>
                {Object.keys(todos).map((key: string) =>
                    todos[key].working === working ? (
                        todos[key].editStatus ? (
                            <View style={{ ...styles.todo, backgroundColor: "white" }} key={key}>
                                <TextInput
                                    value={editText}
                                    returnKeyType="done"
                                    onChangeText={onChangeTodoText}
                                    onSubmitEditing={() => updateTodos(key)}
                                    style={styles.editInput}
                                />
                                <View style={styles.todoBtn}>
                                    <TouchableOpacity onPress={() => updateTodos(key)}>
                                        <Text>✅</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => updateEditStatus(key)}>
                                        <Text>❌</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.todo} key={key}>
                                <Text
                                    style={
                                        todos[key].completed
                                            ? { ...styles.todoText, color: "grey", textDecorationLine: "line-through" }
                                            : styles.todoText
                                    }
                                >
                                    {todos[key].text}
                                </Text>
                                <View style={styles.todoBtn}>
                                    <TouchableOpacity onPress={() => updateEditStatus(key)}>
                                        <AntDesign name="edit" size={23} color={todos[key].completed ? "grey" : "white"} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => completedTodo(key)}>
                                        {todos[key].completed ? (
                                            <MaterialIcons name="check-box" size={24} color="white" />
                                        ) : (
                                            <MaterialIcons name="check-box-outline-blank" size={24} color="white" />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteTodo(key)}>
                                        <Text>❎</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    ) : null
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 100,
    },
    btnText: {
        fontSize: 30,
        fontWeight: 600,
    },
    input: {
        backgroundColor: "white",
        marginVertical: 20,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 30,
        fontSize: 15,
    },
    todo: {
        backgroundColor: theme.grey,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    todoText: {
        color: "white",
        fontSize: 16,
        fontWeight: 500,
    },
    todoBtn: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    editInput: {},
});
