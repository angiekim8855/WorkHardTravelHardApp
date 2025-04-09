import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Todo {
    text: string;
    working: boolean;
}
const STORAGE_KEY = "@toDos";
export default function App() {
    const [working, setWorking] = useState(true);

    useEffect(() => {
        loadTodos();
    }, []);
    const work = () => setWorking(true);
    const travel = () => setWorking(false);
    const [text, setText] = useState("");
    const [todos, setTodos] = useState<Record<string, Todo>>({});
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
        const newTodos = { ...todos, [Date.now()]: { text, working } };
        setTodos(newTodos);
        await saveTodos(newTodos);
        setText("");
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
                        <View style={styles.todo} key={key}>
                            <Text style={styles.todoText}>{todos[key].text}</Text>
                        </View>
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
    },
    todoText: {
        color: "white",
        fontSize: 16,
        fontWeight: 500,
    },
});
