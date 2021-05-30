import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  AsyncStorage,
  Alert,
  Button,
} from "react-native";

// LinkedList 구현
const Node = function (data) {
  this.data = data;
  this.link = null;
};
const LinkedList = function () {
  this.length = 0;
  this.head = null;
};

LinkedList.prototype.add = function (data) {
  const newNode = new Node(data);
  if (this.head == null) {
    this.head = newNode;
    this.length++;
  } else {
    let currentNode = this.head;
    while (currentNode.link !== null) {
      currentNode = currentNode.link;
    }
    currentNode.link = newNode;
    this.length++;
  }
};

LinkedList.prototype.insertFirstNode = function (data) {
  const newNode = new Node(data);
  newNode.link = this.head;
  this.head = newNode;
  this.length++;
};

LinkedList.prototype.insertMiddleNode = function (pre, data) {
  const newNode = new Node(data);
  let currentNode = this.head;

  while (currentNode.data !== pre) currentNode = currentNode.link;

  let temp = currentNode.link;
  newNode.link = temp;
  currentNode.link = newNode;
  this.length++;
};

LinkedList.prototype.remove = function () {
  let currentNode = this.head;
  while (currentNode.link.link !== null) currentNode = currentNode.link;
  currentNode.link = null;
  this.length--;
};

LinkedList.prototype.delete = function (data) {
  let currentNode = this.head;
  let temp;

  if (currentNode.data !== data) {
    while (currentNode.link.data !== data) currentNode = currentNode.link;
    temp = currentNode.link.link;
    currentNode.link.link = null;
    currentNode.link = temp;
  } else {
    temp = currentNode.link;
    currentNode.link = null;
    this.head = temp;
  }
  this.length--;
};

LinkedList.prototype.showData = function () {
  let currentNode = this.head;
  const result = Array(this.length).fill(0);
  for (let i = 0; i < this.length; i++) {
    result[i] = currentNode.data;
    currentNode = currentNode.link;
  }
  return result;
};

let LinkList = new LinkedList(); // 수식 값을 입력받을 링크드 리스트

// ---------------------------------------------------------------------------------------------- //
let result = ""; // 연산 입력 전 저장 하는 값

const App = () => {
  const [Num, SetNum] = useState("");
  const [KeyboardText, SetKeyboardText] = useState("");
  const [Word, SetWord] = useState([]);
  const [isBracket, SetIsBracket] = useState(false);
  const [isFile, SetIsFile] = useState(false);
  const [isHistory, SetIsHistory] = useState(false);

  const calculate = () => {
    // stack : 스택으로 사용할 배열(리스트)를 선언
    let stack = [];
    // convert : 후위표기식으로 변환된 결과를 저장할 배열(리스트)
    let convert = [];
    // temp : 두자릿수 이상의 숫자를 저장할 임시 변수
    let temp = "";

    // prec : 연산자와 괄호의 우선순위를 반환하는 함수
    function prec(op) {
      switch (op) {
        case "(": // 괄호
        case ")":
          return 0;
        case "~": // bit NOT
          return 1;
        case "-": // 더하기/빼기
        case "+":
          return 2;
        case "*": // 곱/나눗셈
        case "/":
          return 3;
        case "&": // bit AND
          return 4;
        case "^": // bit XOR
          return 5;
        case "|": // bit OR
          return 6;
      }
      return 999;
    }

    // f : 계산할 괄호가 있는 식
    let f = Num;

    // f에 공백이 있다면 모두 제거
    f = f.replace(/(\s*)/g, "");
    // 중위 표기식 => 후위 표기식 변환 과정
    for (let i = 0; i < f.length; i++) {
      const char = f.charAt(i);
      switch (char) {
        case "(":
          stack.push(char);
          break;
        case "~":
        case "&":
        case "^":
        case "|":
        case "+":
        case "-":
        case "*":
        case "/":
          // 스택이 비어있지 않는경우 현재의 연산자와 top의 우선순위를 비교
          while (
            stack[stack.length - 1] != null &&
            prec(char) <= prec(stack[stack.length - 1])
          ) {
            // 현재 연산자의 우선순위가 낮거나 같으면 temp에 pop한 값을 저장
            temp += stack.pop();
            // 다음에 연산자가 나오는 경우 temp를 convert에 push 해 줌.
            if (isNaN(stack[stack.length - 1])) {
              convert.push(temp);
              temp = "";
            }
          }
          stack.push(char);
          break;
        case ")":
          let returned_op = stack.pop();
          while (returned_op != "(") {
            temp += returned_op;
            returned_op = stack.pop();
            if (isNaN(stack[stack.length - 1])) {
              convert.push(temp);
              temp = "";
            }
          }
          break;
        default:
          temp += char;
          if (isNaN(f.charAt(i + 1)) || i + 1 == f.length) {
            convert.push(temp);
            temp = "";
          }
          break;
      }
    }

    while (stack.length != 0) {
      convert.push(stack.pop());
    }

    let example_result = "";
    for (let i in convert) {
      example_result += convert[i];
      example_result += " ";
    }

    // console.log(f); // 받아온 식
    // console.log(example_result); // 후위표기식 변경

    for (let i in convert) {
      // 숫자인 경우 스택에 푸쉬해준다.
      if (!isNaN(convert[i])) {
        stack.push(convert[i]);
      }
      // 숫자가 아닌(연산자인) 경우 스택에서 두 값을 pop한다.
      // 그리고 계산 결과를 다시 stack에 push한다.
      else {
        const b = parseFloat(stack.pop());
        const a = parseFloat(stack.pop());
        switch (convert[i]) {
          case "~":
            stack.push(~b);
            break;
          case "&":
            stack.push(a & b);
            break;
          case "^":
            stack.push(a ^ b);
            break;
          case "|":
            stack.push(a | b);
            break;
          case "+":
            stack.push(a + b);
            break;
          case "-":
            stack.push(a - b);
            break;
          case "*":
            stack.push(a * b);
            break;
          case "/":
            stack.push(a / b);
            break;
        }
      }
    }
    SetWord([...Word, f + "=" + stack]);
    result = stack;
    SetNum(stack);
  };

  const handlerNum = (e) => {
    if (e === "Bracket") {
      SetIsBracket(!isBracket);
      if (isBracket) result += "(";
      else result += ")";
    } else {
      result += e;
    }
    SetNum(result);
  };

  const handlerReset = () => {
    SetNum("");
    result = "";
  };

  const handlerDelete = () => {
    result = result.slice(0, result.length - 1);
    SetNum(result);
  };

  const handlerSave = () => {
    let data = JSON.stringify();
  };

  // 로컬 파일 가져와 읽기
  const handlerLoading = async () => {
    // AsyncStorage set 함수 모듈
    if (!isFile) {
      await AsyncStorage.setItem("text", Num, () => {
        Alert.alert("수식 저장 완료");
      });
    } else {
      // GetItem으로 파일 로딩하기
      const response = await AsyncStorage.getItem("text", (err, result) => {
        SetNum(result);
        Alert.alert("수식 불러오기 완료");
      });
    }
    SetIsFile(!isFile);
  };

  const handlerHistorySave = async () => {
    if (!isHistory) {
      await AsyncStorage.setItem("history", JSON.stringify(Word), () => {
        Alert.alert("히스토리 저장 완료");
        SetWord([]);
      });
    } else {
      // GetItem으로 파일 로딩하기
      const response = await AsyncStorage.getItem("history", (err, result) => {
        const result_ = JSON.parse(result);
        SetWord(result_);
        Alert.alert("히스토리 불러오기 완료");
      });
    }
    SetIsHistory(!isHistory);
  };

  return (
    <View style={styles.allBody}>
      <Text style={styles.top}>{Num}</Text>
      <TextInput
        style={styles.bottom}
        onChange={(e) => {
          SetNum(e.nativeEvent.text);
        }}
        placeholder="연산을 입력해주세요..."
        value={Num}
        onSubmitEditing={Keyboard.dismiss}
      />
      {/* <Text style={styles.top}>
      </Text> */}
      <View style={styles.body}>
        <View style={styles.inBody}>
          <TouchableOpacity onPress={handlerReset} style={styles.numTouch}>
            <Text style={styles.numSmall}>Re</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("Bracket")}
            style={styles.numTouch}
          >
            <Text style={styles.numSmall}>{isBracket ? "(" : ")"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("%")}
            style={styles.numTouch}
          >
            <Text style={styles.numSmall}>mod</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("/")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>/</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.inBody}>
          <TouchableOpacity
            onPress={() => handlerNum("1")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlerNum("2")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlerNum("3")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>3</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlerNum("+")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.inBody}>
          <TouchableOpacity
            onPress={() => handlerNum("4")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("5")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("6")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>6</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlerNum("-")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.inBody}>
          <TouchableOpacity
            onPress={() => handlerNum("7")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("8")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("9")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("*")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>*</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.inBody}>
          <TouchableOpacity onPress={handlerDelete} style={styles.numTouch}>
            <Text style={styles.numSmall}>Del</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("0")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlerLoading} style={styles.numTouch}>
            <Text style={styles.num}>{isFile ? "File LD" : "File SV"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={calculate} style={styles.numTouch}>
            <Text style={styles.num}>=</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* 비트 연산 버튼 */}
      <View style={styles.body}>
        <View style={styles.inBody}>
          <TouchableOpacity
            onPress={() => handlerNum("&")}
            style={styles.numTouch}
          >
            <Text style={styles.numSmall}>AND</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("|")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>OR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handlerNum("~")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>NOT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handlerNum("^")}
            style={styles.numTouch}
          >
            <Text style={styles.num}>XOR</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.TitleText}>History 목록</Text>
      {}
      <Button
        style={styles.TitleText}
        onPress={handlerHistorySave}
        title={!isHistory ? "저장" : "불러오기"}
      />
      <View style={styles.mini}>
        <FlatList
          data={Word}
          renderItem={({ item }) => <Text style={styles.numMini}>{item}</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  allBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    padding: 20,
  },

  body: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "stretch",
    fontSize: 10,
  },

  mini: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "skyblue",
    borderWidth: 2,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    borderBottomColor: "#e4e4e4",
  },

  inBody: {
    flexDirection: "row",
  },

  // 숫자 계산판
  top: {
    flex: 1,
    borderWidth: 2,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    borderBottomColor: "#e4e4e4",
    textAlign: "left",
    textAlignVertical: "center",
    fontSize: 30,
    marginTop: 20,
    paddingRight: 20,
  },

  bottom: {
    flex: 0.3,
    borderWidth: 2,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    borderBottomColor: "#e4e4e4",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
  },

  num: {
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 25,
    borderWidth: 1,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    borderBottomColor: "#e4e4e4",
  },

  numTouch: {
    flex: 1,
    borderWidth: 1,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    borderBottomColor: "#e4e4e4",
  },

  numSmall: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
    paddingTop: 5,
  },

  numMini: {
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 15,
  },

  TitleText: {
    textAlign: "center",
    backgroundColor: "white",
    padding: 5,
    borderWidth: 2,
    borderTopColor: "white",
    borderLeftColor: "white",
    borderRightColor: "white",
    borderBottomColor: "#e4e4e4",
  },
});
export default App;
