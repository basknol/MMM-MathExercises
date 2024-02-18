/* Magic Mirror
 * Module: MMM-MathExercises
 *
 * By Bas Knol
 * MIT Licensed.
 */
 
Module.register("MMM-MathExercises", {
    // Default module config.
    defaults: {
        debugMode: false,
        showInputMenu: true,
        maxRandomValue: 10,
        numberOfExercises: 10,
        answerWithPositiveNumberOnly: true
    },

    start: async function () {
        Log.log(this.name + ' is started!');

        //this.loaded = false;
        this.debugMode = this.config.debugMode;
        this.sendSocketNotification("SET_CONFIG", this.config);

        if (this.config.debugMode) {
            this.listenForKeyBoardInput();
        }

        this.setDefaults();

        if (!this.config.showInputMenu) {
            this.generateExcercise();
        }
    },

    setDefaults: function () {
        this.exercises = [];
        this.resetCounters();
        this.resetMenuInput();
        this.showMenu = this.config.showInputMenu;
        this.summaryIsShown = false;
    },

    getScripts: function () {
        return [];
    },

    getStyles: function () {
        return [
            "MMM-MathExcercises.css",
        ];
    },

    // Override dom generator.
    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "math-exercises";

        if (this.showMenu) {
            wrapper.className = "math-excercises-menu";
            wrapper.innerHTML = "Kies type oefening:<br /><ol><li>Plus</li><li>Min</li><li>Keer</li><li>Delen</li><li>Gemengd</li></ol>";
        } else if (this.showMultiplyMenu) {
            wrapper.className = "math-multiply-menu";
            wrapper.innerHTML = "Kies vermenigvuldigings oefening:<br /><ol><li>Tafel op volgorde</li><li>Tafel door elkaar</li><li>Tafels 1-10 door elkaar</li><li>Geen tafels</li></ol>";
        } else if (this.showMultiplyTableMenu) {
            var multiplyTableMenu = [];
            for (var i = 1; i <= 10; i++) {
                multiplyTableMenu.push(`<li>Tafel van ${i}</li>`);
            }
            wrapper.className = "math-multiply-table-menu";
            wrapper.innerHTML += `<ol>${multiplyTableMenu.join("")}</ol>`;
        } else if (this.summaryIsShown) {
            wrapper.className = "math-excercises-summary";
            wrapper.innerHTML += `${this.currentExcercise}<br /><ol>${this.exercises.join("")}</ol>`;
        } else {
            wrapper.innerHTML = this.currentExcercise;
        }

        return wrapper;
    },

    resetCounters: function () {
        this.exerciseCounter = 0;
        this.correctCounter = 0;
        this.multiplyOperand1 = 0;
        this.multiplyTracker = null;
    },

    resetMenuInput: function () {
        this.operatorTypeIndex = null;
        this.multiplyTypeIndex = null;
        this.multiplyTableNumber = null;        
    },

    listenForKeyBoardInput: function () {
        document.addEventListener("keydown", (event) => {
            this.handleKeyEvent(event.key);
        });
    },

    handleKeyEvent: function (key) {
        if (this.showMenu) {
            this.handleMenuKeyEvent(key);
        } else if (this.showMultiplyMenu) {
            this.handleMultipleMenuKeyEvent(key);
        } else if (this.showMultiplyTableMenu) {
            this.handleMultiplyTableMenuKeyEvent(key);
        } else {
            this.handleExerciseKeyEvent(key);
        }

        this.updateDom();      
    },

    handleMenuKeyEvent: function (key) {
        var keyInt = parseInt(key);
        if (!isNaN(keyInt) && keyInt >= 1 && keyInt <= 5) {
            // 0: add
            // 1: subtract
            // 2: multiply
            // 3: divide
            // 4: mixed
            this.operatorTypeIndex = --keyInt;
        }
                
        this.showMenu = false;
        this.showMultiplyMenu = this.operatorTypeIndex === 2;
        if (!this.showMultiplyMenu) {
            this.generateExcercise();
        }
        this.updateDom();
    },

    handleMultipleMenuKeyEvent: function (key) {
        var keyInt = parseInt(key);
        if (!isNaN(keyInt) && keyInt >= 1 && keyInt <= 4) {
            this.multiplyTypeIndex = --keyInt;
        }
        this.showMultiplyMenu = false;
        this.showMultiplyTableMenu = this.multiplyTypeIndex === 0 || this.multiplyTypeIndex === 1;
        if (!this.showMultiplyTableMenu) {
            this.generateExcercise();
        }
        this.updateDom();
    },

    handleMultiplyTableMenuKeyEvent: function (key) {
        var keyInt = parseInt(key);
        if (!isNaN(keyInt) && keyInt >= 0 && keyInt <= 9) {
            if (keyInt === 0) {
                this.multiplyTableNumber = 10;
            } else {
                this.multiplyTableNumber = keyInt;
            }
        }
        this.showMultiplyTableMenu = false;
        this.generateExcercise();
        this.updateDom();
    },

    handleExerciseKeyEvent: function (key) {        
        if ((this.summaryIsShown && key === "Enter") || key === "Escape") {
            this.setDefaults();
            return;
        } else if (key === "Enter") {
            this.validateExcercise();
        } else if (key === "Backspace") {
            this.input = this.input.slice(0, -1);
            this.updateExcercise();
        } else if (!isNaN(key)) {
            this.input += key;
            this.updateExcercise();
        }
    },

    generateExcercise: function () {
        var operand1 = this.getOperand1();
        var operand2 = this.getOperand2();
        var operatorType = this.getOperatorType();

        this.question = operand1 + operatorType + operand2;
        this.answer = eval(this.question);
        if ((parseInt(this.answer) < 0 && this.config.answerWithPositiveNumberOnly) || !Number.isInteger(this.answer)) {
            this.generateExcercise();
        } else {
            this.input = "";
            this.exerciseCounter++;

            this.currentExcercise = this.question + " = ?";
        }
    },

    getOperand1: function () {
        if (this.multiplyTypeIndex === 0) {
            this.multiplyOperand1 ??= 1;
            return ++this.multiplyOperand1;
        } else if (this.multiplyTypeIndex === 1) {            
            this.multiplyTracker ??= Array.from(Array(10).keys(), item => item + 1);
            var newOperand1 = this.getRandomValueFromArray(this.multiplyTracker);
            this.removeValueFromArray(this.multiplyTracker, newOperand1);            
            return newOperand1;
        } else {
            return this.getRandomInt();
        }
    },

    getOperand2: function () {
        if (this.operatorTypeIndex === 3) {
            do {
                var newOperand2 = this.getRandomInt();
            }
            while (newOperand2 === 0);
            return newOperand2;
        }

        return this.multiplyTableNumber ? this.multiplyTableNumber : this.getRandomInt();
    },

    getRandomInt: function (maxRandomValue) {
        maxRandomValue ??= this.config.maxRandomValue;
        return Math.floor(Math.random() * maxRandomValue) + 1;
    },

    getOperatorType: function (index) {
        index ??= this.operatorTypeIndex;

        switch (index) {
            case 0:
                return " + ";
            case 1:
                return " - ";
            case 2:
                return " * ";
            case 3:
                return " / ";
            case 4:
            default:
                var index = Math.round(Math.random() * 5);
                return this.getOperatorType(index);
        }
    },

    updateExcercise: function () {
        this.currentExcercise = this.question + " = " + this.input;
    },

    validateExcercise: function () {        
        if (parseInt(this.answer) === parseInt(this.input)) {
            console.log("Correct!");
            this.correctCounter++;
            this.exercises.push(`<li class="correct">${this.currentExcercise} (goed)</li>`);
        } else {
            console.log("Incorrect!");
            this.exercises.push(`<li class="incorrect">${this.currentExcercise} (fout)</li>`);
        }  

        if (this.exerciseCounter === this.config.numberOfExercises && !this.currentExcercise.startsWith("Total")) {
            console.log("Total: " + this.exerciseCounter + " Correct: " + this.correctCounter + " Incorrect: " + (this.exerciseCounter - this.correctCounter));
            this.currentExcercise = "Totaal: " + this.exerciseCounter + " Goed: " + this.correctCounter + " Fout: " + (this.exerciseCounter - this.correctCounter);
            this.summaryIsShown = true;
        } else {
            this.generateExcercise();
        }
    },

    removeValueFromArray: function (array, valueToRemove) {
        var index = array.indexOf(valueToRemove);
        if(index !== -1) {
            array.splice(index, 1);
        }
        return array;
    },

    getRandomValueFromArray: function (array) {        
        var randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    },
  
    socketNotificationReceived: function (notification, payload) {
    	Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
    },
});