//Budget Controller
var budgetController = (function () {

    var Expenses = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }


    var Income = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
    }


    var calculateTotal = function (type) {

        var sum = 0;

        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });

        data.total[type] = sum;
    }


    Expenses.prototype.calcpercentages = function (totalInc) {

        if (totalInc > 0)
            this.percentage = Math.round((this.value / totalInc) * 100);
        else
            this.percentage = -1;
    };


    Expenses.prototype.getCalcPerce = function () {
        return this.percentage;
    };


    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        total: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: -1
    }

    return {

        addItem: function (type, desc, val) {

            var newItem, ID;
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            if (type === 'inc')
                newItem = new Income(ID, desc, val);
            else if (type === 'exp')
                newItem = new Expenses(ID, desc, val);

            data.allItems[type].push(newItem);

            return newItem;
        },


        deleteItem: function (type, id) {

            var ids, index;

            ids = data.allItems[type].map(function (cur) {
                return (cur.id);
            });

            index = ids.indexOf(id);

            if (index !== -1)
                data.allItems[type].splice(index, 1);
            console.log(data.allItems[type]);
        },


        calculateBudget: function () {

            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.total.inc - data.total.exp;
            if (data.total.inc > 0)
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            else
                data.percentage = -1;
        },


        calculatePerc: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcpercentages(data.total.inc);
            });
        },


        getCalculatePerc: function () {

            var perc = data.allItems.exp.map(function (cur) {
                return cur.getCalcPerce();
            });

            return perc;
        },


        getBudget: function () {

            return {
                displayPerc: data.percentage,
                displayBudget: data.budget,
                displayTotalInc: data.total.inc,
                displayTotalExp: data.total.exp
            };
        }
    };



})();


//UI Controller
var uiController = (function () {

    var uiStrings = {

        typeString: '.add__type',
        descstring: '.add__description',
        valueString: '.add__value',
        btnString: '.add__btn',
        incString: '.income__list',
        expString: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        percesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumbers = function (num, type) {

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3) + '.' + dec;
        }

        if (num === '0.00')
            return ' ' + int;
        else
            return (type === 'inc' ? '+' : '-') + ' ' + int;

    };
    
    
    var forEachNode = function (list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };



    return {

        getInput: function () {

            return {
                type: document.querySelector(uiStrings.typeString).value,
                desc: document.querySelector(uiStrings.descstring).value,
                value: parseFloat(document.querySelector(uiStrings.valueString).value)
            };
        },


        getUiStrings: function () {
            return uiStrings;
        },


        addItemToUi: function (newItem, type) {

            var html, element;

            if (type === 'exp') {
                element = uiStrings.expString;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'inc') {
                element = uiStrings.incString;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            html = html.replace('%id%', newItem.id);
            html = html.replace('%description%', newItem.description);
            html = html.replace('%value%', formatNumbers(newItem.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
            //Clear fields
            document.querySelector(uiStrings.valueString).value = "";
            document.querySelector(uiStrings.descstring).value = "";
            document.querySelector(uiStrings.descstring).focus();

        },


        removeItem: function (id) {

            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },


        displayBudget: function (obj) {

            var type;

            if (obj.displayBudget < 0)
                type = 'exp';
            else
                type = 'inc';

            document.querySelector(uiStrings.budgetLabel).textContent = formatNumbers(obj.displayBudget, type);
            document.querySelector(uiStrings.incomeLabel).textContent = formatNumbers(obj.displayTotalInc, type);
            document.querySelector(uiStrings.expensesLabel).textContent = formatNumbers(obj.displayTotalExp, type);

            if (obj.displayPerc > 0)
                document.querySelector(uiStrings.percentageLabel).textContent = obj.displayPerc + '%';
            else
                document.querySelector(uiStrings.percentageLabel).textContent = '---';
        },


        displayPerc: function (percentage) {

            var fields = document.querySelectorAll(uiStrings.percesLabel);

            forEachNode(fields, function (current, index) {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                    console.log(current.textContent);
                } else
                    current.textContent = '---';

            });
        },


        date: function () {

            var now, year, month, monthes;

            now = new Date();
            year = now.getFullYear() - 621;
            months = ["Bahman", "Esfand", "Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar", "Mehr", "Aban", "Azar", "Dey"];
            month = now.getMonth();

            if (month < 1)
                year--;

            document.querySelector(uiStrings.dateLabel).textContent = months[month] + '  ' + year;
        },


        changeType: function () {

            var fields = document.querySelectorAll(uiStrings.typeString + ',' + uiStrings.valueString + ',' + uiStrings.descstring);
            
            forEachNode(fields,function(cur){
               cur.classList.toggle('red-focus');               
            });
            
            document.querySelector(uiStrings.btnString).classList.toggle('red');
        }
    };
})();


//Global Controller
var controller = (function (budgetCntrl, uiCntrl) {

    var eventListener = function () {
        var getUiStrings = uiCntrl.getUiStrings();
        document.querySelector(getUiStrings.btnString).addEventListener('click', addNewItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13)
                addNewItem();
        });
        document.querySelector(getUiStrings.container).addEventListener('click', cntrldeleteItem);
        document.querySelector(getUiStrings.typeString).addEventListener('change',uiCntrl.changeType);
    };

    var updateBudget = function () {
        //4. Calculate budget
        budgetCntrl.calculateBudget();
        //5. return the budget
        var budget = budgetCntrl.getBudget();
        //6. update Budget UI
        uiCntrl.displayBudget(budget);
    };

    var addNewItem = function () {
        var ui, budget;
        //1. Get input
        ui = new uiCntrl.getInput();

        if (ui.desc !== "" && !isNaN(ui.value) && ui.value > 0) {
            //2. Add item to budget controller
            budget = new budgetCntrl.addItem(ui.type, ui.desc, ui.value);
            //3. Add item to UI
            item = new uiCntrl.addItemToUi(budget, ui.type);
            //4.update budget
            updateBudget();
            updatePercentages();
        }
    };

    var cntrldeleteItem = function (event) {
        var containerEvent, containerEventSplit, type, id;
        containerEvent = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (containerEvent) {
            containerEventSplit = containerEvent.split('-');
            type = containerEventSplit[0];
            id = parseInt(containerEventSplit[1]);
            budgetCntrl.deleteItem(type, id);
            uiCntrl.removeItem(containerEvent);
            updateBudget();
            updatePercentages();
        }
    };

    var updatePercentages = function () {

        budgetCntrl.calculatePerc();
        var percentages = budgetCntrl.getCalculatePerc();
        uiCntrl.displayPerc(percentages);
    };

    return {

        init: function () {

            uiCntrl.displayBudget({
                displayPerc: -1,
                displayBudget: 0,
                displayTotalInc: 0,
                displayTotalExp: 0
            });
            uiCntrl.date();
            eventListener();
        }
    };
})(budgetController, uiController);

controller.init();
